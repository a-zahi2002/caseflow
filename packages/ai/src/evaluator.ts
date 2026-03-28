import { OllamaClient } from './ollama.js'
import { EVALUATOR_SYSTEM_PROMPT, EVALUATOR_USER_PROMPT } from './prompts/evaluator.js'
import type { EvalResult } from '@caseflow/types'
import type { OllamaMessage } from './types.js'

export interface RunEvaluatorInput {
  ollama: OllamaClient
  expectedFindings: any // CaseStep.expectedFindings is Json
  messages: { role: 'student' | 'patient'; content: string }[]
  model?: string
}

export async function runEvaluator({
  ollama,
  expectedFindings,
  messages,
  model,
}: RunEvaluatorInput): Promise<EvalResult> {
  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  const findingsStr = JSON.stringify(expectedFindings, null, 2)

  const systemMessage: OllamaMessage = {
    role: 'system',
    content: EVALUATOR_SYSTEM_PROMPT,
  }

  const userMessage: OllamaMessage = {
    role: 'user',
    content: EVALUATOR_USER_PROMPT(findingsStr, transcript),
  }

  const response = await ollama.chat([systemMessage, userMessage], {
    format: 'json',
    temperature: 0,
  }, model)

  try {
    const result = JSON.parse(response) as EvalResult
    return result
  } catch (err) {
    console.error('Failed to parse evaluator response:', response)
    throw new Error('AI Evaluator returned invalid JSON')
  }
}
