import request from 'supertest';
import app from '../src/app';
import { getDb, closeDb } from '../src/utils/db.util';

beforeEach(() => {
  const db = getDb();
  db.exec(`DELETE FROM loans; DELETE FROM members; DELETE FROM books;
           DELETE FROM sqlite_sequence WHERE name IN ('books','members','loans');`);
});

afterAll(() => closeDb());

const validMember = {
  name: 'Bat-Erdene',
  email: 'bat@example.com',
  phone: '99001234',
};

describe('POST /api/members', () => {
  it('creates a member successfully', async () => {
    const res = await request(app).post('/api/members').send(validMember);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validMember.email);
    expect(res.body.data.is_active).toBe(1);
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/members').send(validMember);
    const res = await request(app).post('/api/members').send(validMember);
    expect(res.status).toBe(409);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app).post('/api/members').send({ ...validMember, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('creates member without phone', async () => {
    const res = await request(app).post('/api/members').send({ name: 'Enkh', email: 'enkh@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.phone).toBeNull();
  });
});

describe('GET /api/members', () => {
  it('returns all members', async () => {
    await request(app).post('/api/members').send(validMember);
    const res = await request(app).get('/api/members');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('filters active members only', async () => {
    const created = await request(app).post('/api/members').send(validMember);
    const id = created.body.data.id;
    await request(app).patch(`/api/members/${id}/deactivate`);
    const res = await request(app).get('/api/members?active=true');
    expect(res.body.data.length).toBe(0);
  });
});

describe('PATCH /api/members/:id/deactivate & activate', () => {
  it('deactivates a member', async () => {
    const created = await request(app).post('/api/members').send(validMember);
    const id = created.body.data.id;
    const res = await request(app).patch(`/api/members/${id}/deactivate`);
    expect(res.status).toBe(200);
    expect(res.body.data.is_active).toBe(0);
  });

  it('reactivates a member', async () => {
    const created = await request(app).post('/api/members').send(validMember);
    const id = created.body.data.id;
    await request(app).patch(`/api/members/${id}/deactivate`);
    const res = await request(app).patch(`/api/members/${id}/activate`);
    expect(res.status).toBe(200);
    expect(res.body.data.is_active).toBe(1);
  });

  it('returns 404 for unknown member', async () => {
    const res = await request(app).patch('/api/members/9999/deactivate');
    expect(res.status).toBe(404);
  });
});
