# AI Session 03 — Test Generation & Review

**Огноо:** 2025-01-xx  
**Зорилго:** Loan endpoint-уудад integration test бичих  
**Үр дүн:** 15+ test, бүгд pass

---

## Session товч

**Хэрэглэгч:** Loan endpoint-уудад test бичихэд ямар edge case-уудыг орлуулах вэ?

**Claude:** Зээлийн системд дараах edge case-ууд чухал:
1. Available_qty 0 болсон үед зээлэх → 409
2. Идэвхгүй гишүүн зээлэх → 409
3. Өнгөрсөн due_date өгөх → 400
4. Аль хэдийн буцаасан ном дахин буцаах → 409
5. Ном буцаахад available_qty нэмэгдэж байгаа эсэх
6. Transaction: зээл үүсгэхэд available_qty багасах

**Хэрэглэгч:** `beforeEach`-д DB-г яаж цэвэрлэх вэ?

**Claude:**
```typescript
beforeEach(() => {
  const db = getDb();
  db.exec(`DELETE FROM loans; DELETE FROM books; DELETE FROM members;
           DELETE FROM sqlite_sequence WHERE name IN ('books','members','loans');`);
});
```
`sqlite_sequence` цэвэрлэснээр auto-increment ID 1-ээс дахин эхэлнэ — тест
тогтвортой болно.

**⚠️ Анхааруулга:** Claude `afterEach`-д `closeDb()` дуудахыг санал болгосон.
Энэ нь тест бүрийн дараа DB connection хаадаг тул дараагийн тест-д connection
дахин нээх overhead үүсдэг. `afterAll`-д нэг удаа хаах нь зөв.

---

## Гол шийдвэр

- `beforeEach` — DB цэвэрлэх, `afterAll` — DB хаах
- Helper functions (`createBook`, `createMember`, `futureDate`) — DRY
- Supertest ашиглан HTTP layer-ийг бүхэлд нь тест хийх
- 20+ test, coverage ~75%
