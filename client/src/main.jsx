import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './styles/index.css';
import App from './App.jsx';
import { DataProvider } from './lib/data.jsx';

const root = document.getElementById('root');
const initial = window.__DATA__ || {};
const tree = (
  <StrictMode>
    <HelmetProvider>
      <DataProvider initial={initial}>
        <BrowserRouter><App /></BrowserRouter>
      </DataProvider>
    </HelmetProvider>
  </StrictMode>
);

// Pre-rendered pages are hydrated; everything else (dev, new admin-created pages, /admin) renders client-side.
if (root.hasChildNodes() && window.__DATA__ && !window.location.pathname.startsWith('/admin')) hydrateRoot(root, tree);
else createRoot(root).render(tree);
window.__appReady = true;
