import { Case } from '@caseflow/types'

const MOCK_CASES = [
  {
    id: 'c1',
    title: 'Acute Chest Pain — Possible MI',
    specialty: 'Cardiology',
    difficulty: 'intermediate',
    rating: 4.8,
    attemptCount: 1200,
    isCompleted: false,
    bestScore: null,
    tags: ['ECG', 'Troponin', 'STEMI'],
    description: '45M with crushing substernal chest pain radiating to the left arm and jaw. ST elevation noted in leads II, III and aVF on initial ECG.'
  },
  {
    id: 'c2',
    title: 'COPD Exacerbation — Acute Dyspnea',
    specialty: 'Respiratory',
    difficulty: 'beginner',
    rating: 4.6,
    attemptCount: 890,
    isCompleted: true,
    bestScore: 82,
    tags: ['COPD', 'Spirometry', 'Bronchodilator'],
    description: '62F smoker with 3-day worsening dyspnea and productive cough. Known COPD — assess severity and initiate appropriate management.'
  },
  {
    id: 'c3',
    title: 'Thunderclap Headache — SAH vs Migraine',
    specialty: 'Neurology',
    difficulty: 'advanced',
    rating: 4.9,
    attemptCount: 560,
    isCompleted: false,
    bestScore: null,
    tags: ['LP', 'CT-Head', 'SAH'],
    description: '28F with sudden worst-ever headache, neck stiffness and photophobia. Differentiate subarachnoid haemorrhage from migraine and manage appropriately.'
  },
  {
    id: 'c4',
    title: 'Septic Shock — Source Identification',
    specialty: 'Emergency',
    difficulty: 'advanced',
    rating: 4.7,
    attemptCount: 430,
    isCompleted: false,
    bestScore: null,
    tags: ['Sepsis', 'Cultures', 'Fluids'],
    description: '55M diabetic with fever, hypotension and altered consciousness. Identify the septic focus and initiate time-critical resuscitation.'
  },
  {
    id: 'c5',
    title: 'TIA — Risk Stratification and Management',
    specialty: 'Neurology',
    difficulty: 'beginner',
    rating: 4.5,
    attemptCount: 720,
    isCompleted: true,
    bestScore: 91,
    tags: ['ABCD2', 'Antiplatelet', 'Imaging'],
    description: '67M hypertensive with 30-minute episode of right-sided weakness now fully resolved. Apply ABCD2 score and determine appropriate management pathway.'
  },
  {
    id: 'c6',
    title: 'Palpitations — AF vs SVT',
    specialty: 'Cardiology',
    difficulty: 'intermediate',
    rating: 4.7,
    attemptCount: 640,
    isCompleted: false,
    bestScore: null,
    tags: ['ECG', 'Adenosine', 'Cardioversion'],
    description: '38F with sudden-onset palpitations, mild dyspnea and an irregular pulse on examination. Work up the arrhythmia and initiate rate or rhythm control.'
  }
]

export async function getCases(opts: { 
  specialty?: string; 
  difficulty?: string; 
  q?: string 
}): Promise<any[]> {
  // Simulate network delay content
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return MOCK_CASES.filter((c) => {
    const sMatch = !opts.specialty || opts.specialty === 'all' || c.specialty.toLowerCase() === opts.specialty.toLowerCase()
    const dMatch = !opts.difficulty || opts.difficulty === 'all' || c.difficulty.toLowerCase() === opts.difficulty.toLowerCase()
    
    let qMatch = true
    if (opts.q) {
      const term = opts.q.toLowerCase()
      const content = `${c.title} ${c.description} ${c.tags.join(' ')}`.toLowerCase()
      qMatch = content.includes(term)
    }
    
    return sMatch && dMatch && qMatch
  })
}

