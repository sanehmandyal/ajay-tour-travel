import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Sparkles, CheckCircle2, BadgeCheck, AlertTriangle } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';

function Trend({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 600; const h = 140; const bw = w / data.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" role="img" aria-label={`Inquiries per day for the last 30 days. Highest day: ${max}.`}>
        {data.map((d, i) => { const bh = (d.count / max) * h; return <rect key={d.date} x={i * bw + 2} y={h - bh} width={bw - 4} height={Math.max(bh, d.count ? 3 : 1)} rx="2" fill={d.count ? '#1AA6A0' : '#CBD5E1'}><title>{d.date}: {d.count}</title></rect>; })}
        <text x="0" y={h + 16} fontSize="11" fill="#64748b">{data[0]?.date}</text>
        <text x={w} y={h + 16} fontSize="11" fill="#64748b" textAnchor="end">{data[data.length - 1]?.date}</text>
      </svg>
      <figcaption className="sr-only">Daily inquiry counts for the last 30 days</figcaption>
    </figure>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [seo, setSeo] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    adminApi.get('/dashboard').then(setD).catch((e) => setErr(e.message));
    adminApi.get('/seo').then((s) => setSeo(s.audit)).catch(() => {});
  }, []);
  if (err) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">{err}</p>;
  if (!d) return <p className="text-slate-500">Loading dashboard…</p>;
  const cards = [['Total inquiries', d.totals.total, Inbox], ['New', d.totals.new, Sparkles], ['Confirmed', d.totals.confirmed, BadgeCheck], ['Completed', d.totals.completed, CheckCircle2]];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {d.sampleCount > 0 && (
        <div role="note" className="flex items-start gap-3 rounded-2xl border border-sunset-400/50 bg-sunset-400/10 p-4 text-sm"><AlertTriangle className="mt-0.5 shrink-0 text-sunset-600" size={18} aria-hidden="true" />
          <p><strong>{d.sampleCount} published item{d.sampleCount > 1 ? 's are' : ' is'} still sample content.</strong> Review destinations, vehicles, packages, FAQs and blog posts, then untick "Sample content" once verified. Also add and verify your contact details in <Link to="/admin/settings" className="underline">Settings</Link>.</p></div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, n, Icon]) => <div key={l} className="rounded-2xl bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-slate-600">{l}</p><Icon size={18} className="text-teal-600" aria-hidden="true" /></div><p className="mt-2 text-3xl font-semibold">{n}</p></div>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl bg-white p-5 shadow-soft" aria-labelledby="tr-h"><h2 id="tr-h" className="mb-3 text-lg font-semibold">Inquiries, last 30 days</h2><Trend data={d.trend} /></section>
        <section className="rounded-2xl bg-white p-5 shadow-soft" aria-labelledby="pop-h"><h2 id="pop-h" className="mb-3 text-lg font-semibold">Popular destination pages</h2>
          {d.popular.length ? <ol className="space-y-2 text-sm">{d.popular.map((p) => <li key={p.slug} className="flex justify-between gap-3"><span>{p.name}</span><span className="text-slate-500">{p.viewCount || 0} views</span></li>)}</ol> : <p className="text-sm text-slate-500">No data yet.</p>}
        </section>
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-soft" aria-labelledby="rec-h">
        <div className="mb-3 flex items-center justify-between"><h2 id="rec-h" className="text-lg font-semibold">Recent inquiries</h2><Link to="/admin/inquiries" className="text-sm text-teal-800 underline">View all</Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2 pr-3">Reference</th><th className="pr-3">Customer</th><th className="pr-3">Trip</th><th className="pr-3">Status</th><th>Received</th></tr></thead>
          <tbody>{d.recent.map((r) => <tr key={r._id} className="border-t border-slate-100"><td className="py-2 pr-3 font-mono text-xs"><Link to={`/admin/inquiries?open=${r._id}`} className="text-teal-800 underline">{r.reference}</Link></td><td className="pr-3">{r.name}</td><td className="pr-3">{r.pickup} to {r.destination}</td><td className="pr-3">{r.status}</td><td>{fmtDateTime(r.createdAt)}</td></tr>)}
            {!d.recent.length && <tr><td colSpan="5" className="py-6 text-center text-slate-500">No inquiries yet.</td></tr>}</tbody></table></div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-soft"><h2 className="text-lg font-semibold">Published content</h2>
          <p className="mt-2 text-sm text-slate-600">{d.content.destinations} destinations · {d.content.routes} routes · {d.content.vehicles} vehicles · {d.content.packages} packages · {d.content.posts} posts</p></section>
        <section className="rounded-2xl bg-white p-5 shadow-soft"><h2 className="text-lg font-semibold">Search Engine Status</h2>
          <p className="mt-2 text-sm text-slate-600">{seo ? (seo.issueCount ? `${seo.issueCount} recommendation${seo.issueCount > 1 ? 's' : ''} across ${seo.checked} pages.` : `All ${seo.checked} core pages pass checks with automated meta tags & schema markup.`) : 'Checking status…'}</p></section>
      </div>
    </div>
  );
}
