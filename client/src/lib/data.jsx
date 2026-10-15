import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext({ data: {}, used: null });
const cache = new Map(); // client-only, 60s TTL
const TTL = 60_000;

/** `initial` carries data embedded by the pre-renderer; `used` (SSR only) records which keys a page read. */
export function DataProvider({ initial = {}, used = null, children }) {
  return <Ctx.Provider value={{ data: initial, used }}>{children}</Ctx.Provider>;
}

export function useApi(key, fetcher) {
  const ctx = useContext(Ctx);
  ctx.used?.add(key);
  const cached = typeof window !== 'undefined' ? cache.get(key) : undefined;
  const seeded = ctx.data[key] !== undefined ? ctx.data[key] : cached && Date.now() - cached.t < TTL ? cached.v : undefined;
  const [st, setSt] = useState({ key: seeded !== undefined ? key : null, data: seeded ?? null, error: null });

  useEffect(() => {
    if (st.key === key) return undefined;
    let alive = true;
    fetcher()
      .then((d) => { cache.set(key, { t: Date.now(), v: d }); if (alive) setSt({ key, data: d, error: null }); })
      .catch((e) => { if (alive) setSt({ key, data: null, error: e }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Live real-time sync: when admin saves/deletes data, immediately re-fetch latest data
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onInvalidate = (e) => {
      const target = e.detail?.key;
      if (!target || target === 'all' || target === key || key.startsWith(`${target}:`) || key.startsWith(target)) {
        fetcher()
          .then((d) => {
            cache.set(key, { t: Date.now(), v: d });
            setSt({ key, data: d, error: null });
          })
          .catch((err) => {
            setSt({ key, data: null, error: err });
          });
      }
    };
    window.addEventListener('ajt:data-invalidated', onInvalidate);
    return () => window.removeEventListener('ajt:data-invalidated', onInvalidate);
  }, [key, fetcher]);

  const current = st.key === key;
  return { data: current ? st.data : null, loading: !current, error: current ? st.error : null };
}

export const clearApiCache = (key) => {
  if (!key || key === 'all') {
    cache.clear();
  } else {
    for (const k of cache.keys()) {
      if (k === key || k.startsWith(`${key}:`) || k.startsWith(key)) cache.delete(k);
    }
  }
};

export const invalidateData = (key = 'all') => {
  clearApiCache(key);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ajt:data-invalidated', { detail: { key } }));
  }
};
