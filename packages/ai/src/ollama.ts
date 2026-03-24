import type {
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaMessage,
  OllamaStreamChunk,
} from './types.js'

export interface OllamaClientConfig {
  baseUrl: string
  defaultModel: string
  generatorModel: string
}

export class OllamaClient {
  private readonly baseUrl: string
  readonly defaultModel: string
  readonly generatorModel: string

  constructor(config: OllamaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.defaultModel = config.defaultModel
    this.generatorModel = config.generatorModel
  }

  // Single prompt — no conversation history
  async generate(
    prompt: string,
    options?: OllamaGenerateRequest['options'],
    model?: string
  ): Promise<string> {
    const body: OllamaGenerateRequest = {
      model: model ?? this.defaultModel,
      prompt,
      stream: false,
      options,
    }

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(`Ollama generate failed: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as OllamaGenerateResponse
    return data.response
  }

  // Multi-turn conversation
  async chat(
    messages: OllamaMessage[],
    options?: OllamaChatRequest['options'],
    model?: string
  ): Promise<string> {
    const body: OllamaChatRequest = {
      model: model ?? this.defaultModel,
      messages,
      stream: false,
      options,
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as OllamaChatResponse
    return data.message.content
  }

  // Streaming chat — yields chunks as they arrive
  async *chatStream(
    messages: OllamaMessage[],
    options?: OllamaChatRequest['options'],
    model?: string
  ): AsyncGenerator<string> {
    const body: OllamaChatRequest = {
      model: model ?? this.defaultModel,
      messages,
      stream: true,
      options,
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(`Ollama stream failed: ${res.status} ${res.statusText}`)
    }

    if (!res.body) {
      throw new Error('Ollama stream returned no body')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const lines = decoder.decode(value, { stream: true }).split('\n')

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const chunk = JSON.parse(line) as OllamaStreamChunk
          if (chunk.message?.content) {
            yield chunk.message.content
          }
          if (chunk.done) return
        } catch {
          // incomplete JSON chunk — skip
        }
      }
    }
  }

  // Health check — verify Ollama is reachable
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      return res.ok
    } catch {
      return false
    }
  }
}
