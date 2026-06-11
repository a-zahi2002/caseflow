import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  REDIS_URL: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('mistral:7b'),
  OLLAMA_GENERATOR_MODEL: z.string().default('llama3.2:3b'),
  AI_PROVIDER: z.enum(['ollama', 'openai']).default('ollama'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  EDUCATOR_INVITE_CODE: z.string().default('CASEFLOW-EDU-2024'),
  ENABLE_GOOGLE_AUTH: z.string().default('false'),
  UPLOAD_PROVIDER: z.enum(['local', 's3']).default('local'),
  UPLOAD_LOCAL_DIR: z.string().default('./uploads'),
  REQUIRE_ADMIN_REVIEW: z.string().default('false'),
  SMTP_URL: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
