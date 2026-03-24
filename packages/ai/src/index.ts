export { OllamaClient } from './ollama.js'
export type { OllamaClientConfig } from './ollama.js'
export { getPatientResponse, streamPatientResponse } from './patient.js'
export type { PatientTurnInput, PatientTurnOutput } from './patient.js'
export { buildPatientSystemPrompt } from './prompts/patient.js'
export type { PatientPromptOptions } from './prompts/patient.js'
export type {
  OllamaMessage,
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaStreamChunk,
} from './types.js'
