import { OllamaClient } from './ollama.js'
import { buildPatientSystemPrompt, type PatientPromptOptions } from './prompts/patient.js'
import type { OllamaMessage } from './types.js'

export interface PatientTurnInput {
  studentMessage: string
  conversationHistory: OllamaMessage[]
  promptOptions: PatientPromptOptions
}

export interface PatientTurnOutput {
  patientResponse: string
  updatedHistory: OllamaMessage[]
}

export async function getPatientResponse(
  client: OllamaClient,
  input: PatientTurnInput
): Promise<PatientTurnOutput> {
  const { studentMessage, conversationHistory, promptOptions } = input

  const systemPrompt = buildPatientSystemPrompt(promptOptions)

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: studentMessage },
  ]

  const patientResponse = await client.chat(messages, {
    temperature: 0.7,
    num_predict: 200,
  })

  const updatedHistory: OllamaMessage[] = [
    ...conversationHistory,
    { role: 'user', content: studentMessage },
    { role: 'assistant', content: patientResponse },
  ]

  return { patientResponse, updatedHistory }
}

export async function* streamPatientResponse(
  client: OllamaClient,
  input: PatientTurnInput
): AsyncGenerator<string> {
  const { studentMessage, conversationHistory, promptOptions } = input

  const systemPrompt = buildPatientSystemPrompt(promptOptions)

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: studentMessage },
  ]

  yield* client.chatStream(messages, {
    temperature: 0.7,
    num_predict: 200,
  })
}
