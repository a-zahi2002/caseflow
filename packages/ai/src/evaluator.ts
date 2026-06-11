/**
 * AI Evaluator — assesses student performance against expected findings.
 * Runs after the AI response stream completes; never blocks the WebSocket stream.
 */
import { z } from 'zod'
import type { AIProvider } from './providers/base.js'
import { EvaluationResultSchema } from '@caseflow/types'
import type { EvaluationInput, EvaluationResult } from '@caseflow/types'

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

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
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
