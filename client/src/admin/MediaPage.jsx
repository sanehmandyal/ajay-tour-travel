import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Copy, Loader2 } from 'lucide-react';
import { adminApi, API_BASE } from '../lib/api.js';

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const input = useRef(null);
  const load = () => adminApi.get('/media').then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  async function upload(e) {
    e.preventDefault();
    const files = Array.from(input.current?.files || []);
    if (!files.length) { setMsg('Choose an image first'); return; }
    setBusy(true); setMsg('');
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        if (alt) fd.append('alt', alt);
        await adminApi.post('/media', fd);
      }
      setAlt('');
      if (input.current) input.current.value = '';
      setMsg(`${files.length} image${files.length > 1 ? 's' : ''} uploaded and optimized`);
      load();
    } catch (ex) { setMsg(ex.message); } finally { setBusy(false); }
  }
  async function del(m) {
    if (!window.confirm('Delete this image? Pages using it will show no image.')) return;
    try { await adminApi.del(`/media/${m.id}`); load(); } catch (ex) { setMsg(ex.message); }
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">Media library</h1>
      <p className="mt-1 text-sm text-slate-600">Upload photos directly from your device. Images are resized and converted to responsive WebP automatically (up to 8 MB per upload). Copy the URL into any destination or vehicle field.</p>
      <form onSubmit={upload} className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5 shadow-soft border border-slate-200">
        <div>
          <label htmlFor="mf" className="label font-semibold text-navy-900">Choose images from device</label>
          <input id="mf" ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="field" />
        </div>
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="ma" className="label font-semibold text-navy-900">Alt text / Description (optional)</label>
          <input id="ma" className="field" placeholder="e.g. Innova Crysta Mountain View" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} />
        </div>
        <button type="submit" disabled={busy} className="btn-teal">
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
          {busy ? 'Optimizing...' : 'Upload from Device'}
        </button>
      </form>
      <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-teal-800">{msg}</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <img src={`${API_BASE}${m.url}/480`} alt={m.alt || m.name || ''} loading="lazy" width="480" height="320" className="aspect-[3/2] w-full object-cover" />
            <div className="p-3 text-xs"><p className="truncate font-medium">{m.name}</p><p className="truncate font-mono text-slate-500">{m.url}</p>
              <div className="mt-2 flex gap-2"><button type="button" className="btn-ghost !min-h-[36px] !px-3 !text-xs" onClick={() => navigator.clipboard?.writeText(m.url).then(() => setMsg('URL copied'))}><Copy size={12} aria-hidden="true" />Copy URL</button>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-red-700 hover:bg-red-50" onClick={() => del(m)} aria-label={`Delete ${m.name}`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
          </li>))}
        {!items.length && <li className="text-sm text-slate-500">No images uploaded yet.</li>}
      </ul>
    </div>
  );
}
