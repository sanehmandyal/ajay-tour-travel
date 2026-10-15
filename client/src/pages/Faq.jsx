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
        title="Cab Booking & Tour FAQ | Ajay Tour and Travels"
        description="Answers to common questions about booking, upfront quotes, fleet options, Shaktipeeth pilgrimage circuits, and railway station transfers in Amb Andaura & Una."
        jsonLd={[breadcrumbLd(crumbs), faqPageLd(data)].filter(Boolean)}
      />
      <PageHero eyebrow="FAQ" title="Frequently asked questions" intro="Quick answers about booking and travelling with us." crumbs={crumbs} />
      <div className="container-x section"><div className="mx-auto max-w-3xl">
        {loading && <Skeleton className="h-64" />}
        {error && <ErrorState />}
        {!loading && !error && !data?.length && <EmptyState title="No questions yet" />}
        <FaqList items={data || []} />
        <p className="mt-8 text-center text-navy-700">Still have a question? <Cta to="/contact" variant="ghost" className="ml-2">Contact us</Cta></p>
      </div></div>
    </>
  );
}
