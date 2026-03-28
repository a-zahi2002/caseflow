# Case Format Documentation

Caseflow uses a structured JSON format to define medical education simulations. All community cases should follow the schema in `content/schema.json`.

## Case Schema Breakdown

- `title`: (string) Case name (e.g., "Acute Chest Pain in Emergency Dept").
- `specialty`: (string) One of the allowed specialties (e.g., "Cardiology", "Neurology").
- `difficulty`: (string) One of `beginner`, `intermediate`, or `advanced`.
- `patientPersona`: (object) Background information for the AI.
  - `name`: (string) Patient's name.
  - `age`: (number) Patient's age.
  - `gender`: (string) Patient's gender.
  - `history`: (string) Detailed medical history.
- `steps`: (array) Sequence of the clinical encounter.
  - `type`: (string) Step type (`triage`, `examination`, `investigation`, `diagnosis`, `management`).
  - `content`: (string) Description of the step.
- `expectedFindings`: (array) Key details the student is expected to discover.

## Worked Example JSON

```json
{
  "title": "A 65-year-old Man with Shortness of Breath",
  "specialty": "Cardiology",
  "difficulty": "beginner",
  "patientPersona": {
    "name": "John Doe",
    "age": 65,
    "gender": "male",
    "history": "Arrived with sudden onset shortness of breath and orthopnoea. History of hypertension and smoker."
  },
  "steps": [
    {
      "type": "triage",
      "content": "Patient presents with respiratory distress (RR 28, SpO2 88% on air). Bi-basal crackles on auscultation."
    },
    {
      "type": "investigation",
      "content": "Order Chest X-ray and NT-proBNP."
    },
    {
      "type": "diagnosis",
      "content": "Acute Decompensated Heart Failure."
    }
  ],
  "expectedFindings": [
    "Identify pulmonary oedema on X-ray",
    "Recognise elevated NT-proBNP",
    "Initiate loop diuretics"
  ]
}
```

## Content Quality Rules

1.  **References**: All cases must include clinical references if requested by reviewers.
2.  **Medical Review**: Cases must be reviewed by a qualified medical professional before being marked `published`.
3.  **Schema Validation**: Cases must pass local validation against the JSON schema.
4.  **No Placeholders**: All fields must be completely filled with high-fidelity clinical data.

## How to Submit

1.  Create your JSON file in `content/cases/<specialty>/`.
2.  Validate locally: `npm run validate-cases`.
3.  Open a Pull Request to the `content/*` branch.
