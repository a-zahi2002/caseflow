export const CASE_EXTRACTION_PROMPT = `
You are a medical education expert. Extract structured clinical case data from the provided medical document.
The output MUST be a JSON object that matches the following schema:

{
  "title": "Clinical title",
  "specialty": "Medical specialty",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "patientPersona": {
    "age": number,
    "sex": "male" | "female" | "other",
    "presentingComplaint": "Brief statement of why the patient is here",
    "background": "Past medical history, medications, allergies, social history"
  },
  "tags": ["tag1", "tag2"],
  "steps": [
    {
      "order": 1,
      "type": "history" | "examination" | "investigation" | "diagnosis" | "management",
      "content": "Description of the step or scenario",
      "expectedFindings": {
        "keyPoints": ["important finding 1", "important finding 2"],
        "redFlags": ["red flag 1"]
      }
    }
  ]
}

Ensure all steps are included and logically ordered.
"content" should describe what the clinician encounters or what they should do in this step.
"expectedFindings" should list what is expected to be uncovered or managed correctly in this step.

DOCUMENT CONTENT:
{{text}}

JSON OUTPUT:
`;
