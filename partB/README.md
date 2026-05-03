# Mini Library — Build & Run Guide

## Шаардлага

- Node.js ≥ 20
- npm ≥ 10

## Суулгалт

```bash
cd partB
npm install
```

## Эхлүүлэх

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

API: http://localhost:3000  
Swagger UI: http://localhost:3000/api-docs

## Тест

```bash
npm test
npm run test:coverage
```

## API жишээ

```bash
# Ном нэмэх
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"9780132350884","title":"Clean Code","author":"Robert C. Martin","quantity":3}'

# Номын жагсаалт
curl http://localhost:3000/api/books

# Хайлт
curl "http://localhost:3000/api/books?q=clean&available=true"

# Гишүүн бүртгэх
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Bat-Erdene","email":"bat@example.com","phone":"99001234"}'

# Ном зээлэх
curl -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{"book_id":1,"member_id":1,"due_date":"2025-02-28"}'

# Ном буцаах
curl -X PATCH http://localhost:3000/api/loans/1/return

# Статистик
curl http://localhost:3000/api/stats
```

## Folder бүтэц

```
src/
├── app.ts                    # Express + middleware + swagger
├── server.ts                 # HTTP server, graceful shutdown
├── routes/
│   ├── book.routes.ts        # GET/POST/PATCH/DELETE /api/books
│   ├── member.routes.ts      # CRUD + activate/deactivate
│   ├── loan.routes.ts        # Зээл, буцаалт
│   └── stats.routes.ts       # Dashboard статистик
├── models/
│   ├── book.model.ts
│   ├── member.model.ts
│   └── loan.model.ts
├── middleware/
│   └── error.middleware.ts
└── utils/
    ├── db.util.ts            # SQLite connection + migration
    └── validate.util.ts      # Zod schemas
```
