import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
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

const app = new Hono<AppEnv>()

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: config.CORS_ORIGIN,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', env: config.NODE_ENV }))

// Routes
app.route('/auth', authRouter)
app.route('/cases', casesRouter)
app.route('/simulation', simulationRouter)
app.route('/uploads', uploadsRouter)
app.route('/progress', progressRouter)
app.route('/discussions', discussionsRouter)

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
serve(
  { fetch: app.fetch, port: config.PORT },
  () => console.log(`🚀 Caseflow API running on http://localhost:${config.PORT}`)
)

export default app
