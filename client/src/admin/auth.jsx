import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi, setCsrf } from '../lib/api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    adminApi.get('/auth/me').then((d) => { setCsrf(d.csrfToken); setState({ status: 'in', user: d.user }); }).catch(() => setState({ status: 'out', user: null }));
    const out = () => setState({ status: 'out', user: null });
    window.addEventListener('ajt:unauthorized', out);
    return () => window.removeEventListener('ajt:unauthorized', out);
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await adminApi.post('/auth/login', { email, password });
    setCsrf(d.csrfToken); setState({ status: 'in', user: d.user });
  }, []);
  const logout = useCallback(async () => {
    try { await adminApi.post('/auth/logout', {}); } finally { setCsrf(''); setState({ status: 'out', user: null }); }
  }, []);
  const refreshCsrf = useCallback((t) => setCsrf(t), []);

  return <Ctx.Provider value={{ ...state, login, logout, refreshCsrf }}>{children}</Ctx.Provider>;
}
