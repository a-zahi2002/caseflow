import { Hono } from 'hono'
import type { AppEnv } from '../types.js'
export const progressRouter = new Hono<AppEnv>()
