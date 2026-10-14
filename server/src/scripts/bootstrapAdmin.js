import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminUser } from '../models/AdminUser.js';
import { logger } from '../utils/logger.js';

export async function ensureAdminUser({ reset = false } = {}) {
  const email = (env.ADMIN_EMAIL || 'admin@ajaytourtravels.com').trim().toLowerCase();
  const username = (env.ADMIN_ID || 'admin').trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;
  const name = env.ADMIN_NAME || 'Administrator';

  if (!password) {
    logger.warn('ADMIN_PASSWORD is not set in environment; skipping admin bootstrap.');
    return null;
  }

  if (password.length < 12) {
    logger.warn('ADMIN_PASSWORD must be at least 12 characters.');
    return null;
  }

  const existing = await AdminUser.findOne({
    $or: [{ email }, { username }],
  });

  if (existing && !reset) {
    if (!existing.username) {
      existing.username = username;
      await existing.save();
    }
    logger.info(`Admin user active: email="${existing.email}", username="${existing.username}"`);
    return existing;
  }

  if (existing && reset) {
    existing.passwordHash = await AdminUser.hashPassword(password);
    existing.tokenVersion += 1;
    existing.failedLoginAttempts = 0;
    existing.lockUntil = null;
    existing.username = username;
    await existing.save();
    logger.info(`Admin password reset for ${email}`);
    return existing;
  }

  const created = await AdminUser.create({
    name,
    email,
    username,
    passwordHash: await AdminUser.hashPassword(password),
  });
  logger.info(`Admin user initialized: email="${email}", username="${username}"`);
  return created;
}

// Standalone CLI execution: node src/scripts/bootstrapAdmin.js [--reset-password]
const isDirectCli = process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1].replace(/\\/g, '/')}`);
if (isDirectCli || process.argv[1]?.endsWith('bootstrapAdmin.js')) {
  const reset = process.argv.includes('--reset-password');
  await connectDB();
  const user = await ensureAdminUser({ reset });
  if (user) {
    console.log(`Admin ready: Email="${user.email}", Username="${user.username}"`);
  }
  await disconnectDB();
}
