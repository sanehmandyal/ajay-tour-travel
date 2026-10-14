import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';

export const getIn = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
export function setIn(o, path, val) {
  const [h, ...rest] = path.split('.');
  const clone = Array.isArray(o) ? [...o] : { ...(o || {}) };
  clone[h] = rest.length ? setIn(clone[h], rest.join('.'), val) : val;
  return clone;
}

/** Turns form state into an API payload: drops server-only keys, converts numbers, removes empty slugs. */
export function toPayload(value, fields) {
  const out = {};
  for (const f of fields) {
    let v = value?.[f.name];
    if (f.type === 'number') {
      if (v === '' || v === undefined || v === null) { if (f.nullable) out[f.name] = null; continue; }
      out[f.name] = Number(v);
    } else if (f.type === 'group' || f.type === 'image') {
      out[f.name] = toPayload(v || {}, f.type === 'image' ? IMAGE_FIELDS : f.fields);
    } else if (f.type === 'imagelist') {
      out[f.name] = (v || []).filter((it) => it?.url).map((it) => toPayload(it, IMAGE_FIELDS));
    } else if (f.type === 'list') {
      out[f.name] = (v || []).map((it) => toPayload(it, f.fields));
    } else if (f.type === 'select' && f.nullable) {
      out[f.name] = v ? v : null;
    } else if (f.type === 'select' && f.numeric) {
      out[f.name] = Number(v);
    } else if (f.name === 'slug' && !v) {
      continue;
    } else if (v !== undefined) {
      out[f.name] = v;
    }
  }
  return out;
}

const IMAGE_FIELDS = [{ name: 'url', type: 'text' }, { name: 'alt', type: 'text' }, { name: 'width', type: 'number' }, { name: 'height', type: 'number' }];

function LinesField({ id, value, onChange, rows = 4 }) {
  const [text, setText] = useState((value || []).join('\n'));
  return <textarea id={id} rows={rows} className="field" value={text} onChange={(e) => { setText(e.target.value); onChange(e.target.value.split('\n').map((x) => x.trim()).filter(Boolean)); }} />;
}

function SelectField({ id, f, value, onChange }) {
  const [opts, setOpts] = useState(f.options || []);
  useEffect(() => {
    if (!f.optionsFrom) return;
    adminApi.getWithMeta(`${f.optionsFrom.endpoint}?limit=100`).then((r) => setOpts(r.data.map((x) => [x[f.optionsFrom.value || '_id'], f.optionsFrom.label(x)]))).catch(() => {});
  }, [f]);
  return (
    <select id={id} className="field" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {f.nullable && <option value="">None</option>}
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function ImageField({ id, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const v = value || {};
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await adminApi.post('/media', fd);
      onChange({ ...v, url: r.url, width: r.width, height: r.height });
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); e.target.value = ''; }
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input id={id} className="field" placeholder="https://… or /api/media/…" value={v.url || ''} onChange={(e) => onChange({ ...v, url: e.target.value })} />
        <label className="btn-ghost cursor-pointer !px-3" title="Upload and optimize an image"><span className="sr-only">Upload image</span>{busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={upload} /></label>
      </div>
      <input className="field" placeholder="Alt text (describe the image)" aria-label="Image alt text" value={v.alt || ''} onChange={(e) => onChange({ ...v, alt: e.target.value })} />
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      {v.url?.startsWith('/api/media/') && <p className="text-xs text-navy-700/70">Uploaded and converted to responsive WebP.</p>}
    </div>
  );
}

export function FormFields({ fields, value, onChange, errors = {}, base = '' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const path = `${base}${f.name}`;
        const id = `ff-${path.replace(/\./g, '-')}`;
        const val = value?.[f.name];
        const err = errors[path];
        const set = (nv) => onChange({ ...value, [f.name]: nv });
        const wide = ['textarea', 'html', 'lines', 'group', 'list', 'image', 'imagelist'].includes(f.type) || f.wide;
        let input;
        switch (f.type) {
          case 'textarea': input = <textarea id={id} rows={f.rows || 4} className="field" value={val ?? ''} onChange={(e) => set(e.target.value)} />; break;
          case 'html': input = <textarea id={id} rows={f.rows || 14} className="field font-mono text-sm" value={val ?? ''} onChange={(e) => set(e.target.value)} spellCheck="false" />; break;
          case 'checkbox': input = <label className="flex min-h-[44px] items-center gap-3"><input id={id} type="checkbox" className="h-5 w-5 accent-teal-600" checked={!!val} onChange={(e) => set(e.target.checked)} /><span className="text-sm">{f.help || 'Enabled'}</span></label>; break;
          case 'select': input = <SelectField id={id} f={f} value={val} onChange={set} />; break;
          case 'lines': input = <LinesField id={id} value={val} onChange={set} rows={f.rows} />; break;
          case 'image': input = <ImageField id={id} value={val} onChange={set} />; break;
          case 'imagelist': input = (
            <div className="space-y-3">
              {(val || []).map((it, i) => (
                <div key={i} className="rounded-2xl border border-navy-900/10 bg-ivory/50 p-4">
                  <ImageField id={`${id}-${i}`} value={it} onChange={(nv) => set(val.map((x, k) => (k === i ? nv : x)))} />
                  <button type="button" onClick={() => set(val.filter((_, k) => k !== i))} className="mt-3 inline-flex min-h-[40px] items-center gap-1 text-sm text-red-700 hover:underline"><Trash2 size={15} aria-hidden="true" />Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => set([...(val || []), {}])} className="btn-ghost !min-h-[40px]"><Plus size={16} aria-hidden="true" />Add image</button>
            </div>); break;
          case 'group': input = <div className="rounded-2xl border border-navy-900/10 p-4"><FormFields fields={f.fields} value={val || {}} onChange={set} errors={errors} base={`${path}.`} /></div>; break;
          case 'list': input = (
            <div className="space-y-3">
              {(val || []).map((it, i) => (
                <div key={i} className="rounded-2xl border border-navy-900/10 bg-ivory/50 p-4">
                  <FormFields fields={f.fields} value={it} onChange={(nv) => set(val.map((x, k) => (k === i ? nv : x)))} errors={errors} base={`${path}.${i}.`} />
                  <button type="button" onClick={() => set(val.filter((_, k) => k !== i))} className="mt-3 inline-flex min-h-[40px] items-center gap-1 text-sm text-red-700 hover:underline"><Trash2 size={15} aria-hidden="true" />Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => set([...(val || []), f.empty ? f.empty() : {}])} className="btn-ghost !min-h-[40px]"><Plus size={16} aria-hidden="true" />{f.addLabel || 'Add item'}</button>
            </div>); break;
          default: input = <input id={id} type={f.type === 'number' ? 'number' : f.type || 'text'} step={f.step} min={f.min} className={`field ${err ? 'field-error' : ''}`} value={val ?? ''} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} maxLength={f.maxLength} />;
        }
        return (
          <div key={f.name} className={wide ? 'sm:col-span-2' : ''}>
            {f.type !== 'checkbox' || f.label ? <label htmlFor={id} className="label">{f.label || f.name}</label> : null}
            {input}
            {f.hint && !err && <p className="mt-1 text-xs text-navy-700/70">{f.hint}</p>}
            {err && <p className="mt-1 text-sm text-red-700" role="alert">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}

export const errorMap = (e) => Object.fromEntries((e?.details || []).map((d) => [d.field, d.message]));
