import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ExternalLink, Copy } from 'lucide-react';
import { adminApi, API_BASE } from '../lib/api.js';
import { invalidateData } from '../lib/data.jsx';
import { FormFields, toPayload, errorMap } from './FormKit.jsx';

const META_FIELDS = [
  { name: 'title', label: 'SEO title', hint: '60 characters or fewer', maxLength: 70 },
  { name: 'description', label: 'Meta description', type: 'textarea', rows: 3, hint: '70-160 characters', maxLength: 170 },
  { name: 'canonicalUrl', label: 'Canonical URL (optional)', type: 'url' }, { name: 'ogImage', label: 'Social sharing image URL' },
  { name: 'noindex', label: 'Hide from search engines', type: 'checkbox', help: 'noindex and removed from sitemap' },
];

export default function SeoPage() {
  const [data, setData] = useState(null);
  const [redirects, setRedirects] = useState([]);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => { adminApi.get('/seo').then(setData).catch((e) => setMsg(e.message)); adminApi.getWithMeta('/redirects?limit=100').then((r) => setRedirects(r.data)).catch(() => {}); };
  useEffect(load, []);

  const snippet = useMemo(() => JSON.stringify({ redirects: redirects.filter((r) => r.enabled).map((r) => ({ source: r.from, destination: r.to, permanent: [301, 308].includes(r.statusCode) })) }, null, 2), [redirects]);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setErrors({}); setMsg('');
    try {
      await adminApi.put('/seo', { path: edit.path, ...toPayload(form, META_FIELDS) });
      invalidateData('all');
      setEdit(null); setMsg('SEO settings saved'); load();
    } catch (ex) { setErrors(errorMap(ex)); setMsg(ex.message); } finally { setBusy(false); }
  }
  if (!data) return <p role="status">{msg || 'Loading SEO tools…'}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">SEO and redirects</h1>
      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-teal-800">{msg}</p>

      <section aria-labelledby="pg-h" className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 id="pg-h" className="text-lg font-semibold">Main pages</h2>
        <p className="mt-1 text-sm text-slate-600">Destinations, blog posts and packages have their own SEO fields in their editors.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2 pr-3">Page</th><th className="pr-3">Title</th><th className="pr-3">Indexed</th><th /></tr></thead>
          <tbody>{data.pages.map((p) => <tr key={p.path} className="border-t border-slate-100"><td className="py-2 pr-3"><span className="font-medium">{p.label}</span><div className="text-xs text-slate-500">{p.path}</div></td><td className="pr-3">{p.meta.title || <span className="text-slate-400">Default</span>}</td><td className="pr-3">{p.meta.noindex ? 'No' : 'Yes'}</td>
            <td className="text-right"><button type="button" className="btn-ghost !min-h-[40px]" onClick={() => { setEdit(p); setForm({ title: '', description: '', canonicalUrl: '', ogImage: '', noindex: false, ...p.meta }); setErrors({}); }}>Edit</button></td></tr>)}</tbody></table></div>
      </section>

      {edit && (
        <form onSubmit={save} className="rounded-2xl border-2 border-teal-600 bg-white p-5 shadow-soft" aria-label={`Edit SEO for ${edit.label}`}>
          <h2 className="text-lg font-semibold">SEO for {edit.label}</h2>
          <div className="mt-4"><FormFields fields={META_FIELDS} value={form} onChange={setForm} errors={errors} /></div>
          <div className="mt-5 flex gap-3"><button type="submit" disabled={busy} className="btn-teal">{busy ? <Loader2 size={16} className="animate-spin" aria-label="Saving" /> : 'Save'}</button><button type="button" onClick={() => setEdit(null)} className="btn-ghost">Cancel</button></div>
        </form>
      )}

      <section aria-labelledby="au-h" className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 id="au-h" className="text-lg font-semibold">SEO completeness check</h2>
        <p className="mt-1 text-sm text-slate-600">{data.audit.issueCount ? `${data.audit.issueCount} issue(s) across ${data.audit.checked} published pages.` : `All ${data.audit.checked} published pages pass the basic checks.`}</p>
        {data.audit.issues.length > 0 && <ul className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto text-sm">{data.audit.issues.map((i, k) => <li key={k} className="py-2"><span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">{i.kind}</span><span className="font-medium">{i.ref}</span>: {i.issue}</li>)}</ul>}
      </section>

      <section aria-labelledby="sm-h" className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 id="sm-h" className="text-lg font-semibold">Sitemap and robots.txt</h2>
        <p className="mt-1 text-sm text-slate-600">The sitemap lists only published, indexable pages and updates automatically.</p>
        <p className="mt-3 flex flex-wrap gap-4 text-sm"><a className="inline-flex items-center gap-1 text-teal-800 underline" href={`${API_BASE}/api/sitemap.xml`} target="_blank" rel="noopener noreferrer">Preview sitemap <ExternalLink size={14} aria-hidden="true" /></a><a className="inline-flex items-center gap-1 text-teal-800 underline" href={`${API_BASE}/api/robots.txt`} target="_blank" rel="noopener noreferrer">Preview robots.txt <ExternalLink size={14} aria-hidden="true" /></a></p>
      </section>

      <section aria-labelledby="rd-h" className="rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="rd-h" className="text-lg font-semibold">Redirects</h2><Link to="/admin/redirects" className="btn-teal !min-h-[40px]">Manage redirects</Link></div>
        <p className="mt-2 text-sm text-slate-600">{redirects.length} redirect(s). Visitors are redirected on the site right away. For true HTTP 301/302 responses at the edge, copy the block below into <code>client/vercel.json</code> and redeploy.</p>
        <div className="relative mt-3"><pre className="max-h-64 overflow-auto rounded-xl bg-navy-900 p-4 text-xs text-white">{snippet}</pre>
          <button type="button" className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs text-white hover:bg-white/25" onClick={() => navigator.clipboard?.writeText(snippet).then(() => setMsg('Copied redirect block'))}><Copy size={12} aria-hidden="true" />Copy</button></div>
      </section>
    </div>
  );
}
