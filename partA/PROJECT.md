# PROJECT.md — Mini Library System

## Сонгосон сэдэв

**Сэдэв 4: Mini Library** — номын сангийн удирдлагын систем

## Товч тайлбар

Жижиг номын сан (сургууль, оффис, хувийн) ашиглах зориулалттай веб апп.
Номын бүртгэл, гишүүн удирдлага, зээлийн хяналтыг нэг дороос хийнэ.

## Scope (Хамрах хүрээ)

### ✅ Хамрагдах (In scope)

| Feature | Тайлбар |
|---------|---------|
| **Book CRUD** | Ном нэмэх, засах, устгах, хайх (title, author, ISBN, category) |
| **Member CRUD** | Гишүүн бүртгэх, засах, идэвхигүй болгох |
| **Loan management** | Ном зээлэх, буцааx, хугацаа хэтэрсэн шалгах |
| **Search & Filter** | Ном хайх (title/author/ISBN), filter by category/availability |
| **Dashboard stats** | Нийт ном, идэвхтэй зээл, хугацаа хэтэрсэн тоо |

### ❌ Хамрагдахгүй (Out of scope)

- Хэрэглэгчийн нэвтрэлт / JWT authentication (энгийн API key)
- Email notification (хугацаа хэтэрсэн үед)
- Олон салбартай номын сан
- Mobile app
- Fine/penalty тооцоолол

## Техникийн шаардлага

- Node.js ≥ 20, TypeScript 5.x
- SQLite — энгийн deploy, zero config
- REST API + Swagger docs
- ≥10 unit/integration test

## Хугацаа

7 хоног — өдөр бүр ≥2-3 commit, нийт ≥15 commit
