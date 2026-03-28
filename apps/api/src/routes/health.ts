import { Hono } from 'hono'
import { success } from '../lib/response.js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const healthRouter = new Hono()

healthRouter.get('/', (c) => {
  const pkgPath = join(process.cwd(), 'package.json')
  let version = 'unknown'
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    version = pkg.version
  } catch (err) {
    // ignore
  }

  return success(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
  })
})
