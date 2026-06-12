import type { AIProvider } from './providers/base.js';
import { CASE_EXTRACTION_PROMPT } from './prompts/generator.js';
import type { CaseFormInput } from '@caseflow/types';

/**
 * Extracts a clinical case structure from document text using AI.
 */
export async function extractCaseFromDocument(
  provider: AIProvider,
  documentText: string
): Promise<CaseFormInput> {
  const prompt = CASE_EXTRACTION_PROMPT.replace('{{text}}', documentText);
  
  const response = await provider.generate(
    prompt,
    {
      format: 'json',
      temperature: 0.1,
    }
  );

  try {
    // Attempt to parse the JSON response
    // Safely extract JSON structure using regex to handle extra LLM text
    let cleanResponse = response.trim();
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
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
