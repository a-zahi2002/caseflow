import { Hono } from 'hono'
import type { AppEnv } from '../types.js'
export const discussionsRouter = new Hono<AppEnv>()
