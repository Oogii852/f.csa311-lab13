# CLAUDE.md — Mini Library System

> AI assistant-д зориулсан төслийн гарын авлага. Энэ файлыг эхлээд унш.

## Төслийн тойм

Mini Library System — номын сангийн удирдлагын REST API.
- **Stack:** Node.js + TypeScript + Express + SQLite
- **Port:** 3000 (dev), 3001 (test)
- **Database:** `partB/library.db` (gitignore-д байгаа)

## Build & Run командууд

```bash
# Суулгалт
cd partB && npm install

# Development (hot reload)
npm run dev

# Production build
npm run build
npm start

# Тест ажиллуулах
npm test

# Тест + coverage
npm run test:coverage

# Lint
npm run lint

# OpenAPI spec үүсгэх
npm run docs:generate
```

## Кодын конвенц

### TypeScript
- `strict: true` заавал
- `any` хэрэглэхгүй — `unknown` эсвэл зөв тип ашигла
- Interface нэр: `IBook`, `IMember`, `ILoan` (I-prefix)
- Enum: `LoanStatus`, `BookCategory`

### Файлын нэршил
- Routes: `book.routes.ts`, `member.routes.ts`, `loan.routes.ts`
- Models: `book.model.ts`, `member.model.ts`
- Middleware: `auth.middleware.ts`, `error.middleware.ts`
- Utils: `db.util.ts`, `validate.util.ts`

### API convention
- RESTful: `GET /api/books`, `POST /api/books`, `PATCH /api/books/:id`
- Error response: `{ success: false, error: string, code?: string }`
- Success response: `{ success: true, data: T, meta?: { total, page } }`
- HTTP status: 200, 201, 400, 401, 404, 409, 500

### Commit format (Conventional Commits)
```
feat(books): add search by author endpoint
fix(loans): correct overdue calculation logic
test(members): add edge cases for duplicate email
docs(api): update openapi spec for loan endpoints
refactor(db): extract query builder utility
chore(deps): update express to 4.19.x
```

AI-тай хийсэн commit-д нэм:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## No-Go Zones (хэзээ ч хийхгүй)

- ❌ `eval()` эсвэл `new Function()` ашиглах
- ❌ SQL query-д direct string concatenation (SQL injection)
- ❌ Password-ийг plaintext хадгалах
- ❌ `console.log`-ийг production код дотор орхих (logger ашигла)
- ❌ `any` type хэрэглэх
- ❌ Synchronous file I/O (fs.readFileSync) main thread дээр
- ❌ npm audit-д critical vulnerability бүхий package суулгах
- ❌ `.env` файлыг git commit хийх
- ❌ Test-ийг skip хийх (`test.skip`, `xit`) — fix эсвэл delete

## Database схем (товч)

```sql
books       (id, isbn, title, author, category, quantity, available_qty, created_at)
members     (id, name, email, phone, joined_at, is_active)
loans       (id, book_id, member_id, loaned_at, due_date, returned_at, status)
```

## Аюулгүй байдлын шаардлага

- Input validation: `zod` schema ашиглана
- Parameterized queries only (better-sqlite3 prepare)
- Rate limiting: express-rate-limit (100 req/15min)
- Helmet.js header security
- ISBN validation: ISBN-10 / ISBN-13 checksum

## Тест шаардлага

- Unit test: model layer (mock DB)
- Integration test: route layer (supertest + in-memory SQLite)
- ≥10 test, бүгд pass байх
- Coverage ≥ 60%

## Slash command-ууд

`.claude/commands/` дотор:
- `/review` — security + robustness шалгалт
- `/test` — тест бичих
- `/docs` — JSDoc + README
- `/commit` — commit message үүсгэх
- `/security` — OWASP Top 10 шалгалт
- `/refactor` — паттернаар refactor
