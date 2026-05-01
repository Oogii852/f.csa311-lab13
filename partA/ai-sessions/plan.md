# AI Planning Session — partA

**Огноо:** 2025-01-xx  
**Хэрэглэсэн AI:** Claude (Anthropic)  
**Зорилго:** Архитектур, stack сонголт, директор бүтцийг тогтоох

---

## Session 1: Stack сонголт

**Хэрэглэгч:** Mini library систем хийхэд ямар stack тохиромжтой вэ?
Node.js+Express, Python+FastAPI, Go+Gin-г харьцуул.

**Claude (товч):**
Гурван stack тус бүрийг дараах шалгуураар харьцуулсан:
- Performance: Go > FastAPI ≈ Node.js
- Type safety: Go > TypeScript > Python hints
- Developer experience: FastAPI > Node.js > Go
- AI code quality: Node.js ≈ FastAPI >> Go
- SQLite integration: FastAPI (SQLAlchemy) > Node.js (better-sqlite3) > Go (CGO)

Санал: FastAPI хамгийн тохиромжтой (built-in OpenAPI, Pydantic).

**Хэрэглэгч:** Надад Python туршлага бага байна, TypeScript илүү мэддэг.
7 хоногт дуусгах хэрэгтэй. Node.js-г сонговол яах вэ?

**Claude:** Node.js + TypeScript сонголт оновчтой. Туршлагатай stack дээр
AI-тай ажиллахад:
1. Алдааг хурдан засах чадвартай
2. AI үүсгэсэн кодыг шалгах, ойлгох хялбар
3. Jest + Supertest хослол тест бичихэд маш хялбар

**⚠️ Анхааруулга:** Claude эхэндээ FastAPI-г "хамгийн сайн" гэсэн боловч
туршлагын хүчин зүйлийг тооцоогүй байсан. Энэ нь AI-ийн "ерөнхий оновчтой"
vs "та бодитоор оновчтой" ялгааны жишээ.

---

## Session 2: Архитектур

**Хэрэглэгч:** Mini library API-д ямар layer бүтэц тохиромжтой вэ?
Routes → Services → Models уу, эсвэл Routes → Models шууд уу?

**Claude:** Номын сангийн хэмжээнд (3-5 feature) Routes → Models шууд байвал хангалттай.
Service layer нэмэхэд:
- Давуу: business logic тусдаа, тест хялбар
- Сул: over-engineering жижиг төсөлд, нэмэлт файлууд

Санал: Routes → Models (direct). Хожим service layer нэмэх бол ADR-002 бич.

**Шийдэл:** Routes → Models шууд — энгийн, хурдан.

---

## Session 3: Database схем

**Хэрэглэгч:** Books, Members, Loans хүснэгтийн схем санал болго.
ISBN validation хэрэгтэй юу?

**Claude:** Схем санал:
```sql
books(id, isbn UNIQUE, title, author, category, quantity, available_qty, created_at)
members(id, name, email UNIQUE, phone, joined_at, is_active DEFAULT 1)
loans(id, book_id FK, member_id FK, loaned_at, due_date, returned_at, status)
```

ISBN validation: Application layer-д зөвхөн (ISBN-13 checksum алгоритм).
DB-д CHECK constraint нэмэхгүй — SQLite-д хязгаарлагдмал.

**⚠️ Hallucination жишээ:** Claude "SQLite CHECK constraint-д regex дэмжигддэг"
гэж хэлсэн боловч SQLite-д REGEXP функц default байхгүй.
extension суулгахгүй бол ажиллахгүй. Application layer-д шийдсэн.

---

## Session 4: Директор бүтэц

**Хэрэглэгч:** Node.js + Express + TypeScript-д ямар folder бүтэц тохиромжтой вэ?
Feature-based эсвэл layer-based?

**Claude:** Жижиг төсөлд (≤5 feature) layer-based тохиромжтой:
```
src/
  routes/    → HTTP layer
  models/    → Data layer  
  middleware/ → Cross-cutting
  utils/     → Helpers
```
Feature-based нь 10+ feature-тэй том системд илүү тохиромжтой.

**Шийдэл:** Layer-based — даалгаврын хэмжээнд тохирсон.

---

## Нийт ажиглалт

| Асуулт | AI санал | Эцсийн шийдэл | Ялгааны шалтгаан |
|--------|----------|---------------|-----------------|
| Stack | FastAPI | Node.js+TS | Хувийн туршлага |
| Layer | Routes→Models | Routes→Models | Тохирсон |
| SQLite regex | DB CHECK | App layer | Hallucination засвар |
| Structure | Layer-based | Layer-based | Тохирсон |
