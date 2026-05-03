import request from 'supertest';
import app from '../src/app';
import { getDb, closeDb } from '../src/utils/db.util';

beforeEach(() => {
  const db = getDb();
  db.exec(`DELETE FROM loans; DELETE FROM books; DELETE FROM members;
           DELETE FROM sqlite_sequence WHERE name IN ('books','members','loans');`);
});

afterAll(() => closeDb());

async function createBook() {
  const res = await request(app).post('/api/books').send({
    isbn: '9780132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    quantity: 2,
  });
  return res.body.data;
}

async function createMember() {
  const res = await request(app).post('/api/members').send({
    name: 'Bat-Erdene',
    email: 'bat@example.com',
  });
  return res.body.data;
}

function futureDate(days = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

describe('POST /api/loans', () => {
  it('creates a loan successfully', async () => {
    const book = await createBook();
    const member = await createMember();
    const res = await request(app).post('/api/loans').send({
      book_id: book.id,
      member_id: member.id,
      due_date: futureDate(),
    });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('active');
  });

  it('decrements available_qty after loan', async () => {
    const book = await createBook();
    const member = await createMember();
    await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    const updated = await request(app).get(`/api/books/${book.id}`);
    expect(updated.body.data.available_qty).toBe(book.available_qty - 1);
  });

  it('rejects loan for unavailable book', async () => {
    const book = await createBook();
    const member = await createMember();
    // Exhaust all copies
    await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    const res = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('UNAVAILABLE');
  });

  it('rejects loan for nonexistent book', async () => {
    const member = await createMember();
    const res = await request(app).post('/api/loans').send({ book_id: 9999, member_id: member.id, due_date: futureDate() });
    expect(res.status).toBe(404);
  });

  it('rejects loan for inactive member', async () => {
    const book = await createBook();
    const member = await createMember();
    await request(app).patch(`/api/members/${member.id}/deactivate`);
    const res = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('INACTIVE_MEMBER');
  });

  it('rejects past due_date', async () => {
    const book = await createBook();
    const member = await createMember();
    const res = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: '2020-01-01' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/loans/:id/return', () => {
  it('returns a book successfully', async () => {
    const book = await createBook();
    const member = await createMember();
    const loan = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    const id = loan.body.data.id;
    const res = await request(app).patch(`/api/loans/${id}/return`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('returned');
  });

  it('increments available_qty after return', async () => {
    const book = await createBook();
    const member = await createMember();
    const loan = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    await request(app).patch(`/api/loans/${loan.body.data.id}/return`);
    const updated = await request(app).get(`/api/books/${book.id}`);
    expect(updated.body.data.available_qty).toBe(book.available_qty);
  });

  it('rejects returning already returned loan', async () => {
    const book = await createBook();
    const member = await createMember();
    const loan = await request(app).post('/api/loans').send({ book_id: book.id, member_id: member.id, due_date: futureDate() });
    const id = loan.body.data.id;
    await request(app).patch(`/api/loans/${id}/return`);
    const res = await request(app).patch(`/api/loans/${id}/return`);
    expect(res.status).toBe(409);
  });
});

describe('GET /api/stats', () => {
  it('returns dashboard statistics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('books');
    expect(res.body.data).toHaveProperty('loans');
    expect(res.body.data).toHaveProperty('members');
  });
});
