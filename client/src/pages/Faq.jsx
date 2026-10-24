import { Seo, breadcrumbLd, faqPageLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { PageHero, ErrorState, EmptyState, Cta, Skeleton } from '../components/ui.jsx';
import FaqList from '../components/FaqList.jsx';

export default function Faq() {
  const { data, loading, error } = useApi('faqs', () => api.get('/api/faqs'));
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }];
  return (
    <>
      <Seo
        path="/faq"
        title="Cab Booking & Tour FAQ | Himyatra Tour and Travels"
        description="Answers to common questions about booking, upfront quotes, fleet options, Shaktipeeth pilgrimage circuits, and railway station transfers in Amb Andaura & Una."
        jsonLd={[breadcrumbLd(crumbs), faqPageLd(data)].filter(Boolean)}
      />
      <PageHero eyebrow="FAQ" title="Frequently asked questions" intro="Quick answers about booking and travelling with us." crumbs={crumbs} />
      <div className="relative isolate overflow-hidden bg-slate-50/60">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Khajjiar.jpg/1280px-Khajjiar.jpg"
            alt="Khajjiar meadow in Chamba Himachal Pradesh"
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-slate-50" />
        </div>
        <div className="container-x section relative"><div className="mx-auto max-w-3xl">
          {loading && <Skeleton className="h-64" />}
          {error && <ErrorState />}
          {!loading && !error && !data?.length && <EmptyState title="No questions yet" />}
          <FaqList items={data || []} />
          <p className="mt-8 text-center text-navy-700">Still have a question? <Cta to="/contact" variant="ghost" className="ml-2">Contact us</Cta></p>
        </div></div>
      </div>
    </>
  );
}
