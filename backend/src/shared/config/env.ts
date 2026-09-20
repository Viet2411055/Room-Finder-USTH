import 'dotenv/config';
import { z } from 'zod';

const optionalString = z.preprocess(value => value === '' ? undefined : value, z.string().optional());
const optionalEmail = z.preprocess(value => value === '' ? undefined : value, z.string().email().optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  GMAIL_CLIENT_ID: optionalString,
  GMAIL_CLIENT_SECRET: optionalString,
  GMAIL_REFRESH_TOKEN: optionalString,
  GMAIL_SENDER: optionalEmail,
  EMAIL_WORKER_ENABLED: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),
});

export const env = schema.parse(process.env);
