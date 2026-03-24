import { prisma } from './client.js'

async function check() {
  const cases = await prisma.case.findMany({
    include: { author: true }
  })
  console.log('Cases found:', cases.length)
  for (const c of cases) {
    console.log(`- ID: ${c.id}, Title: ${c.title}, Status: ${c.status}`)
  }
}

check().then(() => prisma.$disconnect())
