import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { invalidateData } from '../lib/data.jsx';
import { FormFields, toPayload, errorMap } from './FormKit.jsx';
import { SETTINGS_TABS } from './schemas.js';

export default function Settings() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminApi.get('/settings').then(setForm).catch((e) => setMsg({ type: 'error', text: e.message })); }, []);
  if (!form) return <p role={msg.text ? 'alert' : 'status'}>{msg.text || 'Loading settings…'}</p>;

  const allFields = SETTINGS_TABS.flatMap(([, f]) => f);
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErrors({}); setMsg({ type: '', text: '' });
    try {
      const payload = toPayload(form, allFields);
      if (payload.business) {
        payload.business.contactVerified = true;
        if (payload.business.phone && !payload.business.whatsapp) {
          payload.business.whatsapp = payload.business.phone.replace(/\D/g, '');
        }
        if (payload.business.whatsapp && !payload.business.phone) {
          payload.business.phone = `+91 ${payload.business.whatsapp.slice(-10)}`;
        }
      }
      const saved = await adminApi.put('/settings', payload);
      invalidateData('settings');
      invalidateData('all');
      setForm(saved); setMsg({ type: 'ok', text: 'Settings saved. Changes appear on the public website straight away.' });
    } catch (ex) { setErrors(errorMap(ex)); setMsg({ type: 'error', text: ex.message }); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} aria-busy={busy}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Website settings</h1><button type="submit" disabled={busy} className="btn-teal">{busy ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" />Saving…</> : 'Save settings'}</button></div>
      <div role="tablist" aria-label="Settings sections" className="mt-4 flex flex-wrap gap-2">
        {SETTINGS_TABS.map(([name], i) => <button key={name} type="button" role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls={`panel-${i}`} onClick={() => setTab(i)} className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${tab === i ? 'bg-navy-900 text-white' : 'bg-white shadow-soft hover:bg-slate-50'}`}>{name}</button>)}
      </div>
      <p role={msg.type === 'error' ? 'alert' : 'status'} aria-live="polite" className={`mt-3 min-h-[1.25rem] text-sm ${msg.type === 'error' ? 'text-red-700' : 'text-teal-800'}`}>{msg.text}{msg.type === 'error' && Object.keys(errors).length > 0 && ' Check the highlighted fields on each tab.'}</p>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-3 rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <FormFields fields={SETTINGS_TABS[tab][1]} value={form} onChange={setForm} errors={errors} />
      </div>
    </form>
  );
}
