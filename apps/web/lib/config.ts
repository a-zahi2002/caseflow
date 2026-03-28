import { z } from 'zod'

const envSchema = z.object({
  apiUrl: z.string().url().default('http://localhost:4000'),
})

const env = envSchema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
})

export const config = {
  apiUrl: env.apiUrl,
} as const
