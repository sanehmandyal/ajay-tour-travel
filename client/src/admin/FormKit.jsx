import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, Loader2, Check, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { adminApi, API_BASE } from '../lib/api.js';

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

function ImageField({ id, value, onChange, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const v = value || {};

  const handleUploadFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (v.alt) fd.append('alt', v.alt);
      const r = await adminApi.post('/media', fd);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      onChange({
        ...v,
        url: r.url,
        alt: v.alt || cleanName,
        width: r.width,
        height: r.height,
      });
    } catch (ex) {
      setErr(ex.message || 'Image upload failed. Ensure the file is a valid JPG, PNG, or WebP under 8MB.');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUploadFile(file);
  };

  const previewSrc = v.url
    ? v.url.startsWith('/api/media/')
      ? `${API_BASE}${v.url}/480`
      : v.url
    : null;

  return (
    <div className="space-y-3">
      {/* Visual Image Preview if URL exists */}
      {previewSrc ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 p-3 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative aspect-[16/10] w-full max-w-[180px] shrink-0 overflow-hidden rounded-xl bg-navy-950 border border-slate-200 shadow-sm">
              <img
                src={previewSrc}
                alt={v.alt || 'Preview'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x250?text=Preview+Error';
                }}
              />
              <span className="absolute bottom-1 right-1 rounded bg-navy-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                {v.width && v.height ? `${v.width}×${v.height}` : 'Active'}
              </span>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Check size={13} className="text-emerald-600" />
                  Image Uploaded
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ url: '', alt: '', width: undefined, height: undefined })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>

              <input
                id={id ? `${id}-alt` : undefined}
                className="field text-xs !py-1.5"
                placeholder="Alt description (e.g. Innova Crysta Cab in Himachal)"
                value={v.alt || ''}
                onChange={(e) => onChange({ ...v, alt: e.target.value })}
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="btn-ghost !min-h-[32px] !py-1 !px-2.5 !text-xs font-semibold"
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>Choose Different File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode(mode === 'url' ? 'upload' : 'url')}
                  className="text-xs text-navy-600 hover:text-teal-700 underline"
                >
                  {mode === 'url' ? 'Hide raw URL' : 'Edit raw URL'}
                </button>
              </div>

              {mode === 'url' && (
                <input
                  id={id}
                  className="field text-xs font-mono !py-1"
                  value={v.url || ''}
                  onChange={(e) => onChange({ ...v, url: e.target.value })}
                  placeholder="https://... or /api/media/..."
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Image Selection / Device Upload Dropzone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center transition-all ${
            dragOver
              ? 'border-teal-500 bg-teal-50/50 shadow-md'
              : 'border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/15 text-teal-800 shadow-sm">
              {busy ? <Loader2 size={22} className="animate-spin" /> : <Upload size={20} />}
            </div>

            <div>
              <p className="text-sm font-bold text-navy-950">
                {busy ? 'Uploading & optimizing image from device...' : 'Upload Image from Your Device'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Click below to pick a photo from your computer or phone
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="btn-teal !min-h-[38px] !px-4 !text-xs font-semibold shadow-sm"
              >
                <Upload size={14} />
                <span>Browse Device Files</span>
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === 'url' ? 'upload' : 'url')}
                className="btn-ghost !min-h-[38px] !px-3 !text-xs font-medium"
              >
                <LinkIcon size={13} />
                <span>{mode === 'url' ? 'Cancel URL' : 'Paste Web URL'}</span>
              </button>
            </div>

            {mode === 'url' && (
              <div className="w-full max-w-md pt-2">
                <input
                  id={id}
                  className="field text-xs font-mono"
                  placeholder="https://... or /api/media/..."
                  value={v.url || ''}
                  onChange={(e) => onChange({ ...v, url: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        onChange={onFileChange}
      />

      {err && (
        <p role="alert" className="text-xs font-semibold text-red-600 flex items-center gap-1">
          <AlertCircle size={14} className="shrink-0" />
          <span>{err}</span>
        </p>
      )}
    </div>
  );
}

function ImageListField({ id, value, onChange }) {
  const [multiBusy, setMultiBusy] = useState(false);
  const [multiErr, setMultiErr] = useState('');
  const multiInputRef = useRef(null);
  const list = value || [];

  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setMultiBusy(true);
    setMultiErr('');
    try {
      const uploadedImages = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const r = await adminApi.post('/media', fd);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        uploadedImages.push({
          url: r.url,
          alt: cleanName,
          width: r.width,
          height: r.height,
        });
      }
      onChange([...list, ...uploadedImages]);
    } catch (ex) {
      setMultiErr(ex.message || 'One or more images could not be uploaded.');
    } finally {
      setMultiBusy(false);
      if (multiInputRef.current) multiInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload multiple images from device banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-teal-500/10 p-3.5 border border-teal-500/25">
        <div>
          <h4 className="text-xs font-bold text-teal-950">Photo Gallery (Fleet &amp; Tours)</h4>
          <p className="text-[11px] text-teal-800">Select multiple car or destination photos from your device at once</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={multiBusy}
            onClick={() => multiInputRef.current?.click()}
            className="btn-teal !min-h-[36px] !px-3.5 !text-xs font-semibold shadow-sm"
          >
            {multiBusy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{multiBusy ? 'Uploading Photos...' : 'Upload Photos from Device'}</span>
          </button>
          <input
            ref={multiInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="sr-only"
            onChange={handleMultipleUpload}
          />
          <button
            type="button"
            onClick={() => onChange([...list, {}])}
            className="btn-ghost !min-h-[36px] !px-3 !text-xs"
          >
            <Plus size={14} /> Add Single
          </button>
        </div>
      </div>

      {multiErr && (
        <p role="alert" className="text-xs font-semibold text-red-600 flex items-center gap-1">
          <AlertCircle size={14} className="shrink-0" />
          <span>{multiErr}</span>
        </p>
      )}

      {/* Grid of image cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((it, i) => (
          <div key={i} className="relative rounded-2xl border border-navy-900/10 bg-ivory/50 p-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-navy-900/10">
              <span className="text-xs font-bold text-navy-800">Photo #{i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, k) => k !== i))}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
            <ImageField
              id={`${id}-${i}`}
              value={it}
              onChange={(nv) => onChange(list.map((x, k) => (k === i ? nv : x)))}
              compact
            />
          </div>
        ))}
        {!list.length && (
          <div className="sm:col-span-2 text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No photos added yet. Click &quot;Upload Photos from Device&quot; above to add images.
          </div>
        )}
      </div>
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
          case 'imagelist': input = <ImageListField id={id} value={val} onChange={set} />; break;
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
