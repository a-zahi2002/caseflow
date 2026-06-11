import { Hono } from 'hono';
import { prisma } from '@caseflow/db';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/require-role.js';
import { success, error } from '../lib/response.js';
import { config } from '../lib/config.js';
import { ollamaClient } from '../lib/ollama-client.js';
import { extractCaseFromDocument } from '@caseflow/ai';
import * as pdfImport from 'pdf-parse';
const pdf = (pdfImport as any).default || pdfImport;
import mammoth from 'mammoth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import type { AppEnv } from '../types.js';

export const uploadsRouter = new Hono<AppEnv>();

// Authenticate all upload routes
uploadsRouter.use('*', authMiddleware);

uploadsRouter.post('/', requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const user = c.get('user');
  
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return error(c, 'No file uploaded', 400, 'BAD_REQUEST');
  }

  // Extract text based on file type
  let text = '';
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return error(c, 'Unsupported file type. Please upload a PDF or DOCX.', 400, 'BAD_REQUEST');
    }
  } catch (err) {
    console.error('Text extraction failed:', err);
    return error(c, 'Failed to extract text from document', 500, 'EXTRACTION_ERROR');
  }

  if (!text.trim()) {
    return error(c, 'Document appears to be empty', 400, 'BAD_REQUEST');
  }

  // Step 2: Extract structured case data using AI
  let caseDraft;
  try {
    caseDraft = await extractCaseFromDocument(ollamaClient, text);
  } catch (err) {
    console.error('AI extraction failed:', err);
    return error(c, 'Failed to generate case from document text', 500, 'AI_ERROR');
  }

  // Step 3: Store the original file
  let fileUrl = '';
  try {
    if (config.STORAGE_TYPE === 'supabase' && config.SUPABASE_URL && config.SUPABASE_KEY) {
      const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error: uploadErr } = await supabase.storage
        .from('cases')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      // Construct public URL (assuming bucket is public)
      fileUrl = `${config.SUPABASE_URL}/storage/v1/object/public/cases/${filePath}`;
    } else {
      // Local storage
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      await writeFile(join(uploadsDir, fileName), buffer);
      fileUrl = `/uploads/${fileName}`; 
    }
  } catch (err) {
    console.warn('File storage failed, but continuing with database creation:', err);
    // Continue even if file storage fails - we still have the case draft
  }

  // Step 4: Save to database as a draft
  try {
    const persona = (caseDraft as any).patientPersona || {};
    const newCase = await prisma.case.create({
      data: {
        title: caseDraft.title || 'Untitled Case (Extracted)',
        description: caseDraft.description || 'Extracted clinical case.',
        specialty: caseDraft.specialty || 'General',
        difficulty: (caseDraft.difficulty?.toUpperCase() as any) || 'BEGINNER',
        patientName: persona.name || 'Jane Doe',
        patientAge: typeof persona.age === 'number' ? persona.age : 30,
        patientGender: persona.sex || persona.gender || 'Female',
        chiefComplaint: persona.presentingComplaint || persona.chiefComplaint || '',
        patientBackground: persona.background || persona.patientBackground || '',
        personalityTraits: persona.personalityTraits || [],
        tags: caseDraft.tags || [],
        authorId: user.id,
        status: 'DRAFT',
        sourceDocumentUrl: fileUrl,
        steps: {
          create: caseDraft.steps?.map((step: any, index: number) => {
            const findings: string[] = [];
            if (step.expectedFindings) {
              if (Array.isArray(step.expectedFindings.keyPoints)) {
                findings.push(...step.expectedFindings.keyPoints);
              }
              if (Array.isArray(step.expectedFindings.redFlags)) {
                findings.push(...step.expectedFindings.redFlags);
              }
            }
            return {
              order: step.order ?? index,
              name: step.content ? (step.content.slice(0, 50) + (step.content.length > 50 ? '...' : '')) : `Step ${index + 1}`,
              expectedFindings: findings,
              criticalErrors: [],
              revealedData: {},
            };
          }) || [],
        },
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return success(c, newCase, 201);
  } catch (err) {
    console.error('Database save failed:', err);
    return error(c, 'Failed to save case draft to database', 500, 'DB_ERROR');
  }
});
