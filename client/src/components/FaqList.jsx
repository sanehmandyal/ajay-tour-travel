import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqList({ items = [], idPrefix = 'faq' }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <div className="divide-y divide-navy-900/10 rounded-3xl bg-white shadow-soft">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.question}>
            <h3>
              <button type="button" id={`${idPrefix}-btn-${i}`} aria-expanded={isOpen} aria-controls={`${idPrefix}-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)} className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-base font-semibold">
                {f.question}
                <ChevronDown size={20} aria-hidden="true" className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <div id={`${idPrefix}-panel-${i}`} role="region" aria-labelledby={`${idPrefix}-btn-${i}`} hidden={!isOpen} className="px-5 pb-5 text-[15px] leading-7 text-navy-700">{f.answer}</div>
          </div>
        );
      })}
    </div>
  );
}
