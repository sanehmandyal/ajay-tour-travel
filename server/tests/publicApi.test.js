import request from 'supertest';
import mongoose from 'mongoose';
import { connectTestDb, disconnectTestDb } from './testDb.js';
import { createApp } from '../src/app.js';
import { Destination, Inquiry } from '../src/models/index.js';

let mongod; let app;
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const valid = {
  name: 'Test Customer', phone: '98765 43210', pickup: 'Una', destination: 'Chandigarh',
  travelDate: tomorrow, passengers: 3, tripType: 'one-way', consent: true,
};

beforeAll(async () => {
  mongod = await connectTestDb();
  await Promise.all([Destination.init(), Inquiry.init()]);
  app = createApp();
});
afterAll(async () => { await disconnectTestDb(mongod); });
beforeEach(async () => { await Inquiry.deleteMany({}); await Destination.deleteMany({}); });

describe('inquiries', () => {
  it('stores a valid inquiry and returns a reference', async () => {
    const res = await request(app).post('/api/inquiries').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.data.reference).toMatch(/^AJT-\d{8}-[A-Z0-9]{5}$/);
    const saved = await Inquiry.findOne({ reference: res.body.data.reference });
    expect(saved.phone).toBe('+919876543210');
    expect(saved.status).toBe('New');
  });
  it('rejects invalid phone, missing consent and past dates', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...valid, phone: '12345', consent: false, travelDate: '2001-01-01' });
    expect(res.status).toBe(422);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['phone', 'consent', 'travelDate']));
  });
  it('requires a return date for round trips', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...valid, tripType: 'round-trip' });
    expect(res.status).toBe(422);
  });
  it('returns the same reference for a duplicate submission', async () => {
    const a = await request(app).post('/api/inquiries').send(valid);
    const b = await request(app).post('/api/inquiries').send(valid);
    expect(b.status).toBe(200);
    expect(b.body.data.reference).toBe(a.body.data.reference);
    expect(await Inquiry.countDocuments()).toBe(1);
  });
  it('silently drops honeypot submissions', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...valid, website: 'http://spam' });
    expect(res.status).toBe(201);
    expect(await Inquiry.countDocuments()).toBe(0);
  });
  it('strips HTML from text fields', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...valid, name: '<script>x</script>Ravi' });
    expect(res.status).toBe(201);
    expect((await Inquiry.findOne({ reference: res.body.data.reference })).name).toBe('Ravi');
  });
  it('is not fooled by NoSQL operator payloads', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...valid, name: { $gt: '' } });
    expect(res.status).toBe(422);
  });
});

describe('destinations', () => {
  it('serves only published destinations', async () => {
    await Destination.create({ name: 'Una', slug: 'una', status: 'published' });
    await Destination.create({ name: 'Draft', slug: 'draft-place', status: 'draft' });
    const list = await request(app).get('/api/destinations');
    expect(list.body.data.map((d) => d.slug)).toEqual(['una']);
    expect((await request(app).get('/api/destinations/una')).status).toBe(200);
    expect((await request(app).get('/api/destinations/draft-place')).status).toBe(404);
    expect((await request(app).get('/api/destinations/..%2Fetc')).status).toBe(404);
  });
});

describe('cors', () => {
  it('allows listed origins with credentials and denies others', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(ok.headers['access-control-allow-credentials']).toBe('true');
    const bad = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });
});
