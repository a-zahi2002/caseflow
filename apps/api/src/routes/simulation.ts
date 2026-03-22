import { Hono } from 'hono'
import type { AppEnv } from '../types.js'
export const simulationRouter = new Hono<AppEnv>()
