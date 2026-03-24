import { OllamaClient } from './ollama.js'
import { getPatientResponse } from './patient.js'

const client = new OllamaClient({
  baseUrl: 'http://localhost:11434',
  defaultModel: 'mistral:7b',
  generatorModel: 'llama3.2:3b',
})

const result = await getPatientResponse(client, {
  studentMessage: 'Hello, I am Dr. Silva. Can you tell me what brought you in today?',
  conversationHistory: [],
  promptOptions: {
    persona: {
      age: 52,
      sex: 'male',
      presentingComplaint: 'crushing chest pain for the last 2 hours',
      background: 'Known hypertensive, smoker, works as a bus driver',
    },
    caseTitle: 'Acute Chest Pain',
    specialty: 'Cardiology',
    heartsRemaining: 3,
    timeElapsed: 0,
  },
})

console.log('Patient says:', result.patientResponse)
