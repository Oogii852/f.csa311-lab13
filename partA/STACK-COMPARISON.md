# STACK-COMPARISON.md — Технологийн Stack Харьцуулалт

## AI-тай хийсэн харьцуулалт

> AI session: "Mini library систем хийхэд ямар stack тохиромжтой вэ?
> Node.js+Express, Python+FastAPI, Go+Gin-г харьцуул."

---

## 3 Stack харьцуулалт

| Шалгуур | **Node.js + TypeScript + Express** | **Python + FastAPI** | **Go + Gin** |
|---------|-----------------------------------|----------------------|--------------|
| **Хурд (perf)** | ⭐⭐⭐ Сайн | ⭐⭐⭐ Сайн (async) | ⭐⭐⭐⭐⭐ Хамгийн хурдан |
| **Type safety** | ⭐⭐⭐⭐ TypeScript | ⭐⭐⭐⭐ Type hints + Pydantic | ⭐⭐⭐⭐⭐ Static typing |
| **Суралцах хялбар** | ⭐⭐⭐⭐ Танил синтакс | ⭐⭐⭐⭐ Энгийн | ⭐⭐ Steep curve |
| **Экосистем** | ⭐⭐⭐⭐⭐ npm (хамгийн том) | ⭐⭐⭐⭐ pip | ⭐⭐⭐ Go modules |
| **SQLite support** | ⭐⭐⭐⭐ better-sqlite3 | ⭐⭐⭐⭐⭐ SQLAlchemy | ⭐⭐⭐ mattn/go-sqlite3 |
| **OpenAPI auto-gen** | ⭐⭐⭐ swagger-jsdoc | ⭐⭐⭐⭐⭐ Built-in | ⭐⭐⭐ swaggo |
| **Test framework** | ⭐⭐⭐⭐ Jest + Supertest | ⭐⭐⭐⭐ pytest | ⭐⭐⭐⭐ testing pkg |
| **Deploy хялбар** | ⭐⭐⭐⭐ Node ≥20 | ⭐⭐⭐ pip + venv | ⭐⭐⭐⭐⭐ Single binary |
| **AI code quality** | ⭐⭐⭐⭐⭐ Хамгийн сайн | ⭐⭐⭐⭐⭐ Маш сайн | ⭐⭐⭐ Дунд |
| **Өмнөх туршлага** | ✅ Их | ⚠️ Дунд | ❌ Бага |

---

## Stack 1: Node.js + TypeScript + Express

### Давуу тал
- JavaScript-ийн мэдлэг шууд ашиглаж болно
- npm-д library маш олон — validation (zod), ORM, swagger бүгд бэлэн
- Claude AI Node.js кодыг хамгийн сайн, алдаагүй үүсгэдэг
- Supertest + Jest хослол тест бичихэд маш тохиромжтой
- Hot reload (ts-node-dev) хөгжүүлэлтийг хурдасгадаг

### Сул тал
- Runtime error нь Python-с илүү байдаг (TypeScript нь compile-time л шалгадаг)
- `node_modules` том байдаг
- Callback hell (async/await-ээр шийдэгдсэн боловч анхаарах хэрэгтэй)

---

## Stack 2: Python + FastAPI

### Давуу тал
- OpenAPI spec автоматаар үүсдэг (Swagger UI built-in)
- Pydantic validation маш хүчирхэг
- Async by default
- Хамгийн цэвэр, унших боломжтой код

### Сул тал
- Virtual environment тохиргоо нэмэлт алхам
- Type hint нь TypeScript-с хатуу биш
- `async` SQLite driver (aiosqlite) тохиргоо нарийн
- Надад Python-ийн туршлага харьцангуй бага

---

## Stack 3: Go + Gin

### Давуу тал
- Хамгийн хурдан runtime
- Single binary deploy — хамгийн энгийн
- Memory-safe, compiled
- Concurrent request маш сайн

### Сул тал
- Error handling verbose (`if err != nil` мөр бүрд)
- Generics шинэ (Go 1.18+) — ecosystem дутуу
- AI-ийн Go код чанар JavaScript/Python-с доогуур
- Суралцах муруй эгц — 7 хоногт зохицохгүй
- SQLite CGO dependency — cross-compile хэцүү

---

## Сонголт: **Node.js + TypeScript + Express**

### Шийдвэрийн үндэслэл

1. **Туршлага** — JavaScript/TypeScript-д хамгийн их туршлагатай тул хөгжүүлэлт хурдан явна
2. **AI код чанар** — Claude нь Node.js + TypeScript кодыг хамгийн нарийн, алдаагүй үүсгэдэг болохыг шалгалт харуулдаг
3. **Хугацаа** — 7 хоногт 3+ feature + ≥10 test дуусгахад Node.js хамгийн тохиромжтой
4. **Экосистем** — `zod`, `better-sqlite3`, `swagger-jsdoc`, `jest`, `supertest` — бүгд тогтвортой, сайн documented
5. **FastAPI-с татгалзсан шалтгаан** — OpenAPI auto-gen сайн ч Python async SQLite setup нэмэлт хугацаа авна
6. **Go-с татгалзсан шалтгаан** — Performance давуу талтай ч суралцах муруй болон AI код чанар энэ хугацаанд эрсдэлтэй

> ADR хэлбэрийн бүрэн тайлбарыг `adr/0001-stack-decision.md`-с үзнэ үү.
