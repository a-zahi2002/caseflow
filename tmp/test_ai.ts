
import { OllamaClient } from '../packages/ai/src/ollama.js';
import { getPatientResponse } from '../packages/ai/src/patient.js';
import { PatientPromptOptions } from '../packages/ai/src/prompts/patient.js';

async function testOllama() {
  const client = new OllamaClient({
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama3.2:3b',
    generatorModel: 'llama3.2:3b',
  });

  console.log('Checking health...');
  const healthy = await client.isHealthy();
  console.log('Healthy:', healthy);

  if (!healthy) {
    console.error('Ollama is not reachable! Make sure it is running on http://localhost:11434.');
    return;
  }

  const options: PatientPromptOptions = {
    persona: {
      age: 52,
      sex: 'male',
      presentingComplaint: 'crushing chest pain',
      background: 'Hypertensive driver',
    },
    caseTitle: 'Acute MI',
    specialty: 'Cardiology',
    heartsRemaining: 3,
    timeElapsed: 0,
  };

  try {
    console.log('Asking: "Where exactly is the pain?"');
    const response = await getPatientResponse(client, {
      studentMessage: 'Where exactly is the pain?',
      conversationHistory: [],
      promptOptions: options,
    });
    console.log('Patient response:', response.patientResponse);
  } catch (err) {
    console.error('Error during chat:', err);
  }
}

testOllama();
