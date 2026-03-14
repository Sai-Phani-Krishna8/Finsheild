'use strict';

const request = require('supertest');
const app     = require('../src/app');

/* ── GET /api/health ─────────────────────────────────────────────────────── */
describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toMatch(/FinShield/i);
  });
});

/* ── GET /api/pan/taxpayer-types ─────────────────────────────────────────── */
describe('GET /api/pan/taxpayer-types', () => {
  test('returns the full list of taxpayer types', async () => {
    const res = await request(app).get('/api/pan/taxpayer-types');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(10);
    expect(res.body.data[0]).toHaveProperty('code');
    expect(res.body.data[0]).toHaveProperty('description');
  });
});

/* ── GET /api/pan/validate/:pan ──────────────────────────────────────────── */
describe('GET /api/pan/validate/:pan', () => {
  test('returns valid=true for correct PAN format', async () => {
    const res = await request(app).get('/api/pan/validate/ABCPE1234F');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(true);
  });

  test('returns valid=false for incorrect PAN format', async () => {
    const res = await request(app).get('/api/pan/validate/INVALID');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(false);
  });
});

/* ── POST /api/pan/verify ────────────────────────────────────────────────── */
describe('POST /api/pan/verify', () => {
  test('returns 400 when pan is missing', async () => {
    const res = await request(app).post('/api/pan/verify').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when pan is empty string', async () => {
    const res = await request(app).post('/api/pan/verify').send({ pan: '   ' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('processes a valid PAN and returns fraud analysis', async () => {
    const res = await request(app).post('/api/pan/verify').send({ pan: 'ABCPE7391K' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data).toHaveProperty('pan', 'ABCPE7391K');
    expect(data).toHaveProperty('valid', true);
    expect(data).toHaveProperty('riskLevel');
    expect(data).toHaveProperty('riskScore');
    expect(data).toHaveProperty('fraudDetected');
    expect(data).toHaveProperty('recommendation');
  });

  test('accepts optional holderName for cross-validation', async () => {
    const res = await request(app)
      .post('/api/pan/verify')
      .send({ pan: 'ABCPP5678K', holderName: 'Rajesh Kumar' });
    expect(res.statusCode).toBe(200);
    // 5th char P ≠ K (Kumar), so we expect a fraud indicator
    expect(res.body.data.fraudIndicators.some(i => /surname/i.test(i))).toBe(true);
  });

  test('flags a known fraudulent PAN', async () => {
    const res = await request(app).post('/api/pan/verify').send({ pan: 'AAAAA0000A' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.riskLevel).toBe('CONFIRMED_FRAUD');
    expect(res.body.data.riskScore).toBe(100);
  });
});

/* ── POST /api/pan/bulk-verify ───────────────────────────────────────────── */
describe('POST /api/pan/bulk-verify', () => {
  test('returns 400 when pans array is missing', async () => {
    const res = await request(app).post('/api/pan/bulk-verify').send({});
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when pans is not an array', async () => {
    const res = await request(app).post('/api/pan/bulk-verify').send({ pans: 'ABCPE1234F' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when pans array is empty', async () => {
    const res = await request(app).post('/api/pan/bulk-verify').send({ pans: [] });
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 when pans array has more than 100 entries', async () => {
    const pans = Array(101).fill('ABCPE1234F');
    const res  = await request(app).post('/api/pan/bulk-verify').send({ pans });
    expect(res.statusCode).toBe(400);
  });

  test('processes an array of PANs', async () => {
    const res = await request(app)
      .post('/api/pan/bulk-verify')
      .send({ pans: ['ABCPE1234F', 'AAAAA0000A'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  test('accepts objects with pan and holderName', async () => {
    const pans = [
      { pan: 'ABCPE7391K', holderName: 'Priya Kumar' },
      'DEFGH5678K',
    ];
    const res = await request(app).post('/api/pan/bulk-verify').send({ pans });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});
