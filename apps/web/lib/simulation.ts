export type ServerMessageType = 'stream_chunk' | 'stream_end' | 'error' | 'simulation_ended'

export interface ServerMessage {
  type: ServerMessageType
  content?: string
  heartsRemaining?: number
  timeElapsed?: number
}

export interface SimulationClientOptions {
  attemptId: string
  apiUrl: string
  onChunk: (chunk: string) => void
  onTurnEnd: (heartsRemaining: number, timeElapsed: number) => void
  onError: (message: string) => void
  onEnded: () => void
}

export class SimulationClient {
  private ws: WebSocket | null = null
  private options: SimulationClientOptions

  constructor(options: SimulationClientOptions) {
    this.options = options
  }

  connect(): void {
    const wsUrl = this.options.apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')

    this.ws = new WebSocket(
      `${wsUrl}/simulation/${this.options.attemptId}/ws`
    )

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as ServerMessage

      switch (msg.type) {
        case 'stream_chunk':
          if (msg.content) this.options.onChunk(msg.content)
          break
        case 'stream_end':
          this.options.onTurnEnd(
            msg.heartsRemaining ?? 3,
            msg.timeElapsed ?? 0
          )
          break
        case 'error':
          this.options.onError(msg.content ?? 'Unknown error')
          break
        case 'simulation_ended':
          this.options.onEnded()
          break
      }
    }
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.options.onError('Connection lost. Please refresh.')
      return
    }
    this.ws.send(JSON.stringify({ type: 'message', content }))
  }

  endSimulation(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'end_simulation' }))
    }
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
  }
}

