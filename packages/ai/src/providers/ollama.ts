import type { AIProvider, ChatMessage, ChatOptions, GenerateOptions } from './base.js'

export interface OllamaConfig {
  baseUrl: string
  model: string
  generatorModel?: string
}

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama'
  private readonly baseUrl: string
  private readonly model: string
  private readonly generatorModel: string

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.model = config.model
    this.generatorModel = config.generatorModel ?? config.model
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        ...(options?.format && { format: options.format }),
        ...(options && {
          options: {
            ...(options.temperature != null && { temperature: options.temperature }),
            ...(options.maxTokens != null && { num_predict: options.maxTokens }),
            ...(options.topP != null && { top_p: options.topP }),
          },
        }),
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json() as { message: { content: string } }
    return data.message.content
  }

  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        ...(options && {
          options: {
            ...(options.temperature != null && { temperature: options.temperature }),
            ...(options.maxTokens != null && { num_predict: options.maxTokens }),
            ...(options.topP != null && { top_p: options.topP }),
          },
        }),
      }),
    })

    if (!res.ok) throw new Error(`Ollama stream failed: ${res.status}`)
    if (!res.body) throw new Error('Ollama stream returned no body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
              if (chunk.message?.content) yield chunk.message.content
              if (chunk.done) return
            } catch {
              // Skip unparseable chunks
            }
          }
        }

        if (done) {
          if (buffer.trim()) {
            try {
              const chunk = JSON.parse(buffer) as { message?: { content?: string } }
              if (chunk.message?.content) yield chunk.message.content
            } catch { /* ignore */ }
          }
          break
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.generatorModel,
        prompt,
        stream: false,
        ...(options?.format && { format: options.format }),
        ...(options && {
          options: {
            ...(options.temperature != null && { temperature: options.temperature }),
            ...(options.maxTokens != null && { num_predict: options.maxTokens }),
          },
        }),
      }),
    })

    if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`)
    const data = await res.json() as { response: string }
    return data.response
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      return res.ok
    } catch {
      return false
    }
  }

  /** Pre-warm model by pinging /api/ps */
  async preWarm(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/ps`)
    } catch {
      console.warn('[AI] Failed to pre-warm Ollama model')
    }
  }
}
