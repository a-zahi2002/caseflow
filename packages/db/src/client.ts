import { PrismaClient } from './generated/client/index.js'

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined
}

const createClient = () =>
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  })

// Singleton with HMR safety
export const prisma = globalForPrisma.__prisma ?? createClient()

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.__prisma = prisma
}

// Extended client with soft-delete filtering
export const xprisma = prisma.$extends({
  query: {
    userProfile: {
      findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
    case: {
      findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
    attempt: {
      findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
  },
})
