import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    SITE_URL: z.string().url(),
    CLIENT_ORIGINS: z
      .string()
      .min(1)
      .transform((s) => s.split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean)),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('8h'),
    COOKIE_DOMAIN: z.string().optional().default(''),
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    ADMIN_ID: z.string().optional().default('admin'),
    ADMIN_EMAIL: z.string().optional().default('admin@ajaytourtravels.com'),
    ADMIN_PASSWORD: z.string().optional().default(''),
    ADMIN_NAME: z.string().optional().default('Administrator'),
    SMTP_HOST: z.string().optional().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    SMTP_FROM: z.string().optional().default(''),
    VERCEL_DEPLOY_HOOK_URL: z.string().optional().default(''),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const o of env.CLIENT_ORIGINS) {
      if (o === '*' || !o.startsWith('https://')) {
        ctx.addIssue({
          code: 'custom',
          path: ['CLIENT_ORIGINS'],
          message: `Production origins must be explicit https URLs (got "${o}")`,
        });
      }
    }
    if (!env.SITE_URL.startsWith('https://')) {
      ctx.addIssue({ code: 'custom', path: ['SITE_URL'], message: 'SITE_URL must be https in production' });
    }
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  console.error(`Invalid environment configuration:\n${lines.join('\n')}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
