/**
 * AI Provider interface — the abstraction layer that all providers implement.
 * This allows swapping between Ollama, OpenAI, etc. without changing simulation code.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  format?: 'json' | undefined
}

export interface GenerateOptions extends ChatOptions {
  format?: 'json' | undefined
}

export interface AIProvider {
  /** Multi-turn chat — returns complete response */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>

  /** Streaming chat — yields tokens as they arrive */
  chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>

  /** Single prompt generation */
  generate(prompt: string, options?: GenerateOptions): Promise<string>

  /** Check if the provider is reachable */
  healthCheck(): Promise<boolean>

  /** Provider name for logging */
  readonly name: string
}
