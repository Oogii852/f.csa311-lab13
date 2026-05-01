# ARCHITECTURE.md — Mini Library System

## Системийн архитектур

### Давхарга (Layer) диаграм

```mermaid
graph TB
    subgraph Client["Client Layer"]
        FE["Minimal Frontend\n(HTML + Fetch API)"]
        SW["Swagger UI\n/api-docs"]
    end

    subgraph API["API Layer (Express)"]
        MW["Middleware\n(helmet, rate-limit, logger)"]
        RT["Routes\n/api/books\n/api/members\n/api/loans\n/api/stats"]
        VAL["Validation\n(zod schemas)"]
    end

    subgraph Service["Service Layer"]
        BS["BookService"]
        MS["MemberService"]
        LS["LoanService"]
        SS["StatsService"]
    end

    subgraph Data["Data Layer"]
        BM["BookModel"]
        MM["MemberModel"]
        LM["LoanModel"]
        DB["SQLite Database\n(better-sqlite3)"]
    end

    FE --> MW
    SW --> MW
    MW --> VAL
    VAL --> RT
    RT --> BS
    RT --> MS
    RT --> LS
    RT --> SS
    BS --> BM
    MS --> MM
    LS --> LM
    SS --> BM
    SS --> LM
    BM --> DB
    MM --> DB
    LM --> DB
```

### Модулийн харилцаа

```mermaid
graph LR
    subgraph Routes
        BR["book.routes.ts"]
        MR["member.routes.ts"]
        LR["loan.routes.ts"]
        SR["stats.routes.ts"]
    end

    subgraph Models
        BM["book.model.ts"]
        MM["member.model.ts"]
        LM["loan.model.ts"]
    end

    subgraph Utils
        DB["db.util.ts\n(connection singleton)"]
        VL["validate.util.ts\n(zod schemas)"]
        ER["error.util.ts\n(AppError class)"]
    end

    subgraph Middleware
        EH["error.middleware.ts"]
        RL["rateLimit.middleware.ts"]
    end

    BR --> BM
    MR --> MM
    LR --> LM
    LR --> BM
    LR --> MM
    SR --> BM
    SR --> LM
    BM --> DB
    MM --> DB
    LM --> DB
    BR --> VL
    MR --> VL
    LR --> VL
    EH --> ER
```

### Data Flow — Ном зээлэх

```mermaid
sequenceDiagram
    participant C as Client
    participant MW as Middleware
    participant LR as LoanRoute
    participant ZOD as Zod Validation
    participant LM as LoanModel
    participant BM as BookModel
    participant DB as SQLite

    C->>MW: POST /api/loans {bookId, memberId, dueDate}
    MW->>ZOD: validate request body
    ZOD-->>MW: ✅ valid / ❌ 400 error
    MW->>LR: validated data
    LR->>BM: checkAvailability(bookId)
    BM->>DB: SELECT available_qty FROM books
    DB-->>BM: qty = 2
    BM-->>LR: available: true
    LR->>LM: createLoan(bookId, memberId, dueDate)
    LM->>DB: BEGIN TRANSACTION
    LM->>DB: INSERT INTO loans ...
    LM->>DB: UPDATE books SET available_qty = qty - 1
    LM->>DB: COMMIT
    DB-->>LM: loan record
    LM-->>LR: ILoan object
    LR-->>C: 201 { success: true, data: loan }
```

### Database схем

```mermaid
erDiagram
    BOOKS {
        integer id PK
        text isbn UK
        text title
        text author
        text category
        integer quantity
        integer available_qty
        text created_at
    }

    MEMBERS {
        integer id PK
        text name
        text email UK
        text phone
        text joined_at
        integer is_active
    }

    LOANS {
        integer id PK
        integer book_id FK
        integer member_id FK
        text loaned_at
        text due_date
        text returned_at
        text status
    }

    BOOKS ||--o{ LOANS : "зээлэгдэнэ"
    MEMBERS ||--o{ LOANS : "зээлдэнэ"
```

## Модулийн тайлбар

| Модуль | Файл | Үүрэг |
|--------|------|-------|
| App entry | `src/app.ts` | Express app тохиргоо, middleware бүртгэл |
| Server | `src/server.ts` | HTTP server эхлүүлэх, graceful shutdown |
| DB Util | `src/utils/db.util.ts` | SQLite connection singleton, migration |
| Book Model | `src/models/book.model.ts` | CRUD + хайлт + availability |
| Member Model | `src/models/member.model.ts` | CRUD + идэвхжүүлэх/идэвхгүй болгох |
| Loan Model | `src/models/loan.model.ts` | Зээл үүсгэх, буцаах, хугацаа шалгах |
| Validation | `src/utils/validate.util.ts` | Zod schema-нууд |
| Error handler | `src/middleware/error.middleware.ts` | Глобал алдаа барих |
| Rate limiter | `src/middleware/rateLimit.middleware.ts` | express-rate-limit |

## Deployment

```
[Developer] → git push → GitHub
                              ↓
                     [Server: Ubuntu 22]
                     node dist/server.js
                     Port 3000
                     library.db (local file)
```
