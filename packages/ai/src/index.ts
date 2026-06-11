// AI Provider abstraction
export type { AIProvider, ChatMessage, ChatOptions, GenerateOptions } from './providers/base.js'
export { OllamaProvider } from './providers/ollama.js'
export type { OllamaConfig } from './providers/ollama.js'
export { OpenAIProvider } from './providers/openai.js'
export type { OpenAIConfig } from './providers/openai.js'
export { getAIProvider } from './providers/factory.js'

// Evaluator
export { runEvaluator } from './evaluator.js'

// Adaptive difficulty
export { recommendNextDifficulty, getRecommendationCriteria } from './adaptive.js'
export type { AttemptSummary } from './adaptive.js'

// Patient simulation (existing, preserved)
export { buildPatientSystemPrompt } from './prompts/patient.js'
export type { PatientPromptOptions } from './prompts/patient.js'

// Generator
export { extractCaseFromDocument } from './generator.js'
