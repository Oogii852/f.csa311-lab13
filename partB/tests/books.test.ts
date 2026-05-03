import request from 'supertest';
import app from '../src/app';
import { getDb, closeDb } from '../src/utils/db.util';

beforeEach(() => {
  const db = getDb();
  db.exec(`DELETE FROM loans; DELETE FROM books; DELETE FROM members;
           DELETE FROM sqlite_sequence WHERE name IN ('books','members','loans');`);
});

afterAll(() => closeDb());

const validBook = {
  isbn: '9780132350884',
  title: 'Clean Code',
  author: 'Robert C. Martin',
  category: 'Programming',
  quantity: 3,
};

describe('POST /api/books', () => {
  it('creates a book successfully', async () => {
    const res = await request(app).post('/api/books').send(validBook);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isbn).toBe(validBook.isbn);
    expect(res.body.data.available_qty).toBe(3);
  });

  it('rejects duplicate ISBN', async () => {
    await request(app).post('/api/books').send(validBook);
    const res = await request(app).post('/api/books').send(validBook);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid ISBN', async () => {
    const res = await request(app).post('/api/books').send({ ...validBook, isbn: '1234567890123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/books').send({ title: 'No ISBN' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/books', () => {
  beforeEach(async () => {
    await request(app).post('/api/books').send(validBook);
    await request(app).post('/api/books').send({
      isbn: '9780201633610',
      title: 'Design Patterns',
      author: 'Gang of Four',
      category: 'Programming',
      quantity: 2,
    });
  });

  it('returns all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('searches by title', async () => {
    const res = await request(app).get('/api/books?q=clean');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Clean Code');
  });

  it('filters by availability', async () => {
    const res = await request(app).get('/api/books?available=true');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/books/:id', () => {
  it('returns a book by id', async () => {
    const created = await request(app).post('/api/books').send(validBook);
    const id = created.body.data.id;
    const res = await request(app).get(`/api/books/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/books/9999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/books/:id', () => {
  it('updates book fields', async () => {
    const created = await request(app).post('/api/books').send(validBook);
    const id = created.body.data.id;
    const res = await request(app).patch(`/api/books/${id}`).send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });
});

describe('DELETE /api/books/:id', () => {
  it('deletes a book', async () => {
    const created = await request(app).post('/api/books').send(validBook);
    const id = created.body.data.id;
    const res = await request(app).delete(`/api/books/${id}`);
    expect(res.status).toBe(200);
    const check = await request(app).get(`/api/books/${id}`);
    expect(check.status).toBe(404);
  });
});
