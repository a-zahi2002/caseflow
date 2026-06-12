import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from './lib/config.js'
import { auth } from './lib/auth.js'
import { AppError } from './lib/errors.js'
import { error } from './lib/response.js'
import { injectWebSocket } from './lib/ws.js'

// Route imports
import { casesRouter } from './routes/cases.js'
import { simulationRouter } from './routes/simulation.js'
import { usersRouter } from './routes/users.js'
import { progressRouter } from './routes/progress.js'
import { discussionsRouter } from './routes/discussions.js'
import { notificationsRouter } from './routes/notifications.js'
import { searchRouter } from './routes/search.js'
import { adminRouter } from './routes/admin.js'
import { healthRouter } from './routes/health.js'
import { analyticsRouter } from './routes/analytics.js'
import { uploadsRouter } from './routes/uploads.js'

const app = new Hono()

// ─── Global Middleware ───────────────────────────────────────────────
app.use('*', logger())

// CORS — must be before auth handler
app.use('*', cors({
  origin: config.FRONTEND_URL,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// ─── better-auth handler ────────────────────────────────────────────
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

// ─── API Routes ──────────────────────────────────────────────────────
app.route('/api/users', usersRouter)
app.route('/api/cases', casesRouter)
app.route('/api/simulation', simulationRouter)
app.route('/api/progress', progressRouter)
app.route('/api/discussions', discussionsRouter)
app.route('/api/notifications', notificationsRouter)
app.route('/api/search', searchRouter)
app.route('/api/admin', adminRouter)
app.route('/api/health', healthRouter)
app.route('/api/analytics', analyticsRouter)
app.route('/api/uploads', uploadsRouter)

// ─── Global Error Handler ────────────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof AppError) {
    return error(c, err.message, err.statusCode, err.code)
  }
  console.error('Unhandled error:', err)
  return error(c, 'Internal server error', 500, 'INTERNAL_ERROR')
})

// ─── 404 Handler ─────────────────────────────────────────────────────
app.notFound((c) => error(c, 'Route not found', 404, 'NOT_FOUND'))

// ─── Start Server ────────────────────────────────────────────────────
const server = serve(
  { fetch: app.fetch, port: config.PORT },
  () => console.log(`🚀 Caseflow API running on http://localhost:${config.PORT}`),
)
injectWebSocket(server)

export type AppType = typeof app
export default app
