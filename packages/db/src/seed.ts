import { readFileSync } from 'fs'
import { prisma } from './client.js'
import bcrypt from 'bcryptjs'
const { hash } = bcrypt

async function main() {
  // Create test educator
  const passwordHash = await hash('password123', 12)

  const educator = await prisma.user.upsert({
    where: { email: 'educator@caseflow.dev' },
    update: {},
    create: {
      name: 'Dr. Test Educator',
      email: 'educator@caseflow.dev',
      passwordHash,
      role: 'educator',
      institution: 'St. Mary\'s Medical School',
    },
  })

  // Create test student 1
  await prisma.user.upsert({
    where: { email: 'student@caseflow.dev' },
    update: {},
    create: {
      name: 'Sam Student',
      email: 'student@caseflow.dev',
      passwordHash,
      role: 'student',
      institution: 'City Hospital University',
    },
  })

  // Create test student 2 (Zahi)
  await prisma.user.upsert({
    where: { email: 'zahi@caseflow.dev' },
    update: {},
    create: {
      name: 'Zahi',
      email: 'zahi@caseflow.dev',
      passwordHash,
      role: 'student',
      institution: 'Zahi University',
    },
  })

  // Create test admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@caseflow.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@caseflow.dev',
      passwordHash,
      role: 'admin',
      institution: 'Caseflow Platform',
    },
  })

  // Clean up any test cases from development
  await prisma.case.deleteMany({
    where: {
      title: 'New Educator Case',
    },
  })

  // Load cases from JSON
  const casesData = JSON.parse(readFileSync(new URL('./data/cases.json', import.meta.url), 'utf-8'))
  console.log(`Loading ${casesData.length} cases...`)

  for (const caseData of casesData) {
    await prisma.case.upsert({
      where: { id: caseData.id },
      update: {},
      create: {
        id: caseData.id,
        authorId: educator.id,
        title: caseData.title,
        specialty: caseData.specialty,
        difficulty: caseData.difficulty,
        status: 'published',
        timeLimit: caseData.timeLimit,
        tags: caseData.tags,
        patientPersona: {
          name: caseData.name,
          emoji: caseData.emoji,
          age: caseData.age,
          sex: caseData.sex,
          presentingComplaint: caseData.complaint,
          background: caseData.background,
        },
        steps: {
          create: [
            {
              order: 1,
              type: 'history',
              content: 'Take a focused history from the patient',
              expectedFindings: {
                keyPoints: caseData.h_keys || [],
                redFlags: caseData.h_reds || [],
              },
            },
            {
              order: 2,
              type: 'examination',
              content: 'Perform a focused examination',
              expectedFindings: {
                keyPoints: caseData.e_keys || [],
                redFlags: caseData.e_reds || [],
              },
            },
            {
              order: 3,
              type: 'investigation',
              content: 'Order appropriate investigations',
              expectedFindings: {
                keyPoints: caseData.i_keys || [],
                redFlags: caseData.i_reds || [],
              },
            },
            {
              order: 4,
              type: 'diagnosis',
              content: 'State your diagnosis and differential diagnoses',
              expectedFindings: {
                keyPoints: [caseData.dx, ...(caseData.diff || [])],
                redFlags: [],
              },
            },
            {
              order: 5,
              type: 'management',
              content: 'Outline your immediate management plan',
              expectedFindings: {
                keyPoints: caseData.m_keys || [],
                redFlags: caseData.m_reds || [],
              },
            },
          ],
        },
      },
    })
  }

  console.log(`✅ Seed complete — Created Educator, Student, and Admin test accounts and ${casesData.length} cases`)
  console.log('   Educator: educator@caseflow.dev | password123')
  console.log('   Student:  student@caseflow.dev  | password123')
  console.log('   Student:  zahi@caseflow.dev     | password123')
  console.log('   Admin:    admin@caseflow.dev    | password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
