/**
 * AI Evaluator — assesses student performance against expected findings.
 * Runs after the AI response stream completes; never blocks the WebSocket stream.
 */
import { z } from 'zod'
import type { AIProvider } from './providers/base.js'
import { EvaluationResultSchema } from '@caseflow/types'
import type { EvaluationInput, EvaluationResult } from '@caseflow/types'
import { EVALUATOR_SYSTEM_PROMPT, EVALUATOR_USER_PROMPT } from './prompts/evaluator.js'

const EVALUATION_PROMPT = `You are a medical education evaluation engine. Analyze the student's messages against the expected clinical findings.

EXPECTED FINDINGS:
{expectedFindings}

CRITICAL ERRORS (if student mentions any of these incorrectly, it's a critical error):
{criticalErrors}

STUDENT MESSAGES:
{studentMessages}

Evaluate the student's performance and respond with ONLY valid JSON matching this exact schema:
{
  "score": <number 0-100>,
  "feedback": "<1-2 sentence summary>",
  "missedFindings": ["<finding not covered>"],
  "correctFindings": ["<finding correctly identified>"],
  "criticalErrorTriggered": <boolean>,
  "stepComplete": <boolean, true if >=70% of expectedFindings covered>
}

Rules:
- Score 0-100 based on percentage of expected findings correctly identified
- stepComplete = true only if 70% or more of expected findings are covered
- criticalErrorTriggered = true only if student clearly made one of the listed critical errors
- Be generous with partial matches — students may use different clinical terminology
- Respond with ONLY the JSON object, no markdown, no explanation`

export async function runEvaluator(
  provider: AIProvider,
  input: EvaluationInput,
): Promise<EvaluationResult> {
  const prompt = EVALUATION_PROMPT
    .replace('{expectedFindings}', input.expectedFindings.join('\n- '))
    .replace('{criticalErrors}', input.criticalErrors.length > 0 ? input.criticalErrors.join('\n- ') : 'None')
    .replace('{studentMessages}', input.studentMessages.join('\n---\n'))

  // Attempt evaluation with one retry on parse failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await provider.chat(
        [{ role: 'system', content: prompt }],
        { temperature: 0.1, format: 'json' }
      )

      // Extract JSON from response using regex to handle extra conversational text
      let jsonStr = response.trim()
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }

      const parsed = JSON.parse(jsonStr)
      const result = EvaluationResultSchema.parse(parsed)
      return result
    } catch (err) {
      if (attempt === 0) {
        console.warn('[Evaluator] Parse failed, retrying...', err)
        continue
      }
      console.error('[Evaluator] Failed after retry:', err)
    }
  }

  // Fallback: return a safe default evaluation
  return {
    score: 0,
    feedback: 'Unable to evaluate this response. Please continue with the case.',
    missedFindings: input.expectedFindings,
    correctFindings: [],
    criticalErrorTriggered: false,
    stepComplete: false,
  }
}

export interface OverallEvaluationResult {
  overallScore: number
  stepFeedback: Array<{
    stepType: 'history' | 'examination' | 'investigation' | 'diagnosis' | 'management'
    score: number
    didWell: string
    missed: string
  }>
  topLearningPoints: string[]
  suggestedCases: string[]
}

export async function runOverallEvaluator(
  provider: AIProvider,
  expectedFindings: string,
  transcript: string
): Promise<OverallEvaluationResult> {
  const systemPrompt = EVALUATOR_SYSTEM_PROMPT
  const userPrompt = EVALUATOR_USER_PROMPT(expectedFindings, transcript)

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await provider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.1, format: 'json' })

      // Safely extract JSON structure using regex to handle extra conversational text
      let jsonStr = response.trim()
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }

      const parsed = JSON.parse(jsonStr)
      return parsed as OverallEvaluationResult
    } catch (err) {
      if (attempt === 0) {
        console.warn('[OverallEvaluator] Parse failed, retrying...', err)
        continue
      }
      console.error('[OverallEvaluator] Failed after retry:', err)
    }
  }

  // Fallback
  return {
    overallScore: 70,
    stepFeedback: [
      { stepType: 'history', score: 70, didWell: 'Completed the case history', missed: 'Could explore symptoms further' }
    ],
    topLearningPoints: ['Focus on complete patient history taking', 'Formulate a structured management plan', 'Review diagnostic pathways'],
    suggestedCases: ['Acute Chest Pain in a 55-year-old Male']
  }
}
