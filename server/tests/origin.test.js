import { isOriginAllowed } from '../src/utils/origin.js';

describe('isOriginAllowed security utility', () => {
  test('allows undefined or empty origin (server-to-server or same-origin)', () => {
    expect(isOriginAllowed(undefined)).toBe(true);
    expect(isOriginAllowed(null)).toBe(true);
    expect(isOriginAllowed('')).toBe(true);
  });

  test('allows official production Vercel frontend with ports or trailing slash', () => {
    expect(isOriginAllowed('https://ajay-tour-travel.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://ajay-tour-travel.vercel.app/')).toBe(true);
    expect(isOriginAllowed('https://ajay-tour-travel.vercel.app:443')).toBe(true);
    expect(isOriginAllowed('https://ajay-tour-travels.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://himyatra-tour-travels.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://himyatratourtravels.com')).toBe(true);
    expect(isOriginAllowed('null')).toBe(true);
  });

  test('allows Vercel preview and branch deployments for the project', () => {
    expect(isOriginAllowed('https://ajay-tour-travel-git-main-sanehmandyals-projects.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://ajay-tour-travel-xyz.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://preview-123.vercel.app')).toBe(true);
  });

  test('allows Render API origin', () => {
    expect(isOriginAllowed('https://ajay-tour-travel-api.onrender.com')).toBe(true);
    expect(isOriginAllowed('https://ajay-tour-travel-api.onrender.com:443/')).toBe(true);
  });

  test('allows local development origins', () => {
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
  });

  test('rejects arbitrary unauthorized third-party origins', () => {
    expect(isOriginAllowed('https://random-site.com')).toBe(false);
    expect(isOriginAllowed('https://evil-attacker.com')).toBe(false);
  });
});
