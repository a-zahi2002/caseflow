export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream: boolean
  options?: {
    temperature?: number
    top_p?: number
    num_predict?: number
  } | undefined
}

export interface OllamaChatResponse {
  model: string
  message: OllamaMessage
  done: boolean
  total_duration?: number
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream: boolean
  options?: {
    temperature?: number
    num_predict?: number
  } | undefined
}

export interface OllamaGenerateResponse {
  model: string
  response: string
  done: boolean
}

export interface OllamaStreamChunk {
  model: string
  message?: OllamaMessage
  response?: string
  done: boolean
}
