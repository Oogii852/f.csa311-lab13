# Бие даалт 13 — Mini Library System

AI-Assisted Software Construction (F.CSM311 — Лекц 13)

## Төслийн тухай

Node.js/TypeScript дээр суурилсан жижиг номын сангийн удирдлагын систем.
Ном, гишүүн, зээлийн бүртгэлийг хянах REST API болон минимал frontend.

## Хэсгүүд

| Хэсэг | Агуулга |
|-------|---------|
| [partA/](./partA/) | Plan — архитектур, stack шийдвэр, CLAUDE.md |
| [partB/](./partB/) | Build — эх код, тест, slash commands |
| [partC/](./partC/) | Reflect — AI Usage Report, ADR-002, Self-evaluation |

## Хурдан эхлэх

```bash
cd partB
npm install
npm run dev
```

## Технологи

- **Backend:** Node.js + TypeScript + Express
- **Database:** SQLite (better-sqlite3)
- **Testing:** Jest + Supertest
- **Docs:** Swagger/OpenAPI 3.0

## AI хэрэглэлт

Энэ төсөл Claude (Anthropic) AI-тай хамтран хийгдсэн.
Тодорхой мэдээллийг [partC/AI-USAGE-REPORT.md](./partC/AI-USAGE-REPORT.md)-с үзнэ үү.
