import { prisma } from './client.js'
import { hash } from 'bcryptjs'

async function main() {
  console.log('Testing hash...')
  const h = await hash('test', 12)
  console.log('Hash:', h)
  console.log('Testing prisma...')
  const users = await prisma.user.findMany()
  console.log('Users count:', users.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
