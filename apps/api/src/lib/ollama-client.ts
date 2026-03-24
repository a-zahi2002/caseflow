import { OllamaClient } from '@caseflow/ai'
import { config } from './config.js'

export const ollamaClient = new OllamaClient({
  baseUrl: config.OLLAMA_BASE_URL,
  defaultModel: config.OLLAMA_MODEL,
  generatorModel: config.OLLAMA_GENERATOR_MODEL,
})
