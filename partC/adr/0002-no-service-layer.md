# ADR-002: Routes → Models Шууд (Service Layer Орхих)

## Статус

Баталгаажсан (Accepted) — Build хэсгийн явцад

## Нөхцөл байдал (Context)

Build хийх явцад архитектурын чухал сонголттой тулгарсан:
Routes-аас Models-ийг шууд дуудах уу, эсвэл Service layer нэмэх үү?

**Claude-тай ярилцлага:**

> Хэрэглэгч: "loan.routes.ts дотор book availability шалгаж байна.
> Энийг service layer-д шилжүүлэх хэрэгтэй юу?"
>
> Claude: "Том системд тийм — LoanService үүсгэж business logic-ийг тусгаарла.
> Гэхдээ таны төсөлд 3-5 feature байна — service layer нэмэх нь
> over-engineering болно. Routes → Models шууд тохирно."

## Шийдвэр (Decision)

**Service layer нэмэхгүй** — Routes нь Models-ийг шууд дуудна.

```
Request → Route Handler → Model → SQLite
```

Service layer нэмэхгүй байхаар шийдсэн.

## Үндэслэл (Rationale)

### Service layer-ийн давуу тал (нэмэх шалтгаан)
- Business logic тусдаа → тест бичих хялбар
- Route handler жижиг болно
- Ирээдүйд өөр transport (CLI, gRPC) нэмэхэд хялбар

### Service layer-ийн сул тал (орхих шалтгаан)
- Нэмэлт abstraction layer — 3-5 feature-д шаардлагагүй
- Файлын тоо 2 дахин нэмэгдэнэ (5 route + 5 service)
- 7 хоногийн хугацаанд over-engineering эрсдэлтэй
- AI үүсгэсэн service код нь routes-тай давхцах хандлагатай

### Шийдвэрлэх хүчин зүйл
Mini library-д business rule цөөн, энгийн:
- Availability шалгах → 1 мөр
- Member active эсэхийг шалгах → 1 мөр
- Transaction → model дотор

Эдгээрийг service-д шилжүүлэх нь complexity нэмнэ, ашиг бага.

## Үр дагавар (Consequences)

### Эерэг
- Хялбар код бүтэц — шинэ хүн хурдан ойлгоно
- Бага файл → бага maintain хийх зүйл
- AI-тай ажиллахад хялбар — context богино

### Сөрөг
- Хэрэв ирээдүйд CLI эсвэл background job нэмэх бол routes-аас
  business logic задлах refactor хийх шаардлагатай
- Route handler арай том болсон (30-50 мөр)

### Хязгаар
Хэрэв feature 8+ болвол эсвэл нэг business rule олон route-д давтагдвал
Service layer нэмэх ADR-003 бичих.

## AI-тай ярилцлагын дүгнэлт

Claude "best practice" хэмээн Service layer-ийг анхандаа санал болгосон.
Гэхдээ "7 хоног, 3-5 feature" гэсэн контекстийг тодруулахад
"тийм бол Routes → Models шууд зөв" гэж зөвшөөрсөн.

**Сургамж:** AI-ийн "best practice" санал нь контекстгүй байдаг.
Төслийн хэмжээ, хугацааг тодорхой хэлэхэд AI илүү тохирсон зөвлөгөө өгдөг.
