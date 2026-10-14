import { Navigate, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './auth.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Inquiries from './Inquiries.jsx';
import ResourcePage from './ResourcePage.jsx';
import Settings from './Settings.jsx';
import SeoPage from './SeoPage.jsx';
import MediaPage from './MediaPage.jsx';
import Account from './Account.jsx';

function Gate() {
  const { status } = useAuth();
  if (status === 'loading') return <div className="grid min-h-dvh place-items-center" role="status">Loading…</div>;
  if (status === 'out') return <Login />;
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inquiries" element={<Inquiries />} />
        {['destinations', 'routes', 'vehicles', 'packages', 'blog', 'faqs', 'redirects'].map((n) => <Route key={n} path={n} element={<ResourcePage key={n} name={n} />} />)}
        <Route path="settings" element={<Settings />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Helmet><title>Admin | Ajay Tour and Travels</title><meta name="robots" content="noindex, nofollow, noarchive" /></Helmet>
      <Gate />
    </AuthProvider>
  );
}
