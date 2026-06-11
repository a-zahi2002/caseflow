import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Caseflow Database Seed...')

  // 1. Clean up existing (Optional, be careful in prod. We assume dev environment)
  await prisma.attempt.deleteMany()
  await prisma.caseStep.deleteMany()
  await prisma.case.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Users
  console.log('👤 Creating Users...')
  
  // Note: Since we use better-auth, actual authentication users should be created via the auth API.
  // For the seed, we manually insert them into the DB matching the better-auth schema requirements.
  
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin_user_id_123',
      name: 'System Admin',
      email: 'admin@caseflow.local',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        create: {
          role: 'ADMIN',
          xp: 10000,
          level: 50,
        }
      }
    }
  })

  const educatorUser = await prisma.user.create({
    data: {
      id: 'educator_user_id_456',
      name: 'Dr. Gregory House',
      email: 'house@caseflow.local',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        create: {
          role: 'EDUCATOR',
          institution: 'Princeton-Plainsboro Teaching Hospital',
          specialties: ['Infectious Disease', 'Nephrology'],
        }
      }
    }
  })

  const studentUser = await prisma.user.create({
    data: {
      id: 'student_user_id_789',
      name: 'JD Dorian',
      email: 'jd@caseflow.local',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        create: {
          role: 'STUDENT',
          institution: 'Sacred Heart',
          specialties: ['Internal Medicine'],
          xp: 450,
          level: 3,
        }
      }
    }
  })

  // 3. Create sample cases
  console.log('🩺 Creating Clinical Cases...')

  const case1 = await prisma.case.create({
    data: {
      title: 'Acute Chest Pain in a 55-year-old Male',
      description: 'A classic presentation of a potentially life-threatening cardiac event. Evaluate the patient, order the right ECGs, and decide on reperfusion therapy.',
      specialty: 'Cardiology',
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      estimatedMinutes: 15,
      learningObjectives: [
        'Recognize the typical presentation of STEMI.',
        'Prioritize initial stabilizing interventions (MONA).',
        'Identify indications for immediate catheterization.'
      ],
      patientName: 'Arthur Pendelton',
      patientAge: 55,
      patientGender: 'Male',
      chiefComplaint: '"It feels like an elephant is sitting on my chest."',
      patientBackground: 'History of hypertension, hyperlipidemia, and a 30-pack-year smoking history. No prior MI. Takes lisinopril and atorvastatin.',
      personalityTraits: ['Anxious', 'Diaphoretic', 'Short of breath'],
      authorId: educatorUser.id,
      totalAttempts: 12,
      steps: {
        create: [
          {
            order: 0,
            name: 'Initial Assessment',
            expectedFindings: [
              'Ask about pain radiation (e.g. to jaw or arm).',
              'Ask about associated symptoms like nausea or sweating.',
              'Order a 12-lead ECG immediately.'
            ],
            criticalErrors: [
              'Sending the patient home without an ECG.',
              'Giving GI cocktails before ruling out cardiac ischemia.'
            ],
            revealedData: 'The 12-lead ECG shows 3mm ST-segment elevations in leads V2-V4. Troponin is pending. BP is 150/90, HR 105.'
          },
          {
            order: 1,
            name: 'Intervention & Triage',
            expectedFindings: [
              'Administer Aspirin 324mg chewed.',
              'Activate the Cath Lab for primary PCI.',
              'Give sublingual nitroglycerin (if BP tolerates).'
            ],
            criticalErrors: [
              'Delaying Cath Lab activation for lab results.',
              'Giving NSAIDs (other than Aspirin) for pain.'
            ],
            revealedData: 'The Cath Lab is activated. The patient\'s pain improves slightly after nitroglycerin. Cardiology accepts the patient for immediate PCI.'
          }
        ]
      }
    }
  })

  console.log(`✅ Seed Complete! Created 3 Users and 1 Case.`)
  console.log(`Admin: ${adminUser.email}`)
  console.log(`Educator: ${educatorUser.email}`)
  console.log(`Student: ${studentUser.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
