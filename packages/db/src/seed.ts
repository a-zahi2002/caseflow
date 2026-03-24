import { prisma } from './client.js'

async function main() {
  // Create a test educator
  const educator = await prisma.user.upsert({
    where: { email: 'educator@caseflow.dev' },
    update: {},
    create: {
      name: 'Dr. Test Educator',
      email: 'educator@caseflow.dev',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ9Z5Z5Z5',
      role: 'educator',
    },
  })

  // Create a starter case
  const case1 = await prisma.case.upsert({
    where: { id: 'seed-case-001' },
    update: {},
    create: {
      id: 'seed-case-001',
      authorId: educator.id,
      title: 'Acute Chest Pain',
      specialty: 'Cardiology',
      difficulty: 'intermediate',
      status: 'published',
      timeLimit: 30,
      tags: ['chest pain', 'STEMI', 'emergency'],
      patientPersona: {
        age: 52,
        sex: 'male',
        presentingComplaint: 'crushing chest pain for the last 2 hours',
        background: 'Known hypertensive, smoker, works as a bus driver',
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'history',
            content: 'Take a focused history from the patient',
            expectedFindings: {
              keyPoints: [
                'Onset and duration of pain',
                'Character and radiation of pain',
                'Associated symptoms — sweating, nausea, shortness of breath',
                'Cardiac risk factors — hypertension, smoking, diabetes, family history',
              ],
              redFlags: ['Radiation to left arm or jaw', 'Diaphoresis', 'Syncope'],
            },
          },
          {
            order: 2,
            type: 'examination',
            content: 'Perform a focused cardiovascular examination',
            expectedFindings: {
              keyPoints: [
                'Vital signs — BP, HR, RR, O2 sat',
                'Cardiovascular examination',
                'Chest examination',
              ],
              redFlags: ['Hypotension', 'Tachycardia', 'Signs of heart failure'],
            },
          },
          {
            order: 3,
            type: 'investigation',
            content: 'Order appropriate investigations',
            expectedFindings: {
              keyPoints: ['12-lead ECG', 'Troponin', 'FBC, UEC, coagulation', 'Chest X-ray'],
              redFlags: ['ST elevation on ECG', 'Elevated troponin'],
            },
          },
          {
            order: 4,
            type: 'diagnosis',
            content: 'State your diagnosis and differential diagnoses',
            expectedFindings: {
              keyPoints: ['STEMI as primary diagnosis', 'Differentials — NSTEMI, aortic dissection, PE'],
              redFlags: [],
            },
          },
          {
            order: 5,
            type: 'management',
            content: 'Outline your immediate management plan',
            expectedFindings: {
              keyPoints: [
                'Aspirin 300mg',
                'Oxygen if sats below 94%',
                'IV access and bloods',
                'Activate cath lab for primary PCI',
                'Morphine and antiemetic for pain',
              ],
              redFlags: [],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Seed complete:', { educator: educator.email, case: case1.title })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
