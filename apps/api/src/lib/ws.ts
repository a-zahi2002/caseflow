import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import type { AppEnv } from '../types.js'

export const app = new Hono<AppEnv>()
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
