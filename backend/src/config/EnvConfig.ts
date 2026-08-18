import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from the root .env file of the backend module
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  MONGO_URI: z.string(),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  REDIS_URL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables during bootstrap:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const EnvConfig = parsed.data;
export type EnvConfigType = z.infer<typeof envSchema>;
