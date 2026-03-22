import { Hono } from 'hono'
import type { AppEnv } from '../types.js'
export const casesRouter = new Hono<AppEnv>()
