import type { AIProvider, ChatMessage, ChatOptions, GenerateOptions } from './base.js'

export interface OpenAIConfig {
  apiKey: string
  model?: string
  baseURL?: string
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai'
  private readonly apiKey: string
  private readonly model: string
  private readonly baseURL: string

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey
    this.model = config.model ?? 'gpt-4o-mini'
    this.baseURL = config.baseURL ?? 'https://api.openai.com/v1'
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        ...(options?.temperature != null && { temperature: options.temperature }),
        ...(options?.maxTokens != null && { max_tokens: options.maxTokens }),
        ...(options?.topP != null && { top_p: options.topP }),
        ...(options?.format === 'json' && { response_format: { type: 'json_object' } }),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenAI chat failed: ${res.status} ${body}`)
    }

    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    return data.choices[0]?.message?.content ?? ''
  }

  async *chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        ...(options?.temperature != null && { temperature: options.temperature }),
        ...(options?.maxTokens != null && { max_tokens: options.maxTokens }),
      }),
    })

    if (!res.ok) throw new Error(`OpenAI stream failed: ${res.status}`)
    if (!res.body) throw new Error('OpenAI stream returned no body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data) as { choices: Array<{ delta: { content?: string } }> }
            const content = parsed.choices[0]?.delta?.content
            if (content) yield content
          } catch { /* skip */ }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], options)
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      })
      return res.ok
    } catch {
      return false
    }
  }
}
