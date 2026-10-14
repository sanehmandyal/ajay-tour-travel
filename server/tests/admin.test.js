import request from 'supertest';
import mongoose from 'mongoose';
import { connectTestDb, disconnectTestDb } from './testDb.js';
import { createApp } from '../src/app.js';
import { AdminUser, Destination, Inquiry, Redirect, WebsiteSettings } from '../src/models/index.js';

let mongod; let app;
const EMAIL = 'owner@example.com'; const PASSWORD = 'a-long-test-password-1';
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

async function login(agent = request.agent(app)) {
  const res = await agent.post('/api/admin/auth/login').send({ email: EMAIL, password: PASSWORD });
  return { agent, res, csrf: res.body.data?.csrfToken };
}

beforeAll(async () => {
  mongod = await connectTestDb();
  await Promise.all([AdminUser.init(), Destination.init(), Inquiry.init(), Redirect.init()]);
  app = createApp();
});
afterAll(async () => { await disconnectTestDb(mongod); });
beforeEach(async () => {
  await Promise.all([AdminUser, Destination, Inquiry, Redirect, WebsiteSettings].map((M) => M.deleteMany({})));
  await AdminUser.create({ name: 'Owner', email: EMAIL, passwordHash: await AdminUser.hashPassword(PASSWORD) });
});

describe('authentication and authorization', () => {
  it.each([['get', '/api/admin/dashboard'], ['get', '/api/admin/inquiries'], ['post', '/api/admin/destinations'], ['get', '/api/admin/settings'], ['get', '/api/admin/inquiries/export.csv']])(
    '%s %s requires login', async (m, url) => { expect((await request(app)[m](url)).status).toBe(401); });

  it('rejects a bad password with a generic message', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({ email: EMAIL, password: 'wrong-password-123' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Incorrect email or password');
  });
  it('sets an HttpOnly cookie and never returns the hash', async () => {
    const { res } = await login();
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });
  it('locks the account after repeated failures', async () => {
    for (let i = 0; i < 5; i += 1) await request(app).post('/api/admin/auth/login').send({ email: EMAIL, password: 'nope-nope-nope-1' });
    const res = await request(app).post('/api/admin/auth/login').send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(429);
  });
  it('has no public registration route', async () => {
    expect((await request(app).post('/api/admin/auth/register').send({ email: 'x@y.com', password: 'abcdefghijkl1' })).status).toBe(401);
  });
  it('blocks unsafe requests without a CSRF token', async () => {
    const { agent } = await login();
    expect((await agent.post('/api/admin/destinations').send({ name: 'X Place' })).status).toBe(403);
  });
  it('invalidates the session server-side on logout', async () => {
    const { agent, csrf, res } = await login();
    const cookie = res.headers['set-cookie'][0].split(';')[0];
    expect((await agent.post('/api/admin/auth/logout').set('X-CSRF-Token', csrf)).status).toBe(200);
    expect((await request(app).get('/api/admin/auth/me').set('Cookie', cookie)).status).toBe(401);
  });
});

describe('destination management', () => {
  it('creates, publishes, hides and deletes a destination, with slug uniqueness', async () => {
    const { agent, csrf } = await login();
    const post = (b) => agent.post('/api/admin/destinations').set('X-CSRF-Token', csrf).send(b);
    const a = await post({ name: 'Test Town', status: 'draft' });
    expect(a.status).toBe(201);
    expect(a.body.data.slug).toBe('test-town');
    expect((await post({ name: 'Another', slug: 'test-town' })).status).toBe(409);
    expect((await post({ name: 'Bad', slug: 'Bad Slug!' })).status).toBe(422);

    expect((await request(app).get('/api/destinations/test-town')).status).toBe(404);
    await agent.put(`/api/admin/destinations/${a.body.data._id}`).set('X-CSRF-Token', csrf).send({ status: 'published' });
    expect((await request(app).get('/api/destinations/test-town')).status).toBe(200);
    await agent.put(`/api/admin/destinations/${a.body.data._id}`).set('X-CSRF-Token', csrf).send({ status: 'draft' });
    expect((await request(app).get('/api/destinations/test-town')).status).toBe(404);
    expect((await agent.delete(`/api/admin/destinations/${a.body.data._id}`).set('X-CSRF-Token', csrf)).status).toBe(200);
  });
  it('rejects script URLs in image fields', async () => {
    const { agent, csrf } = await login();
    const res = await agent.post('/api/admin/destinations').set('X-CSRF-Token', csrf).send({ name: 'Img', heroImage: { url: 'javascript:alert(1)' } });
    expect(res.status).toBe(422);
  });
});

describe('inquiry management', () => {
  const body = { name: 'Asha', phone: '9876543210', pickup: 'Una', destination: 'Ludhiana', travelDate: tomorrow, passengers: 2, consent: true };
  it('updates status, adds notes, exports safe CSV, anonymizes', async () => {
    const sub = await request(app).post('/api/inquiries').send({ ...body, name: '=HYPERLINK("x")' });
    const { agent, csrf } = await login();
    const id = (await Inquiry.findOne({ reference: sub.body.data.reference }))._id;
    const h = (r) => r.set('X-CSRF-Token', csrf);

    expect((await h(agent.patch(`/api/admin/inquiries/${id}/status`)).send({ status: 'Quoted' })).body.data.status).toBe('Quoted');
    expect((await h(agent.patch(`/api/admin/inquiries/${id}/status`)).send({ status: 'Bogus' })).status).toBe(422);
    expect((await h(agent.post(`/api/admin/inquiries/${id}/notes`)).send({ text: 'Called customer' })).body.data.notes).toHaveLength(1);

    const csv = await agent.get('/api/admin/inquiries/export.csv');
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.text).toContain(`"'=HYPERLINK`);

    const anon = await h(agent.post(`/api/admin/inquiries/${id}/anonymize`)).send();
    expect(anon.body.data.name).toBe('Anonymized');
    expect(anon.body.data.phone).toBe('anonymized');
  });
  it('filters and paginates', async () => {
    await request(app).post('/api/inquiries').send(body);
    const { agent } = await login();
    const res = await agent.get('/api/admin/inquiries?status=New&q=asha&page=1&limit=5');
    expect(res.body.meta.total).toBe(1);
    expect((await agent.get('/api/admin/dashboard')).body.data.totals.new).toBe(1);
  });
});

describe('settings and redirects', () => {
  it('hides contact details publicly until verified', async () => {
    const { agent, csrf } = await login();
    await agent.put('/api/admin/settings').set('X-CSRF-Token', csrf).send({ business: { phone: '+91 98765 43210', whatsapp: '+91 98765 43210' } });
    expect((await request(app).get('/api/settings/public')).body.data.business.phone).toBe('');
    await agent.put('/api/admin/settings').set('X-CSRF-Token', csrf).send({ business: { contactVerified: true } });
    const pub = (await request(app).get('/api/settings/public')).body.data.business;
    expect(pub.phone).toBe('+91 98765 43210');
    expect(pub.whatsapp).toBe('919876543210');
  });
  it('rejects redirect chains and loops', async () => {
    const { agent, csrf } = await login();
    const post = (b) => agent.post('/api/admin/redirects').set('X-CSRF-Token', csrf).send(b);
    expect((await post({ from: '/old', to: '/new' })).status).toBe(201);
    expect((await post({ from: '/older', to: '/old' })).status).toBe(409);
    expect((await post({ from: '/same', to: '/same' })).status).toBe(422);
    expect((await post({ from: '/admin/x', to: '/y' })).status).toBe(422);
  });
  it('sitemap lists only published, indexable pages', async () => {
    await Destination.create({ name: 'Pub', slug: 'pub', status: 'published' });
    await Destination.create({ name: 'Hidden', slug: 'hidden', status: 'published', seo: { noindex: true } });
    await Destination.create({ name: 'Draft', slug: 'draft', status: 'draft' });
    const xml = (await request(app).get('/api/sitemap.xml')).text;
    expect(xml).toContain('/destinations/pub');
    expect(xml).not.toContain('/destinations/hidden');
    expect(xml).not.toContain('/destinations/draft');
    expect(xml).not.toContain('/admin');
  });
});
