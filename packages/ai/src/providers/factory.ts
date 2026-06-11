import type { AIProvider } from './base.js'
import { OllamaProvider } from './ollama.js'
import { OpenAIProvider } from './openai.js'

/**
 * Factory function that creates the appropriate AI provider based on environment.
 * Reads AI_PROVIDER env var: 'ollama' (default) or 'openai'.
 */
export function getAIProvider(): AIProvider {
  const provider = process.env['AI_PROVIDER'] ?? 'ollama'

  switch (provider) {
    case 'openai': {
      const apiKey = process.env['OPENAI_API_KEY']
      if (!apiKey) throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai')
      return new OpenAIProvider({
        apiKey,
        model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
      })
    }

    case 'ollama':
    default:
      return new OllamaProvider({
        baseUrl: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
        model: process.env['OLLAMA_MODEL'] ?? 'mistral:7b',
        ...(process.env['OLLAMA_GENERATOR_MODEL'] && { generatorModel: process.env['OLLAMA_GENERATOR_MODEL'] }),
      })
  }
}
