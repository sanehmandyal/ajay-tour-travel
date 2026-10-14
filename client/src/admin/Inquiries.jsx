import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, X, Phone, MessageCircle, Loader2, Plus } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { fmtDate, fmtDateTime } from '../lib/format.js';
import { whatsappHref, telHref } from '../lib/contact.js';

const STATUSES = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Cancelled'];
const TONE = { New: 'bg-sunset-400/25 text-sunset-600', Contacted: 'bg-sky-100 text-sky-800', Quoted: 'bg-indigo-100 text-indigo-800', Confirmed: 'bg-teal-500/15 text-teal-800', Completed: 'bg-emerald-100 text-emerald-800', Cancelled: 'bg-slate-200 text-slate-700' };
const Pill = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[s]}`}>{s}</span>;

function Detail({ id, onClose, onChanged }) {
  const [d, setD] = useState(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminApi.get(`/inquiries/${id}`).then(setD).catch((e) => setMsg(e.message)); }, [id]);

  const run = async (fn, ok) => { setBusy(true); setMsg(''); try { const r = await fn(); if (r) setD(r); setMsg(ok); onChanged(); } catch (e) { setMsg(e.message); } finally { setBusy(false); } };
  if (!d) return <Shell onClose={onClose}><p role="status">{msg || 'Loading…'}</p></Shell>;
  const anon = !!d.anonymizedAt;
  const row = (l, v) => <div><dt className="text-xs uppercase tracking-wide text-slate-500">{l}</dt><dd className="mt-0.5">{v || <span className="text-slate-400">-</span>}</dd></div>;
  const waMsg = `Hello ${d.name}, this is Ajay Tour and Travels about your trip request ${d.reference} (${d.pickup} to ${d.destination}).`;

  return (
    <Shell onClose={onClose} title={`Inquiry ${d.reference}`}>
      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-teal-800">{msg}</p>
      <div className="flex flex-wrap items-center gap-3"><Pill s={d.status} />{anon && <span className="text-sm text-slate-500">Anonymized {fmtDate(d.anonymizedAt)}</span>}<span className="text-sm text-slate-500">Received {fmtDateTime(d.createdAt)}</span></div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {row('Customer', d.name)}{row('Phone', d.phone)}{row('Email', d.email)}{row('Vehicle', d.vehiclePreference)}
        {row('Pickup', d.pickup)}{row('Destination', d.destination)}{row('Travel date', fmtDate(d.travelDate))}{row('Pickup time', d.pickupTime)}
        {row('Passengers', d.passengers)}{row('Trip type', d.tripType)}{d.tripType === 'round-trip' && row('Return date', fmtDate(d.returnDate))}{row('Source page', d.sourcePage)}
        <div className="sm:col-span-2">{row('Requirements', <span className="whitespace-pre-wrap">{d.requirements}</span>)}</div>
      </dl>
      {!anon && (
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="btn-ghost !min-h-[40px]" href={telHref(d.phone)}><Phone size={15} aria-hidden="true" />Call</a>
          <a className="btn-ghost !min-h-[40px]" href={whatsappHref(d.phone, waMsg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
        </div>
      )}
      <div className="mt-6"><label htmlFor="st" className="label">Status</label>
        <select id="st" className="field max-w-xs" value={d.status} disabled={busy} onChange={(e) => run(() => adminApi.patch(`/inquiries/${id}/status`, { status: e.target.value }), 'Status updated')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <section className="mt-6" aria-labelledby="notes-h"><h3 id="notes-h" className="font-semibold">Internal notes</h3>
        <ul className="mt-2 space-y-2">{(d.notes || []).map((n) => <li key={n._id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-1 text-xs text-slate-500">{fmtDateTime(n.createdAt)}</p></li>)}{!d.notes?.length && <li className="text-sm text-slate-500">No notes yet.</li>}</ul>
        {!anon && <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) run(async () => { const r = await adminApi.post(`/inquiries/${id}/notes`, { text: note }); setNote(''); return r; }, 'Note added'); }}>
          <label htmlFor="nt" className="sr-only">Add a note</label><input id="nt" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" maxLength={2000} /><button type="submit" disabled={busy || !note.trim()} className="btn-teal !px-4">Add</button></form>}
      </section>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
        {!anon && <button type="button" disabled={busy} className="btn-ghost" onClick={() => window.confirm('Remove the customer\'s name, phone, email, notes and requirements? The trip route and dates are kept for statistics.') && run(() => adminApi.post(`/inquiries/${id}/anonymize`, {}), 'Personal data removed')}>Anonymize personal data</button>}
        <button type="button" disabled={busy} className="btn-ghost !border-red-300 !text-red-700" onClick={() => window.confirm('Permanently delete this inquiry?') && run(async () => { await adminApi.del(`/inquiries/${id}`); onClose(); return null; }, 'Deleted')}>Delete</button>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose, title = 'Inquiry' }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-navy-950/60" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-float sm:p-7">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100" aria-label="Close"><X aria-hidden="true" /></button></div>
        {children}
      </div>
    </div>
  );
}

export default function Inquiries() {
  const [sp, setSp] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [f, setF] = useState({ q: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState('loading');
  const [msg, setMsg] = useState('');
  const open = sp.get('open');

  const qs = useCallback(() => new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).toString(), [f]);
  const load = useCallback(async () => {
    setState('loading');
    try { const r = await adminApi.getWithMeta(`/inquiries?page=${page}&limit=20&${qs()}`); setRows(r.data); setMeta(r.meta); setState('ready'); } catch (e) { setMsg(e.message); setState('error'); }
  }, [page, qs]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  async function exportCsv() {
    try {
      const blob = await adminApi.blob(`/inquiries/export.csv?${qs()}`);
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
    } catch (e) { setMsg(e.message); }
  }
  async function purge() {
    if (!window.confirm('Anonymize all inquiries older than your retention period (Settings)? This cannot be undone.')) return;
    try { const r = await adminApi.post('/inquiries/purge-expired', {}); setMsg(`${r.anonymized} inquiries anonymized (retention ${r.retentionDays} days).`); load(); } catch (e) { setMsg(e.message); }
  }
  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setPage(1); };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Inquiries</h1>
        <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost !min-h-[40px]" onClick={exportCsv}><Download size={16} aria-hidden="true" />Export CSV</button><button type="button" className="btn-ghost !min-h-[40px]" onClick={purge}>Retention clean-up</button></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><label htmlFor="fq" className="sr-only">Search</label><input id="fq" type="search" className="field" placeholder="Search name, phone, reference…" value={f.q} onChange={set('q')} /></div>
        <div><label htmlFor="fs" className="sr-only">Status</label><select id="fs" className="field" value={f.status} onChange={set('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label htmlFor="ff" className="label !mb-0.5 text-xs">From</label><input id="ff" type="date" className="field" value={f.from} onChange={set('from')} /></div>
        <div><label htmlFor="ft" className="label !mb-0.5 text-xs">To</label><input id="ft" type="date" className="field" value={f.to} onChange={set('to')} /></div>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-teal-800">{msg}</p>
      <div className="mt-2 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr>{['Reference', 'Customer', 'Trip', 'Travel date', 'Status', 'Received'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {state === 'loading' && <tr><td colSpan="6" className="py-8 text-center"><Loader2 className="mx-auto animate-spin" aria-label="Loading" /></td></tr>}
            {state === 'ready' && !rows.length && <tr><td colSpan="6" className="py-8 text-center text-slate-500">No inquiries match.</td></tr>}
            {state === 'ready' && rows.map((r) => (
              <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs"><button type="button" onClick={() => setSp({ open: r._id })} className="text-teal-800 underline">{r.reference}</button></td>
                <td className="px-4 py-3">{r.name}<div className="text-xs text-slate-500">{r.phone}</div></td><td className="px-4 py-3">{r.pickup} to {r.destination}</td>
                <td className="px-4 py-3">{fmtDate(r.travelDate)}</td><td className="px-4 py-3"><Pill s={r.status} /></td><td className="px-4 py-3 text-slate-600">{fmtDateTime(r.createdAt)}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && <div className="mt-4 flex items-center justify-center gap-3 text-sm"><button type="button" className="btn-ghost !min-h-[40px]" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {meta.page} of {meta.totalPages} ({meta.total})</span><button type="button" className="btn-ghost !min-h-[40px]" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button></div>}
      {open && <Detail key={open} id={open} onClose={() => setSp({})} onChanged={load} />}
    </div>
  );
}
