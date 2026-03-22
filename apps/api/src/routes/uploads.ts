import { Hono } from 'hono'
import type { AppEnv } from '../types.js'
export const uploadsRouter = new Hono<AppEnv>()
