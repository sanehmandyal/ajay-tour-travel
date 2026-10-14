import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { FormFields, toPayload, errorMap } from './FormKit.jsx';
import { RESOURCES } from './schemas.js';

const badge = (v) => {
  const good = v === 'published' || v === 'available';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${good ? 'bg-teal-500/15 text-teal-800' : 'bg-slate-200 text-slate-700'}`}>{v}</span>;
};

function Editor({ cfg, item, onClose, onSaved }) {
  const isNew = !item._id;
  const [form, setForm] = useState(item);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setBanner(''); setErrors({});
    try {
      const payload = toPayload(form, cfg.fields);
      const saved = isNew ? await adminApi.post(cfg.endpoint, payload) : await adminApi.put(`${cfg.endpoint}/${item._id}`, payload);
      onSaved(saved);
    } catch (ex) { setErrors(errorMap(ex)); setBanner(ex.message); document.getElementById('editor-top')?.scrollIntoView({ block: 'nearest' }); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <button type="button" className="absolute inset-0 bg-navy-950/60" aria-label="Close editor" onClick={onClose} tabIndex={-1} />
      <form onSubmit={save} className="relative flex h-full w-full max-w-3xl flex-col bg-white shadow-float" aria-busy={busy}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 id="editor-title" className="text-lg font-semibold">{isNew ? `New ${cfg.singular}` : `Edit ${cfg.singular}`}</h2>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100" aria-label="Close"><X aria-hidden="true" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div id="editor-top" />
          {banner && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-900">{banner}{Object.keys(errors).length > 0 && ' Check the highlighted fields.'}</p>}
          <FormFields fields={cfg.fields} value={form} onChange={setForm} errors={errors} />
        </div>
        <div className="flex gap-3 border-t border-slate-200 p-4">
          <button type="submit" disabled={busy} className="btn-teal">{busy ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" />Saving…</> : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function ResourcePage({ name }) {
  const cfg = RESOURCES[name];
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const r = await adminApi.getWithMeta(`${cfg.endpoint}?${params}`);
      setRows(r.data); setMeta(r.meta); setState('ready');
    } catch (ex) { setError(ex.message); setState('error'); }
  }, [cfg.endpoint, page, q, filters]);

  useEffect(() => { setPage(1); setQ(''); setFilters({}); setEditing(null); }, [name]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  async function remove(r) {
    if (!window.confirm(`Delete this ${cfg.singular}? This cannot be undone.`)) return;
    try { await adminApi.del(`${cfg.endpoint}/${r._id}`); setNotice(`${cfg.singular} deleted`); load(); } catch (ex) { setNotice(ex.message); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{cfg.title}</h1>
        <button type="button" className="btn-teal" onClick={() => setEditing({ ...cfg.blank() })}><Plus size={16} aria-hidden="true" />New {cfg.singular}</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <div><label htmlFor="rq" className="sr-only">Search</label><input id="rq" type="search" className="field !w-64" placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        {cfg.filters.map((f) => (
          <div key={f.key}><label htmlFor={`rf-${f.key}`} className="sr-only">{f.label}</label>
            <select id={`rf-${f.key}`} className="field !w-44" value={filters[f.key] || ''} onChange={(e) => { setFilters((p) => ({ ...p, [f.key]: e.target.value })); setPage(1); }}>{f.options.map(([v, l]) => <option key={v} value={v}>{f.label}: {l}</option>)}</select></div>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-teal-800">{notice}</p>
      {state === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">{error}</p>}
      <div className="mt-2 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr>{cfg.columns.map(([k, l]) => <th key={k} scope="col" className="px-4 py-3 font-semibold">{l}</th>)}<th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead>
          <tbody>
            {state === 'loading' && <tr><td colSpan={cfg.columns.length + 1} className="px-4 py-8 text-center text-slate-500"><Loader2 className="mx-auto animate-spin" aria-label="Loading" /></td></tr>}
            {state === 'ready' && !rows.length && <tr><td colSpan={cfg.columns.length + 1} className="px-4 py-8 text-center text-slate-500">Nothing here yet.</td></tr>}
            {state === 'ready' && rows.map((r) => (
              <tr key={r._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                {cfg.columns.map(([k, , render], i) => (
                  <td key={k} className="px-4 py-3 align-top">
                    {i === 0 ? <button type="button" onClick={() => setEditing(r)} className="text-left font-medium text-teal-800 hover:underline">{render ? render(r) : r[k]}</button>
                      : k === 'status' ? badge(r[k]) : render ? render(r) : String(r[k] ?? '')}
                    {i === 0 && r.isSample && <span className="ml-2 rounded-full bg-sunset-400/25 px-2 py-0.5 text-[11px] font-medium text-sunset-600">Sample</span>}
                  </td>
                ))}
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                  {cfg.preview && r.slug && r.status === 'published' && <a href={cfg.preview(r)} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100" aria-label={`View ${r.title || r.name} on site`}><ExternalLink size={16} aria-hidden="true" /></a>}
                  <button type="button" onClick={() => setEditing(r)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100" aria-label="Edit"><Pencil size={16} aria-hidden="true" /></button>
                  <button type="button" onClick={() => remove(r)} className="grid h-10 w-10 place-items-center rounded-lg text-red-700 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} aria-hidden="true" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button type="button" className="btn-ghost !min-h-[40px]" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {meta.page} of {meta.totalPages} ({meta.total})</span>
          <button type="button" className="btn-ghost !min-h-[40px]" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
      {editing && <Editor key={editing._id || 'new'} cfg={cfg} item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice(`${cfg.singular} saved`); load(); }} />}
    </div>
  );
}
