# AI Session 02 — ISBN Validation Debug

**Огноо:** 2025-01-xx  
**Зорилго:** ISBN validation алдааг засах  
**Үр дүн:** ISBN-10 болон ISBN-13 checksum зөв ажиллаж байна

---

## Session товч

**Хэрэглэгч:** ISBN `9780132350884` valid гэж гарч байна, зөв үү?

**Claude:** Тийм, энэ ISBN-13. Checksum тооцоолол:
```
9*1 + 7*3 + 8*1 + 0*3 + 1*1 + 3*3 + 2*1 + 3*3 + 5*1 + 0*3 + 8*1 + 8*3 + 4*1
= 9+21+8+0+1+9+2+9+5+0+8+24+4 = 100
100 % 10 = 0 ✅
```

**Хэрэглэгч:** `1234567890` гэвэл яах вэ? (ISBN-10)

**Claude:** ISBN-10 checksum:
```
1*10 + 2*9 + 3*8 + 4*7 + 5*6 + 6*5 + 7*4 + 8*3 + 9*2 + 0*1
= 10+18+24+28+30+30+28+24+18+0 = 210
210 % 11 = 1 ≠ 0 ❌ Invalid
```

**⚠️ Hallucination жишээ:** Claude эхэндээ ISBN-10 validation-д:
```typescript
const sum = digits.reduce((acc, d, i) => acc + parseInt(d) * (i + 1), 0);
```
гэж санал болгосон — энэ **буруу**. Зөв алгоритм нь `(10 - i)` multiplier:
```typescript
const sum = digits.split('').reduce((acc, d, i) => {
  const val = d === 'X' ? 10 : parseInt(d);
  return acc + val * (10 - i);  // ← зөв
}, 0);
```
Wikipedia-с ISBN-10 алгоритмыг шалган зассан.

---

## Гол шийдвэр

- ISBN-10 болон ISBN-13 хоёуланг дэмжих
- Zod `refine()` ашиглан custom validation
- AI-ийн алгоритм алдаатай байсан — гараар шалгаж засах шаардлагатай болсон
