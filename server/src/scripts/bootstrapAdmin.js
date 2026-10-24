import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminUser } from '../models/AdminUser.js';
import { logger } from '../utils/logger.js';

export async function ensureAdminUser({ reset = false } = {}) {
  const email = (env.ADMIN_EMAIL || 'admin@ajaytourtravels.com').trim().toLowerCase();
  const username = (env.ADMIN_ID || 'admin').trim().toLowerCase();
  const password = env.ADMIN_PASSWORD || 'Admin@AjayTour2026!';
  const name = env.ADMIN_NAME || 'Administrator';

  const existing = await AdminUser.findOne({
    $or: [{ email }, { username }],
  }).select('+passwordHash');

  if (existing) {
    let changed = false;
    if (existing.email !== email) {
      existing.email = email;
      changed = true;
    }
    if (existing.username !== username) {
      existing.username = username;
      changed = true;
    }
    if (!existing.isActive) {
      existing.isActive = true;
      changed = true;
    }
    if (existing.failedLoginAttempts > 0 || existing.lockUntil) {
      existing.failedLoginAttempts = 0;
      existing.lockUntil = null;
      changed = true;
    }
    const matches = await existing.verifyPassword(password);
    if (!matches || reset) {
      existing.passwordHash = await AdminUser.hashPassword(password);
      existing.tokenVersion += 1;
      changed = true;
      logger.info(`Admin password synchronized for ${email}`);
    }
    if (changed) {
      await existing.save();
    }
    logger.info(`Admin user active: email="${existing.email}", username="${existing.username}"`);
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
