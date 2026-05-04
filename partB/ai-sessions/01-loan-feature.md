# AI Session 01 — Loan Feature Implementation

**Огноо:** 2025-01-xx  
**Зорилго:** Зээлийн transaction logic хэрэгжүүлэх  
**Үр дүн:** `loan.model.ts` бүрэн хэрэгжсэн

---

## Session товч

**Хэрэглэгч:** Ном зээлэхэд available_qty-г багасгах, буцаахад нэмэх хэрэгтэй.
Transaction ашиглах уу?

**Claude:** Тийм, заавал transaction ашиглах хэрэгтэй. Ном зээлэх үед:
1. `INSERT INTO loans` 
2. `UPDATE books SET available_qty = available_qty - 1`

Хоёр операц атомик байх ёстой — нэг нь амжилтгүй болбол хоёулаа rollback хийнэ.

```typescript
const loan = db.transaction(() => {
  const result = db.prepare(`INSERT INTO loans ...`).run(data);
  db.prepare(`UPDATE books SET available_qty = available_qty - 1 WHERE id = ?`).run(data.book_id);
  return result.lastInsertRowid as number;
})();
```

**Хэрэглэгч:** available_qty 0-с доош очих боломж байна уу?

**Claude:** Байна — CHECK constraint нэмэх хэрэгтэй:
```sql
available_qty INTEGER NOT NULL DEFAULT 1 CHECK(available_qty >= 0)
```

**⚠️ Шалгалт:** Claude CHECK constraint нэмэхийг санал болгосон боловч
migration script-д аль хэдийн хийгдсэн table-д ALTER TABLE-ээр CHECK нэмэх
SQLite-д дэмжигдэхгүй. Application layer-д шалгаж шийдсэн:
```typescript
if (!BookModel.checkAvailability(data.book_id)) {
  throw new AppError(409, 'Book is not available', 'UNAVAILABLE');
}
```

---

## Гол шийдвэр

- Transaction ашиглах → атомик операц
- Application layer validation → SQLite CHECK constraint-ийн хязгаарлалт
- `updateOverdue()` GET /api/loans дээр автоматаар дуудагдана
