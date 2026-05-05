# AI Usage Report — Mini Library System

**Төсөл:** Mini Library System (F.CSM311 Бие даалт 13)  
**AI хэрэгсэл:** Claude (Anthropic)  
**Хугацаа:** 7 хоног

---

## 1. Юуг AI хийсэн, юуг өөрөө хийсэн?

### А хэсэг (Plan)

**AI хийсэн:**
- Stack харьцуулалтын хүснэгтийг анхны хувилбар үүсгэсэн (Node.js vs FastAPI vs Go)
- Mermaid диаграмын синтаксийг зөв бичихэд тусалсан
- ADR-001-ийн template бөглөхөд санал болгосон
- CLAUDE.md-д "no-go zones" жишээнүүдийг санал болгосон

**Өөрөө хийсэн:**
- Stack сонголтын эцсийн шийдвэр (Node.js — туршлагын үндэслэлээр)
- Scope тодорхойлолт — юу хамрагдах, юу хамрагдахгүй
- Database схемийн эцсийн бүтэц — field нэр, тип, constraint-уудыг өөрөө шийдсэн
- Директор бүтцийн зохион байгуулалт

### Б хэсэг (Build)

**AI хийсэн:**
- `db.util.ts` — SQLite connection singleton болон migration SQL
- `validate.util.ts` — Zod schema-ны анхны хувилбар
- Route handler-уудын boilerplate код
- Test файлуудын бүтэц болон edge case жагсаалт
- Slash command-уудын агуулга

**Өөрөө хийсэн:**
- ISBN validation алгоритмын алдааг олж засах (AI буруу multiplier өгсөн)
- Transaction logic-ийг шалгаж, available_qty-н шалгалтыг application layer-д шилжүүлэх
- Тест бүрийн assertion-ыг ойлгож, зөв эсэхийг шалгах
- `afterAll` vs `afterEach` асуудлыг шийдэх
- Error code-уудыг (`UNAVAILABLE`, `INACTIVE_MEMBER`) өөрөө нэмэх

### В хэсэг (Reflect)

**Өөрөө хийсэн:** Энэ хэсэг бүхэлдээ — туршлагаа өөрөө тайлбарлах

---

## 2. Hallucination-ы жишээнүүд

### Жишээ 1: ISBN-10 Validation Алгоритм

**AI санал болгосон код:**
```typescript
const sum = digits.reduce((acc, d, i) => acc + parseInt(d) * (i + 1), 0);
return sum % 11 === 0;
```

**Асуудал:** ISBN-10-д multiplier нь `(10 - i)` байх ёстой, `(i + 1)` биш.
`(i + 1)` ашигласнаар буруу checksum тооцоологдоно.

**Яаж олсон:** `9780132350884` ISBN-г гараар тооцоолж шалгахад Claude-ийн
алгоритм өөр үр дүн өгч байв. Wikipedia-с ISBN-10 стандартыг уншиж баталгаажуулсан.

**Засвар:**
```typescript
const sum = digits.split('').reduce((acc, d, i) => {
  const val = d === 'X' ? 10 : parseInt(d);
  return acc + val * (10 - i); // ← зөв multiplier
}, 0);
```

**Сургамж:** Mathematical algorithm-уудыг AI-аар үүсгэхэд заавал гараар
тооцоолж шалгах хэрэгтэй. AI нь логикийг зөв мэдэж байсан ч implementation
дээр алдсан.

---

### Жишээ 2: SQLite CHECK Constraint

**AI санал болгосон:**
```sql
available_qty INTEGER NOT NULL DEFAULT 1 CHECK(available_qty >= 0)
```
Мөн "ALTER TABLE-ээр дараа нэмж болно" гэж хэлсэн.

**Асуудал:** SQLite-д `ALTER TABLE ... ADD CONSTRAINT` дэмжигдэхгүй.
Аль хэдийн үүссэн table-д CHECK constraint нэмэх боломжгүй —
table-г устгаж дахин үүсгэх шаардлагатай.

**Яаж олсон:** Код ажиллуулахад migration алдаа гарсан. SQLite documentation
шалгахад ALTER TABLE-ийн хязгаарлалт баталгаажсан.

**Засвар:** Application layer-д шалгах:
```typescript
if (!BookModel.checkAvailability(data.book_id)) {
  throw new AppError(409, 'Book is not available', 'UNAVAILABLE');
}
```

**Сургамж:** AI нь SQL стандартыг мэддэг боловч тодорхой database-ийн
(SQLite, MySQL, PostgreSQL) ялгааг буруу ойлгох тохиолдол бий.
Database-specific feature ашиглахад documentation шалгах хэрэгтэй.

---

### Жишээ 3: Test Cleanup Strategy

**AI санал болгосон:**
```typescript
afterEach(() => closeDb()); // ← буруу
```

**Асуудал:** Тест бүрийн дараа DB connection хааж, дахин нээх нь:
1. Тест удааширдаг
2. Connection state алдагдах эрсдэлтэй
3. In-memory SQLite-д шаардлагагүй

**Засвар:**
```typescript
afterAll(() => closeDb()); // ← зөв — бүх тест дууссаны дараа нэг удаа
```

---

## 3. Security / License Анхаарал

### Security жишээ: SQL Injection Эрсдэл

Эхний iteration-д Claude дараах код санал болгосон:
```typescript
// AI-ийн анхны санал — АЮУЛТАЙ
const results = db.exec(`SELECT * FROM books WHERE title LIKE '%${query.q}%'`);
```

**Асуудал:** `query.q` нь шууд SQL string-д оруулагдаж байна.
Хэрэглэгч `'; DROP TABLE books; --` гэж өгвөл SQL injection амжилттай болно.

**Яаж олсон:** CLAUDE.md-д "SQL injection" no-go rule байсан тул анхааралтай
шалгасан. `/security` slash command ашиглан audit хийхэд илэрсэн.

**Засвар:** Parameterized query ашиглах:
```typescript
// Засварласан — аюулгүй
const like = `%${query.q}%`;
db.prepare(`SELECT * FROM books WHERE title LIKE ?`).get(like);
```

**better-sqlite3** нь prepared statement-ийг автоматаар ашигладаг тул
`.prepare()` + `.get(param)` хэлбэр үргэлж аюулгүй.

### License анхаарал

`npm audit` ажиллуулахад `found 0 vulnerabilities` гарсан. Гэхдээ:
- `prebuild-install@7.1.3` — "No longer maintained" анхааруулга
- `glob@7.1.6` — security vulnerability бүхий хуучин хувилбар (transitive dependency)

Эдгээр нь `better-sqlite3`-ийн transitive dependency тул шууд хянах боломжгүй.
Production-д `npm audit fix` ажиллуулах шаардлагатай.

---

## 4. AI-аар Хурдан Хийсэн Зүйлс

**Хамгийн их цаг хэмнэсэн:**

1. **Boilerplate код** — Express route handler, TypeScript interface, Zod schema
   бичих нь 3-4 цаг хэмнэгдсэн. AI нь pattern-ийг ойлгоод бүх routes-ийг
   нэг хэв маягаар үүсгэсэн.

2. **Test edge case жагсаалт** — "Зээлийн системд ямар edge case байх вэ?" гэхэд
   AI 10+ тохиолдол нэн даруй жагсаасан. Өөрөө бодоход 30+ минут зарцуулах байсан.

3. **Mermaid диаграм** — Архитектурын диаграмыг текстээр тайлбарлахад AI
   Mermaid синтаксаар шуурхай үүсгэсэн.

4. **OpenAPI JSDoc** — Route comment-уудыг Swagger-д тохирох форматаар
   бичихэд AI маш үр дүнтэй байсан.

5. **SQL migration** — `CREATE TABLE` statement-уудыг index, constraint-тай
   хамт бичихэд AI цаг хэмнэсэн.

---

## 5. AI-аар Удаан / Хэцүү Байсан Зүйлс

**Бэрхшээл учирсан:**

1. **ISBN алгоритм** — AI буруу implementation өгсөн тул шалгах, засах нэмэлт
   цаг зарцуулагдсан. Зөв алгоритм өөрөө бичсэн бол хурдан байх байсан.

2. **SQLite-specific behavior** — AI нь general SQL мэддэг боловч SQLite-ийн
   онцлог (ALTER TABLE хязгаарлалт, REGEXP байхгүй гэх мэт) дээр алдаа гаргасан.
   Баримтжуулалт шалгах нэмэлт цаг зарцуулагдсан.

3. **Test isolation** — AI-ийн санал болгосон `afterEach(closeDb)` нь тестийг
   тогтворгүй болгосон. Debug хийхэд цаг орсон.

4. **Антипаттерн: over-engineering** — AI нь Service layer нэмэхийг санал болгосон
   боловч жижиг төсөлд шаардлагагүй байсан. AI-ийн "best practice" нь контекстэд
   үргэлж тохирдоггүй.

5. **Context алдагдах** — Урт session дотор AI өмнөх шийдвэрийг "мартаж"
   зөрчилдөх код санал болгох тохиолдол гарсан. Session-ийг богино байлгах
   шаардлагатай болсон.

---

## 6. Skill Atrophy Эрсдэл ба Зохицуулалт

**Эрсдэл:** AI-тай байнга ажиллавал өөрөө код бичих чадвар суларна.

**Яаж зохицуулсан:**

1. **"AI байхгүй" цаг** — ISBN validation алгоритмыг AI-гүйгээр өөрөө бичиж
   туршсан. Зөв алгоритмыг Wikipedia-с уншиж, гараар implement хийсэн.
   Дараа нь AI-ийн хувилбартай харьцуулахад AI алдаатай байсан нь батлагдсан.

2. **Кодыг тайлбарлах** — AI үүсгэсэн кодын мөр бүрийг ойлгохыг зорьсон.
   Ойлгоогүй хэсгийг AI-д тайлбарлуулж, дараа нь өөрийн үгээр давтсан.

3. **Тест өөрөө бичих** — AI test edge case-уудыг жагсаасан боловч тест
   assertion-уудыг ихэнхдээ өөрөө бичсэн.

4. **Review хийх** — AI үүсгэсэн бүх кодыг commit хийхээсээ өмнө уншиж,
   ойлгосноо баталгаажуулсан. Ойлгоогүй бол засварласан.

5. **Ялгах дадал** — "AI юу хийсэн, би юу хийсэн" гэдгийг AI session log-д
   тэмдэглэсэн нь ухамсарлахад тусалсан.
