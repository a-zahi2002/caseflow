import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { app, injectWebSocket } from './lib/ws.js'
import { config } from './lib/config.js'
import { AppError } from './lib/errors.js'
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
