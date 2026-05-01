# Mini Library System

> 📚 Номын сангийн удирдлагын REST API — Node.js + TypeScript + Express + SQLite

## Шаардлага

- Node.js ≥ 20.x
- npm ≥ 10.x
- Git

## Суулгалт & Эхлүүлэх

```bash
# Repository clone
git clone https://github.com/<username>/bie-daalt-13.git
cd bie-daalt-13/partB

# Хамаарлууд суулгах
npm install

# Development горим (hot reload)
npm run dev
# → http://localhost:3000

# API docs (Swagger UI)
# → http://localhost:3000/api-docs
```

## Build & Production

```bash
# TypeScript compile
npm run build

# Production эхлүүлэх
npm start
```

## Тест ажиллуулах

```bash
# Бүх тест
npm test

# Watch горим
npm run test:watch

# Coverage report
npm run test:coverage
```

## API Endpoints (товч)

| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/books` | Номын жагсаалт (хайлт, filter) |
| POST | `/api/books` | Шинэ ном нэмэх |
| GET | `/api/books/:id` | Номын дэлгэрэнгүй |
| PATCH | `/api/books/:id` | Ном засах |
| DELETE | `/api/books/:id` | Ном устгах |
| GET | `/api/members` | Гишүүний жагсаалт |
| POST | `/api/members` | Гишүүн бүртгэх |
| PATCH | `/api/members/:id` | Гишүүн засах |
| GET | `/api/loans` | Зээлийн жагсаалт |
| POST | `/api/loans` | Ном зээлэх |
| PATCH | `/api/loans/:id/return` | Ном буцаах |
| GET | `/api/stats` | Статистик |

## Folder бүтэц

```
partB/
├── src/
│   ├── app.ts              # Express app
│   ├── server.ts           # HTTP server
│   ├── routes/
│   │   ├── book.routes.ts
│   │   ├── member.routes.ts
│   │   ├── loan.routes.ts
│   │   └── stats.routes.ts
│   ├── models/
│   │   ├── book.model.ts
│   │   ├── member.model.ts
│   │   └── loan.model.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── rateLimit.middleware.ts
│   └── utils/
│       ├── db.util.ts
│       └── validate.util.ts
├── tests/
│   ├── books.test.ts
│   ├── members.test.ts
│   └── loans.test.ts
├── package.json
├── tsconfig.json
└── openapi.yaml
```

## Environment Variables

`.env` файл үүсгэх (`.env.example`-с хуулах):

```env
PORT=3000
NODE_ENV=development
DB_PATH=./library.db
```

## Лиценз

MIT
