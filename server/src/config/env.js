import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    SITE_URL: z.string().url().default('http://localhost:5173'),
    CLIENT_ORIGINS: z
      .string()
      .optional()
      .default('')
      .transform((s) => (s ? s.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '')).filter(Boolean) : [])),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('8h'),
    COOKIE_DOMAIN: z.string().optional().default(''),
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default(process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    ADMIN_ID: z.string().optional().default('admin'),
    ADMIN_EMAIL: z.string().optional().default('admin@ajaytourtravels.com'),
    ADMIN_PASSWORD: z.string().optional().default('Admin@AjayTour2026!'),
    ADMIN_NAME: z.string().optional().default('Administrator'),
    SMTP_HOST: z.string().optional().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    SMTP_FROM: z.string().optional().default(''),
    VERCEL_DEPLOY_HOOK_URL: z.string().optional().default(''),
  })
  .transform((data) => {
    const origins = Array.isArray(data.CLIENT_ORIGINS) ? [...data.CLIENT_ORIGINS] : [];
    if (data.SITE_URL) {
      const siteOrigin = data.SITE_URL.replace(/\/$/, '');
      if (!origins.includes(siteOrigin)) {
        origins.push(siteOrigin);
      }
      try {
        const u = new URL(siteOrigin);
        if (u.protocol === 'https:') {
          if (u.hostname.startsWith('www.')) {
            const bare = `${u.protocol}//${u.hostname.slice(4)}${u.port ? `:${u.port}` : ''}`;
            if (!origins.includes(bare)) origins.push(bare);
          } else if (
            !u.hostname.endsWith('.onrender.com') &&
            !u.hostname.endsWith('.vercel.app') &&
            !u.hostname.includes('localhost')
          ) {
            const withWww = `${u.protocol}//www.${u.hostname}${u.port ? `:${u.port}` : ''}`;
            if (!origins.includes(withWww)) origins.push(withWww);
          }
        }
      } catch {}
    }
    const KNOWN_PROD_ORIGINS = [
      'https://ajay-tour-travel.vercel.app',
      'https://ajay-tour-travels.vercel.app',
    ];
    for (const ko of KNOWN_PROD_ORIGINS) {
      if (!origins.includes(ko)) origins.push(ko);
    }
    return {
      ...data,
      SITE_URL: data.SITE_URL.replace(/\/$/, ''),
      CLIENT_ORIGINS: origins,
    };
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

export const envSchema = schema;

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  console.error(`Invalid environment configuration:\n${lines.join('\n')}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
