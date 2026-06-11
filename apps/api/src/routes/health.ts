import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { success } from '../lib/response.js'
import { config } from '../lib/config.js'
import { redisHealthCheck } from '../lib/redis.js'
import { getAIProvider } from '@caseflow/ai'

export const healthRouter = new Hono()

// GET /api/health
healthRouter.get('/', (c) => {
  return success(c, { status: 'ok', timestamp: new Date().toISOString() })
})

// GET /api/health/db
healthRouter.get('/db', async (c) => {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    return success(c, { connected: true, latencyMs: Date.now() - start })
  } catch {
    return success(c, { connected: false })
  }
})

// GET /api/health/ai
healthRouter.get('/ai', async (c) => {
  try {
    const provider = getAIProvider()
    const reachable = await provider.healthCheck()
    return success(c, {
      provider: provider.name,
      model: config.OLLAMA_MODEL,
      reachable,
    })
  } catch {
    return success(c, { provider: config.AI_PROVIDER, reachable: false })
  }
})

// GET /api/health/redis
healthRouter.get('/redis', async (c) => {
  const health = await redisHealthCheck()
  return success(c, health)
})
