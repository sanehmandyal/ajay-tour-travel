import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DataProvider } from '../lib/data.jsx';
import { Navbar } from '../components/Layout.jsx';

const seed = { settings: { business: { name: 'Himyatra Tour and Travels', serviceAreas: [], contactVerified: false }, social: {}, announcement: {}, home: {}, footer: {}, reviews: [], analytics: {} } };
const wrap = () => render(<HelmetProvider><DataProvider initial={seed}><MemoryRouter><Navbar /></MemoryRouter></DataProvider></HelmetProvider>);

describe('responsive navigation', () => {
  it('opens and closes the mobile menu with correct ARIA state and Escape', async () => {
    wrap();
    const btn = screen.getByRole('button', { name: /open menu/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: /site menu/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site menu/i })).not.toBeInTheDocument();
    });
  });
  it('has a Book Your Ride call to action', () => {
    wrap();
    expect(screen.getAllByRole('link', { name: /book your ride/i }).length).toBeGreaterThan(0);
  });
});
