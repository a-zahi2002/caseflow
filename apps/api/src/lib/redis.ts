import Redis from 'ioredis'
import { config } from './config.js'

// ─── Redis Client (optional, graceful degradation) ───────────────────

let redis: Redis | null = null

if (config.REDIS_URL) {
  try {
    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
    await redis.connect()
    console.log('✅ Redis connected')
  } catch (err) {
    console.warn('⚠️  Redis connection failed, using in-memory fallback:', err)
    redis = null
  }
} else {
  console.warn('⚠️  REDIS_URL not set — using in-memory fallback (no rate limiting, no leaderboard cache)')
}

export { redis }

// ─── In-memory fallback for OTP storage ──────────────────────────────

const memoryStore = new Map<string, { value: string; expiresAt: number }>()

export async function setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (redis) {
    await redis.set(key, value, 'EX', ttlSeconds)
  } else {
    memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }
}

export async function getKey(key: string): Promise<string | null> {
  if (redis) {
    return redis.get(key)
  }
  const entry = memoryStore.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key)
    return null
  }
  return entry.value
}

export async function deleteKey(key: string): Promise<void> {
  if (redis) {
    await redis.del(key)
  } else {
    memoryStore.delete(key)
  }
}

// ─── Redis health check ──────────────────────────────────────────────

export async function redisHealthCheck(): Promise<{ connected: boolean; latencyMs?: number }> {
  if (!redis) return { connected: false }
  try {
    const start = Date.now()
    await redis.ping()
    return { connected: true, latencyMs: Date.now() - start }
  } catch {
    return { connected: false }
  }
}
