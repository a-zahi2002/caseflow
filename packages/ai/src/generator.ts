import { OllamaClient } from './ollama.js';
import { CASE_EXTRACTION_PROMPT } from './prompts/generator.js';
import type { CaseFormInput } from '@caseflow/types';

/**
 * Extracts a clinical case structure from document text using Ollama.
 */
export async function extractCaseFromDocument(
  client: OllamaClient,
  documentText: string
): Promise<CaseFormInput> {
  const prompt = CASE_EXTRACTION_PROMPT.replace('{{text}}', documentText);
  
  const response = await client.generate(
    prompt,
    {
      format: 'json',
      temperature: 0.1,
    },
    client.generatorModel
  );

  try {
    // Attempt to parse the JSON response
    // Sometimes LLMs wrap it in markdown code blocks
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanResponse);
    
    // Ensure basic structure exists
    if (!data.title || !data.steps) {
      throw new Error('Extracted data is missing required fields');
    }

    return data as CaseFormInput;
  } catch (err) {
    console.error('Failed to parse AI response as JSON:', response);
    throw new Error('AI extraction failed to return valid structured case data');
  }
}
