import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let timer = null;

/** Debounced (60s) call to a Vercel Deploy Hook so pre-rendered HTML picks up newly published content. */
export function triggerRebuild() {
  if (!env.VERCEL_DEPLOY_HOOK_URL || env.NODE_ENV === 'test') return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const r = await fetch(env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
      logger.info({ status: r.status }, 'Frontend rebuild triggered');
    } catch (err) {
      logger.error({ err }, 'Deploy hook failed');
    }
  }, 60_000);
  timer.unref?.();
}
