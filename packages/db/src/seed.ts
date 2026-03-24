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
    },
  })

  // Clean up any test cases from development
  await prisma.case.deleteMany({
    where: {
      title: 'New Educator Case',
    },
  })

  // Case 1 — Acute Chest Pain (already seeded, upsert)
  await prisma.case.upsert({
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
              keyPoints: ['Vital signs', 'Cardiovascular examination', 'Chest examination'],
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

  // Case 2 — Diabetic Ketoacidosis
  await prisma.case.upsert({
    where: { id: 'seed-case-002' },
    update: {},
    create: {
      id: 'seed-case-002',
      authorId: educator.id,
      title: 'Diabetic Ketoacidosis',
      specialty: 'Endocrinology',
      difficulty: 'intermediate',
      status: 'published',
      timeLimit: 35,
      tags: ['DKA', 'diabetes', 'emergency', 'metabolic'],
      patientPersona: {
        age: 19,
        sex: 'female',
        presentingComplaint: 'vomiting and feeling very unwell for the past day, known Type 1 diabetic',
        background: 'Type 1 diabetes diagnosed age 12, on insulin, university student, missed several insulin doses this week due to exams',
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'history',
            content: 'Take a focused history from the patient',
            expectedFindings: {
              keyPoints: [
                'Insulin compliance — missed doses',
                'Symptoms of hyperglycaemia — polyuria, polydipsia',
                'Vomiting frequency and duration',
                'Precipitating factors — illness, stress, missed medication',
                'Last food and fluid intake',
              ],
              redFlags: ['Reduced consciousness', 'Kussmaul breathing', 'Fruity breath odour'],
            },
          },
          {
            order: 2,
            type: 'examination',
            content: 'Perform a focused examination',
            expectedFindings: {
              keyPoints: [
                'Vital signs including temperature',
                'Signs of dehydration',
                'Respiratory pattern',
                'GCS and conscious level',
                'Abdominal examination',
              ],
              redFlags: ['Hypotension', 'Deep sighing respirations', 'Reduced GCS'],
            },
          },
          {
            order: 3,
            type: 'investigation',
            content: 'Order appropriate investigations',
            expectedFindings: {
              keyPoints: [
                'Capillary blood glucose',
                'Arterial blood gas',
                'Urinary ketones',
                'UEC and creatinine',
                'FBC',
                'Blood cultures if febrile',
              ],
              redFlags: ['pH below 7.3', 'Bicarbonate below 15', 'Ketones above 3'],
            },
          },
          {
            order: 4,
            type: 'diagnosis',
            content: 'State your diagnosis',
            expectedFindings: {
              keyPoints: [
                'DKA — hyperglycaemia, ketosis, metabolic acidosis',
                'Precipitant — insulin omission',
                'Differentials — HHS, alcohol ketoacidosis',
              ],
              redFlags: [],
            },
          },
          {
            order: 5,
            type: 'management',
            content: 'Outline your management using the DKA protocol',
            expectedFindings: {
              keyPoints: [
                'IV fluid resuscitation — 0.9% NaCl',
                'Fixed rate insulin infusion',
                'Potassium replacement',
                'Hourly monitoring of glucose and ketones',
                'Identify and treat precipitant',
                'VTE prophylaxis',
              ],
              redFlags: [],
            },
          },
        ],
      },
    },
  })

  // Case 3 — Community Acquired Pneumonia
  await prisma.case.upsert({
    where: { id: 'seed-case-003' },
    update: {},
    create: {
      id: 'seed-case-003',
      authorId: educator.id,
      title: 'Community Acquired Pneumonia',
      specialty: 'Respiratory',
      difficulty: 'beginner',
      status: 'published',
      timeLimit: 25,
      tags: ['pneumonia', 'respiratory', 'infection', 'CAP'],
      patientPersona: {
        age: 67,
        sex: 'male',
        presentingComplaint: 'cough with yellow sputum and fever for 4 days, feeling short of breath',
        background: 'Retired teacher, ex-smoker 20 pack year history, mild COPD, lives alone',
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'history',
            content: 'Take a focused respiratory history',
            expectedFindings: {
              keyPoints: [
                'Cough onset, character, and sputum colour',
                'Fever and rigors',
                'Breathlessness and exercise tolerance',
                'Pleuritic chest pain',
                'Vaccination history — influenza, pneumococcal',
                'Travel history and sick contacts',
              ],
              redFlags: ['Haemoptysis', 'Confusion', 'Severe breathlessness at rest'],
            },
          },
          {
            order: 2,
            type: 'examination',
            content: 'Perform a respiratory examination',
            expectedFindings: {
              keyPoints: [
                'Vital signs including temperature and oxygen saturation',
                'Respiratory rate',
                'Chest expansion',
                'Percussion note',
                'Auscultation — bronchial breathing, crackles',
              ],
              redFlags: ['Oxygen saturation below 92%', 'RR above 30', 'Confusion'],
            },
          },
          {
            order: 3,
            type: 'investigation',
            content: 'Order appropriate investigations',
            expectedFindings: {
              keyPoints: [
                'Chest X-ray',
                'FBC, CRP, UEC',
                'Blood cultures before antibiotics',
                'Sputum culture',
                'Urine pneumococcal and legionella antigen',
                'ABG if O2 sats below 92%',
              ],
              redFlags: ['Consolidation on CXR', 'Urea above 7', 'Multilobar involvement'],
            },
          },
          {
            order: 4,
            type: 'diagnosis',
            content: 'Diagnose and risk stratify using CURB-65',
            expectedFindings: {
              keyPoints: [
                'Community acquired pneumonia',
                'CURB-65 score calculation',
                'Differentials — PE, lung cancer, TB',
              ],
              redFlags: [],
            },
          },
          {
            order: 5,
            type: 'management',
            content: 'Outline management based on CURB-65 severity',
            expectedFindings: {
              keyPoints: [
                'Oxygen to maintain sats 88-92% given COPD',
                'Antibiotics per local guidelines — amoxicillin + clarithromycin',
                'IV fluids if dehydrated',
                'Analgesia for pleuritic pain',
                'VTE prophylaxis',
                'Physiotherapy',
              ],
              redFlags: [],
            },
          },
        ],
      },
    },
  })

  // Case 4 — Acute Appendicitis
  await prisma.case.upsert({
    where: { id: 'seed-case-004' },
    update: {},
    create: {
      id: 'seed-case-004',
      authorId: educator.id,
      title: 'Acute Appendicitis',
      specialty: 'Gastroenterology',
      difficulty: 'beginner',
      status: 'published',
      timeLimit: 25,
      tags: ['appendicitis', 'acute abdomen', 'surgery', 'emergency'],
      patientPersona: {
        age: 23,
        sex: 'female',
        presentingComplaint: 'worsening right sided abdominal pain for 18 hours, nausea and vomiting',
        background: 'University student, no significant medical history, last menstrual period 2 weeks ago',
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'history',
            content: 'Take a focused abdominal history',
            expectedFindings: {
              keyPoints: [
                'Pain onset, location, and migration — periumbilical to RIF',
                'Nausea and vomiting',
                'Bowel habit changes',
                'Urinary symptoms',
                'Last menstrual period and sexual history',
                'Fever',
              ],
              redFlags: ['Generalised peritonism', 'Rigid abdomen', 'High fever with rigors'],
            },
          },
          {
            order: 2,
            type: 'examination',
            content: 'Perform an abdominal examination',
            expectedFindings: {
              keyPoints: [
                'Vital signs',
                'RIF tenderness at McBurney\'s point',
                'Rebound tenderness',
                'Rovsing\'s sign',
                'Psoas sign',
                'PR examination if indicated',
              ],
              redFlags: ['Guarding', 'Rigidity', 'Signs of peritonitis'],
            },
          },
          {
            order: 3,
            type: 'investigation',
            content: 'Order appropriate investigations',
            expectedFindings: {
              keyPoints: [
                'FBC — raised WCC',
                'CRP',
                'Urine pregnancy test',
                'Urinalysis',
                'Alvarado score calculation',
                'Ultrasound abdomen',
                'CT abdomen if USS inconclusive',
              ],
              redFlags: ['WCC above 15', 'Positive pregnancy test changes management'],
            },
          },
          {
            order: 4,
            type: 'diagnosis',
            content: 'State your diagnosis and differentials',
            expectedFindings: {
              keyPoints: [
                'Acute appendicitis',
                'Alvarado score',
                'Differentials — ovarian cyst, ectopic pregnancy, mesenteric adenitis, Crohn\'s disease',
              ],
              redFlags: [],
            },
          },
          {
            order: 5,
            type: 'management',
            content: 'Outline surgical and medical management',
            expectedFindings: {
              keyPoints: [
                'Nil by mouth',
                'IV access and fluids',
                'Analgesia — do not withhold',
                'IV antibiotics — co-amoxiclav',
                'Surgical referral for laparoscopic appendicectomy',
                'Consent and pre-operative workup',
              ],
              redFlags: [],
            },
          },
        ],
      },
    },
  })

  // Case 5 — First Seizure
  await prisma.case.upsert({
    where: { id: 'seed-case-005' },
    update: {},
    create: {
      id: 'seed-case-005',
      authorId: educator.id,
      title: 'First Seizure in a Young Adult',
      specialty: 'Neurology',
      difficulty: 'advanced',
      status: 'published',
      timeLimit: 40,
      tags: ['seizure', 'epilepsy', 'neurology', 'first presentation'],
      patientPersona: {
        age: 21,
        sex: 'male',
        presentingComplaint: 'brought in by ambulance after collapsing and shaking at a party, now drowsy and confused',
        background: 'Final year medical student, no medical history, no regular medications, admits to alcohol and energy drinks tonight',
      },
      steps: {
        create: [
          {
            order: 1,
            type: 'history',
            content: 'Take a history from the patient and collateral history from the witness',
            expectedFindings: {
              keyPoints: [
                'Eyewitness account of the episode',
                'Duration of convulsion',
                'Post-ictal period — drowsiness, confusion',
                'Tongue biting, incontinence',
                'Alcohol and recreational drug use',
                'Sleep deprivation',
                'Previous episodes or aura',
                'Family history of epilepsy',
                'Head injury history',
              ],
              redFlags: ['Prolonged seizure above 5 min', 'No recovery of consciousness', 'Focal neurology'],
            },
          },
          {
            order: 2,
            type: 'examination',
            content: 'Perform a neurological examination',
            expectedFindings: {
              keyPoints: [
                'GCS and conscious level',
                'Vital signs',
                'Full neurological examination',
                'Signs of head injury',
                'Tongue laceration',
                'Meningism',
              ],
              redFlags: ['Focal neurological deficit', 'Papilloedema', 'Signs of meningitis'],
            },
          },
          {
            order: 3,
            type: 'investigation',
            content: 'Order appropriate investigations',
            expectedFindings: {
              keyPoints: [
                'Blood glucose — immediately',
                'FBC, UEC, LFT',
                'Blood alcohol level',
                'Urine drug screen',
                'ECG',
                'CT head',
                'EEG as outpatient',
                'MRI brain as outpatient',
              ],
              redFlags: ['Hypoglycaemia', 'Hyponatraemia', 'Space occupying lesion on CT'],
            },
          },
          {
            order: 4,
            type: 'diagnosis',
            content: 'Formulate your diagnosis',
            expectedFindings: {
              keyPoints: [
                'First generalised tonic-clonic seizure',
                'Likely provoked — alcohol, sleep deprivation',
                'Differentials — syncope, psychogenic non-epileptic seizure, hypoglycaemia',
                'Not diagnosing epilepsy on first seizure',
              ],
              redFlags: [],
            },
          },
          {
            order: 5,
            type: 'management',
            content: 'Outline immediate and discharge management',
            expectedFindings: {
              keyPoints: [
                'Observe until fully recovered',
                'Correct any metabolic abnormality',
                'Neurology outpatient referral',
                'DVLA advice — must not drive for 6 months minimum',
                'Safety advice — no unsupervised swimming or heights',
                'Not starting antiepileptics after single provoked seizure',
                'Safety netting and when to return',
              ],
              redFlags: [],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Seed complete — 5 cases across Cardiology, Endocrinology, Respiratory, Gastroenterology, Neurology')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
