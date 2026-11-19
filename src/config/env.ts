import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().min(1).default('https://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(`Variables de entorno inválidas: ${z.prettifyError(result.error)}`);
    throw new Error('Variables de entorno inválidas');
  }

  return result.data;
}

export const env: Env = parseEnv();
