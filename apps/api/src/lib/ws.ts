import { createNodeWebSocket } from '@hono/node-ws'
import type { Hono } from 'hono'

let realApp: Hono<any, any, any> | null = null

export function setRealApp(app: Hono<any, any, any>) {
  realApp = app
}

// Proxy app wrapper to delegate requests to the real app once initialized
const proxyApp = {
  request(url: any, initEnv: any, env: any) {
    if (!realApp) {
      throw new Error('WebSocket proxy app: real app is not registered yet.')
    }
    return realApp.request(url, initEnv, env)
  }
} as any

export const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({
  app: proxyApp
})
