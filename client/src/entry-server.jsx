import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { DataProvider } from './lib/data.jsx';

/** Called by scripts/prerender.mjs. `data` is a map of API responses keyed like useApi() keys. */
export function render(url, data) {
  const used = new Set();
  const helmetContext = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <DataProvider initial={data} used={used}>
        <StaticRouter location={url}><App /></StaticRouter>
      </DataProvider>
    </HelmetProvider>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title, h.meta, h.link, h.script, h.htmlAttributes && ''].map((x) => (x ? x.toString() : '')).join('\n') : '';
  const htmlAttrs = h?.htmlAttributes?.toString() || '';
  return { html, head, htmlAttrs, used: [...used] };
}
