import { envSchema } from '../src/config/env.js';

describe('Environment configuration (envSchema)', () => {
  const baseValid = {
    NODE_ENV: 'production',
    PORT: '5000',
    MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
    SITE_URL: 'https://ajaytourtravels.com',
    JWT_SECRET: 'a'.repeat(32),
  };

  test('succeeds in production when CLIENT_ORIGINS is omitted, defaulting to SITE_URL', () => {
    const result = envSchema.safeParse({ ...baseValid });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.CLIENT_ORIGINS).toContain('https://ajaytourtravels.com');
    expect(result.data.CLIENT_ORIGINS).toContain('https://www.ajaytourtravels.com');
    expect(result.data.SITE_URL).toBe('https://ajaytourtravels.com');
  });

  test('cleans trailing slashes, quotes and whitespace in CLIENT_ORIGINS', () => {
    const result = envSchema.safeParse({
      ...baseValid,
      CLIENT_ORIGINS: ' "https://frontend.vercel.app/" , \'https://custom.com\' ',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.CLIENT_ORIGINS).toContain('https://frontend.vercel.app');
    expect(result.data.CLIENT_ORIGINS).toContain('https://custom.com');
    expect(result.data.CLIENT_ORIGINS).toContain('https://ajaytourtravels.com');
  });

  test('handles onrender.com subdomains without adding invalid www subdomain', () => {
    const result = envSchema.safeParse({
      ...baseValid,
      SITE_URL: 'https://ajay-tour-travels-api.onrender.com/',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.SITE_URL).toBe('https://ajay-tour-travels-api.onrender.com');
    expect(result.data.CLIENT_ORIGINS).toContain('https://ajay-tour-travels-api.onrender.com');
    expect(result.data.CLIENT_ORIGINS).not.toContain('https://www.ajay-tour-travels-api.onrender.com');
  });

  test('fails if production origin is not https', () => {
    const result = envSchema.safeParse({
      ...baseValid,
      CLIENT_ORIGINS: 'http://insecure.com',
    });
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('CLIENT_ORIGINS'))).toBe(true);
  });
});
