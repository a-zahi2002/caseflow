import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'

// Create a dummy app just to initialize the websocket factory
const app = new Hono()
export const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })
