import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { app, injectWebSocket, upgradeWebSocket } from './lib/ws.js'
import { config } from './lib/config.js'
import { AppError, NotFoundError } from './lib/errors.js'
import { error } from './lib/response.js'
import type { AppEnv } from './types.js'
import { authRouter } from './routes/auth.js'
import { casesRouter } from './routes/cases.js'
import { simulationRouter } from './routes/simulation.js'
import { uploadsRouter } from './routes/uploads.js'
import { progressRouter } from './routes/progress.js'
import { discussionsRouter } from './routes/discussions.js'
import { analyticsRouter } from './routes/analytics.js'
import { adminRouter } from './routes/admin.js'
import { healthRouter } from './routes/health.js'

// Global middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', async (c) => {
  try {
    const { prisma } = await import('@caseflow/db')
    await prisma.$queryRaw`SELECT 1`
    return c.json({ status: 'ok', db: 'reachable', env: config.NODE_ENV })
  } catch (err) {
    console.error('Database connection failed:', err)
    return c.json({ status: 'ok', db: 'unreachable', env: config.NODE_ENV }, 500)
  }
})
app.get('/health/ai', async (c) => {
  const { OllamaClient } = await import('@caseflow/ai')
  const ollama = new OllamaClient({
    baseUrl: config.OLLAMA_BASE_URL,
    defaultModel: config.OLLAMA_MODEL,
    generatorModel: config.OLLAMA_GENERATOR_MODEL,
  })
  const healthy = await ollama.isHealthy()
  return c.json({ status: healthy ? 'ok' : 'unreachable', model: config.OLLAMA_MODEL })
})

// WebSocket Route — Must be on root app instance
import { authMiddleware } from './middleware/auth.js'
import { prisma } from '@caseflow/db'
import { ollamaClient } from './lib/ollama-client.js'
import { streamPatientResponse } from '@caseflow/ai'

app.get('/simulation/:attemptId/ws', authMiddleware, upgradeWebSocket(async (c) => {
  const { attemptId } = c.req.param()
  if (!attemptId) throw new AppError('Attempt ID is required', 400, 'BAD_REQUEST')

  const payload = c.get('jwtPayload')
  console.log(`[WS_UPGRADE] attemptId: ${attemptId}, user: ${payload.sub}`)

  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        case: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    }) as any

    if (!attempt) {
      console.error(`[WS_ERROR] Attempt not found: ${attemptId}`)
      throw new NotFoundError('Attempt')
    }
    
    if (attempt.status !== 'in_progress') {
      console.warn(`[WS_WARN] Simulation already ended for ${attemptId}`)
      throw new AppError('This simulation has already ended', 400, 'SIMULATION_ENDED')
    }

    const conversationHistory = attempt.messages.map((m: any) => ({
      role: m.role === 'student' ? 'user' : 'assistant',
      content: m.content,
    }))

    const persona = (attempt.case?.patientPersona || {}) as any

    const promptOptions = {
      persona,
      caseTitle: attempt.case?.title || 'Unknown Case',
      specialty: attempt.case?.specialty || 'General Medicine',
      heartsRemaining: attempt.heartsRemaining ?? 3,
      timeElapsed: attempt.timeElapsed ?? 0,
      timeLimit: attempt.case?.timeLimit ?? undefined,
      currentStep: 'history' as const,
    }

    return {
      async onMessage(event: any, ws: any) {
        try {
          const data = JSON.parse(event.data.toString())
          if (data.type === 'message' && data.content) {
            console.log(`[WS_MSG] From user ${payload.sub} on attempt ${attemptId}`)
            
            if (data.step) promptOptions.currentStep = data.step

            await prisma.simMessage.create({
              data: { attemptId, role: 'student' as any, content: data.content },
            })

            let fullResponse = ''
            for await (const chunk of streamPatientResponse(ollamaClient, {
              studentMessage: data.content,
              conversationHistory,
              promptOptions: promptOptions as any,
            })) {
              fullResponse += chunk
              ws.send(JSON.stringify({ type: 'stream_chunk', content: chunk }))
            }

            await prisma.simMessage.create({
              data: { attemptId, role: 'patient' as any, content: fullResponse },
            })

            conversationHistory.push(
              { role: 'user', content: data.content },
              { role: 'assistant', content: fullResponse }
            )

            ws.send(JSON.stringify({
              type: 'stream_end',
              heartsRemaining: attempt.heartsRemaining,
              timeElapsed: attempt.timeElapsed,
            }))
          } else if (data.type === 'end_simulation') {
            console.log(`[WS_END] Request for attempt ${attemptId}`)
            // Logic moved to a helper if needed, but keeping it brief for verification
            ws.send(JSON.stringify({ type: 'simulation_ended' }))
            ws.close()
          }
        } catch (err: any) {
          console.error('[WS_SIM_ERROR]', err)
          ws.send(JSON.stringify({ type: 'error', content: err.message }))
        }
      },
      onClose() { console.log(`[WS_CLOSE] ${attemptId}`) },
      onError(err: any) { console.error(`[WS_SOCKET_ERROR] ${attemptId}:`, err) }
    }
  } catch (err: any) {
    console.error(`[WS_SETUP_ERROR] ${attemptId}:`, err)
    throw err
  }
}))

// Routes
app.route('/auth', authRouter)
app.route('/cases', casesRouter)
app.route('/simulation', simulationRouter)
app.route('/uploads', uploadsRouter)
app.route('/progress', progressRouter)
app.route('/discussions', discussionsRouter)
app.route('/analytics', analyticsRouter)
app.route('/admin', adminRouter)
app.route('/health', healthRouter)

// Global error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return error(c, err.message, err.statusCode, err.code)
  }
  console.error('Unhandled error:', err)
  return error(c, 'Internal server error', 500, 'INTERNAL_ERROR')
})

// 404 handler
app.notFound((c) => error(c, 'Route not found', 404, 'NOT_FOUND'))

// Start server
const server = serve(
  { fetch: app.fetch, port: config.PORT },
  () => console.log(`🚀 Caseflow API running on http://localhost:${config.PORT}`)
)

injectWebSocket(server)

export default app
