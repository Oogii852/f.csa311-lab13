# ADR-001: Stack Сонголт — Node.js + TypeScript + Express + SQLite

## Статус

Баталгаажсан (Accepted) — 2025-01-xx

## Нөхцөл байдал (Context)

Mini Library System-д зориулж stack сонгох шаардлагатай болсон.
Шаардлагууд:
- 7 хоногт 3+ feature + ≥10 test дуусгах
- REST API + OpenAPI docs
- Хялбар deploy (zero infrastructure)
- AI-assisted workflow-д тохиромжтой

Сонголтын хувилбарууд: Node.js+TypeScript+Express, Python+FastAPI, Go+Gin

## Шийдвэр (Decision)

**Node.js 20 + TypeScript 5 + Express 4 + SQLite (better-sqlite3)** сонгосон.

Нэмэлт хамаарлууд:
- `zod` — runtime validation
- `swagger-jsdoc` + `swagger-ui-express` — OpenAPI docs
- `jest` + `supertest` — тест
- `helmet` + `express-rate-limit` — security

## Үндэслэл (Rationale)

### Яагаад Node.js + TypeScript?
1. **Туршлага:** Хамгийн их мэдлэгтэй stack — хугацаа хэмнэнэ
2. **AI дэмжлэг:** Claude нь TS кодыг хамгийн өндөр чанартай, алдаа багатай үүсгэдэг
3. **Тип аюулгүй байдал:** `strict` TypeScript нь runtime алдааг эрт илрүүлдэг
4. **Ecosystem:** npm дээр шаардлагатай бүх library нэн даруй байгаа

### Яагаад Express (Fastify биш)?
- Express нь AI-ийн training data-д хамгийн их байгаа → илүү найдвартай код үүсгэгдэнэ
- Middleware ecosystem тогтвортой, баримтжуулалт сайн

### Яагаад SQLite?
- Zero configuration — `CREATE TABLE` хийгээд л ажиллана
- better-sqlite3: synchronous API → async/await complexity байхгүй
- File-based → backup, хуулалт хялбар
- Номын сангийн хэмжээнд (≤10,000 ном, ≤1,000 гишүүн) хангалттай

### Яагаад FastAPI биш?
- Python async SQLite (aiosqlite) тохиргоо нарийн, нэмэлт хугацаа авна
- Хувийн туршлага харьцангуй бага → алдааг засахад удаан

### Яагаад Go биш?
- Суралцах муруй эгц — 7 хоногт хангалттай feature хийж чадахгүй эрсдэлтэй
- AI-ийн Go код чанар TS-с доогуур (hallucination илүү их)
- CGO dependency SQLite-д — cross-compile асуудал

## Үр дагавар (Consequences)

### Эерэг
- Хурдан хөгжүүлэлт — туршлагатай stack
- AI workflow үр дүнтэй — TS-д AI кодын чанар өндөр
- Тест бичих хялбар — Jest + Supertest

### Сөрөг
- `node_modules` том (≈50MB) — `.gitignore`-д нэмэх шаардлагатай
- Python FastAPI-с OpenAPI integration бага автомат
- SQLite concurrent write хязгаарлагдмал — ирээдүйд PostgreSQL руу шилжих боломжтой

## AI харилцан үйлдэл

Claude-тай stack харьцуулалт хийхэд дараах зүйлийг анхаарсан:
- AI "Go нь хамгийн сайн" гэж санал болгосон боловч туршлагын хүчин зүйлийг тайлбарлахад Node.js-ийг зөвшөөрсөн
- FastAPI-ийн built-in OpenAPI-г AI онцолсон — энэ зөв боловч async SQLite complexity нь counter-argument болсон
