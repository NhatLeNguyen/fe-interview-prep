> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).
>
> ⚠️ **ĐÃ CHUẨN HOÁ SAU RECONCILE GATE.** Cây thư mục chính thức (nguồn chân lý) nằm ở [09-RECONCILED-ARCHITECTURE.md](./09-RECONCILED-ARCHITECTURE.md). File này giữ phần lý giải/nguyên tắc kiến trúc để tham khảo; khi có khác biệt về **cấu trúc thư mục**, **09 thắng**.

# Kiến trúc & Cấu trúc code — FE Interview Prep

> Tài liệu này thiết kế **kiến trúc code** cho dự án theo chuẩn senior: **feature-based + shared layer**, tách bạch tuyệt đối `hooks / helpers / constants / types`, type-safety toàn diện và chống hardcode. Áp dụng trực tiếp cho Next.js 15 (App Router) + TypeScript strict + Supabase + Zustand + Tailwind/shadcn.

---

## 1. Triết lý kiến trúc (3 nguyên tắc lõi)

| Nguyên tắc | Nội dung | Hệ quả trong code |
|---|---|---|
| **1. Feature-first, shared-second** | Code thuộc về một domain (`quiz`, `flashcard`...) sống trong `features/<domain>`. Chỉ khi được **≥ 2 feature** dùng chung thì mới "thăng cấp" (promote) lên `src/hooks`, `src/helpers`, `src/components/common`... | Feature là đơn vị đóng gói, dễ xoá/thêm mà không rối. Coding challenge & Mock interview (phase sau) chỉ là **thêm 2 folder feature mới**, không đụng phần lõi. |
| **2. Tách theo *tính chất* code, không theo *loại file*** | `hooks/` = **chỉ** React logic. `helpers/` = **hàm thuần**, tuyệt đối không `import react`. `constants/` = hằng số. `types/` = kiểu. Ranh giới này lặp lại **cả ở tầng shared lẫn trong từng feature**. | Test dễ (helper test không cần render). Tái sử dụng cao. ESLint có thể **enforce** ranh giới (mục 11). |
| **3. Server-first, client-at-the-leaves** | Mặc định mọi component là Server Component. `'use client'` được đẩy **xuống thấp nhất có thể** (chỉ ở component thực sự cần tương tác). | Bundle nhỏ, data-fetching ngay trong Server Component qua service layer, bảo mật (service key không rò ra client). |

**Quy tắc "đặt ở đâu" (the promotion rule)** — dùng khi phân vân:

```
Chỉ 1 feature dùng?      -> features/<domain>/{hooks,helpers,...}
≥ 2 feature dùng?        -> src/{hooks,helpers,constants,types}  (shared)
Là hạ tầng (infra)?      -> src/lib  (supabase client, cn, fetcher)
Là UI primitive?         -> src/components/ui (shadcn) | src/components/common (tự viết)
```

---

## 2. Cây thư mục đầy đủ

```text
fe-interview-prep/
├── .husky/
│   ├── pre-commit                     # chạy lint-staged
│   └── commit-msg                     # chạy commitlint
├── .vscode/
│   ├── settings.json                  # format on save, eslint fix
│   └── extensions.json                # gợi ý extension cho team
├── public/
│   ├── icons/
│   └── images/
├── supabase/                          # [THỦ CÔNG] quản lý bằng Supabase CLI
│   ├── migrations/
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_rls_policies.sql      # Row Level Security
│   │   └── 0003_functions.sql
│   ├── seed/
│   │   └── seed.sql                   # seed dữ liệu mẫu chất lượng cao
│   └── config.toml
│
├── src/
│   ├── app/                           # === APP ROUTER: CHỈ routing + layout, KHÔNG chứa business logic ===
│   │   ├── (marketing)/               # route group: landing công khai
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (app)/                     # route group: khu vực đã đăng nhập
│   │   │   ├── layout.tsx             # app shell (sidebar + header), guard auth
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx           # Server Component: list câu hỏi
│   │   │   │   ├── loading.tsx        # skeleton khi streaming
│   │   │   │   ├── error.tsx          # error boundary (Client Component)
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx       # chi tiết 1 câu hỏi
│   │   │   │       └── loading.tsx
│   │   │   ├── quiz/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [quizId]/page.tsx
│   │   │   ├── flashcards/page.tsx
│   │   │   ├── learning-path/page.tsx
│   │   │   └── dashboard/page.tsx     # tiến độ cá nhân
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── auth/callback/route.ts # OAuth callback (Route Handler)
│   │   ├── admin/                     # trang quản trị nội dung
│   │   │   ├── layout.tsx             # guard role = admin (RLS + kiểm tra ở server)
│   │   │   ├── page.tsx
│   │   │   └── questions/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts         # 'use server' — Server Actions cho CRUD
│   │   ├── api/
│   │   │   └── health/route.ts        # Route Handlers (webhook, health...)
│   │   ├── layout.tsx                 # ROOT layout: <html>, providers, fonts, theme
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   └── error.tsx                  # root error boundary (Client Component)
│   │
│   ├── features/                      # === DOMAIN MODULES (feature-based) ===
│   │   ├── questions/
│   │   │   ├── components/            # QuestionCard, QuestionFilters, QuestionDetail...
│   │   │   ├── hooks/                 # use-question-filters.ts, use-bookmark.ts (CHỈ React logic)
│   │   │   ├── services/              # questions.service.ts (bọc Supabase query của domain này)
│   │   │   ├── helpers/               # question.helpers.ts (hàm thuần: buildFilterQuery...)
│   │   │   ├── constants/             # question.constants.ts
│   │   │   ├── types/                 # question.types.ts
│   │   │   ├── store/                 # (optional) slice riêng của feature
│   │   │   └── index.ts              # BARREL — public API của feature
│   │   ├── quiz/                      # (cấu trúc tương tự questions)
│   │   ├── flashcard/
│   │   ├── learning-path/
│   │   ├── progress/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── coding-challenge/          # [PHASE SAU] — chỉ tạo folder khi làm, kiến trúc đã sẵn sàng
│   │   └── mock-interview/            # [PHASE SAU]
│   │
│   ├── components/                    # === UI DÙNG CHUNG (cross-feature) ===
│   │   ├── ui/                        # shadcn/ui primitives (button.tsx, dialog.tsx...) — kebab-case
│   │   ├── common/                    # PageHeader, EmptyState, DataTable, ConfirmDialog...
│   │   ├── layout/                    # AppSidebar, AppHeader, ThemeToggle, LocaleSwitcher
│   │   └── providers/                 # ThemeProvider, QueryProvider... (Client Components)
│   │
│   ├── hooks/                         # === SHARED React hooks (CHỈ React logic) ===
│   │   ├── use-debounced-value.ts
│   │   ├── use-media-query.ts
│   │   ├── use-local-storage.ts
│   │   └── use-mounted.ts
│   │
│   ├── helpers/                       # === SHARED PURE FUNCTIONS (TUYỆT ĐỐI KHÔNG import react) ===
│   │   ├── date.ts                    # addDays, formatRelative, isDue...
│   │   ├── string.ts                  # slugify, truncate, highlightMatch...
│   │   ├── array.ts                   # groupBy, chunk, shuffle...
│   │   ├── format.ts                  # formatScore, formatPercent...
│   │   ├── result.ts                  # Result<T,E> helpers (ok/err)
│   │   └── spaced-repetition.ts       # thuật toán SM-2 (thuần)
│   │
│   ├── constants/                     # === SHARED CONSTANTS (chống hardcode) ===
│   │   ├── routes.ts                  # ROUTES.QUESTIONS, ROUTES.QUIZ...
│   │   ├── query-keys.ts              # QUERY_KEYS cho cache
│   │   ├── levels.ts                  # junior | mid | senior (const assertion)
│   │   ├── categories.ts             # javascript | react | css | system-design...
│   │   ├── messages.ts               # thông báo UI (i18n keys)
│   │   ├── config.ts                 # PAGINATION_SIZE, DEBOUNCE_MS...
│   │   └── index.ts
│   │
│   ├── types/                         # === SHARED TYPES (type-safety tuyệt đối) ===
│   │   ├── database.types.ts          # [GENERATED] từ Supabase — không sửa tay
│   │   ├── supabase.ts                # alias tiện dụng: Tables<'questions'>...
│   │   ├── common.ts                  # Result, Nullable, PaginatedResponse...
│   │   ├── api.ts                     # DTO request/response
│   │   └── i18n.ts                    # Locale, Dictionary
│   │
│   ├── lib/                           # === HẠ TẦNG (infra) ===
│   │   ├── supabase/
│   │   │   ├── client.ts              # browser client (Client Components)
│   │   │   ├── server.ts              # server client (Server Components / Actions)
│   │   │   ├── middleware.ts          # refresh session trong middleware
│   │   │   └── admin.ts               # service-role client (chỉ dùng server-side)
│   │   ├── cn.ts                      # clsx + tailwind-merge
│   │   └── fetcher.ts
│   │
│   ├── services/                      # === SHARED data-access (dùng chung nhiều feature) ===
│   │   └── profile.service.ts
│   │
│   ├── store/                         # === ZUSTAND (global slices) ===
│   │   ├── slices/
│   │   │   ├── ui.slice.ts            # theme, sidebar, locale
│   │   │   └── quiz-session.slice.ts  # phiên làm quiz đang diễn ra
│   │   ├── selectors/
│   │   │   └── quiz.selectors.ts
│   │   ├── types.ts                   # RootStore, kiểu các slice
│   │   └── index.ts                   # tạo store, gắn middleware
│   │
│   ├── config/                        # === CẤU HÌNH Ứng dụng ===
│   │   ├── env.ts                     # validate ENV bằng zod
│   │   ├── site.ts                    # tên app, metadata, nav items
│   │   └── i18n.ts
│   │
│   ├── i18n/                          # === SONG NGỮ ===
│   │   ├── dictionaries/
│   │   │   ├── vi.json
│   │   │   └── en.json
│   │   └── get-dictionary.ts
│   │
│   └── middleware.ts                  # Next middleware: refresh session, redirect auth
│
├── .env.example                       # mẫu env (commit)
├── .env.local                         # [THỦ CÔNG] secret thật (KHÔNG commit)
├── eslint.config.mjs
├── .prettierrc.json
├── commitlint.config.cjs
├── components.json                    # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Zoom-in: cấu trúc chuẩn của **một feature module**

Mỗi feature tự đóng gói và chỉ lộ ra ngoài qua `index.ts`. Ví dụ `features/flashcard/`:

```text
features/flashcard/
├── components/
│   ├── flashcard-deck.tsx            # Server Component (nếu chỉ hiển thị)
│   ├── flashcard-review.tsx          # 'use client' — cần state, animation
│   └── review-grade-buttons.tsx      # 'use client'
├── hooks/
│   └── use-flashcard-review.ts       # CHỈ React logic
├── services/
│   └── flashcard.service.ts          # query Supabase riêng của flashcard
├── helpers/
│   └── deck.helpers.ts               # hàm thuần (sort due cards...)
├── constants/
│   └── flashcard.constants.ts
├── types/
│   └── flashcard.types.ts
└── index.ts                          # public API
```

**`index.ts` (barrel) — chỉ export cái "public"**, giấu chi tiết nội bộ:

```ts
// features/flashcard/index.ts
export { FlashcardReview } from './components/flashcard-review';
export { useFlashcardReview } from './hooks/use-flashcard-review';
export { flashcardService } from './services/flashcard.service';
export type { Flashcard, ReviewGrade } from './types/flashcard.types';
// KHÔNG export helpers nội bộ / component con -> giữ ranh giới đóng gói
```

> **Nguyên tắc import chéo feature:** feature A chỉ được import feature B **qua barrel** (`@/features/quiz`), **không** thọc sâu vào file nội bộ (`@/features/quiz/services/...`). ESLint có rule `no-restricted-imports` để enforce (mục 11).

---

## 4. Quy ước đặt tên, barrel & path alias

### 4.1. Đặt tên file/folder

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| **Folder** | `kebab-case` | `learning-path/`, `flashcard/` |
| **File React component** | `kebab-case.tsx` (đồng bộ shadcn) — *tên component bên trong là PascalCase* | `question-card.tsx` → `export function QuestionCard()` |
| **Custom hook** | `use-*.ts` (kebab) → hàm `useXxx` | `use-debounced-value.ts` → `useDebouncedValue` |
| **Helpers / services / constants / types** | `kebab-case`, có hậu tố phân loại | `spaced-repetition.ts`, `flashcard.service.ts`, `question.types.ts` |
| **Zustand slice** | `*.slice.ts` | `ui.slice.ts` |
| **Next special files** | giữ nguyên (lowercase, do Next quy định) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` |
| **Constant value** | `SCREAMING_SNAKE_CASE` | `PAGINATION_SIZE`, `DEBOUNCE_MS` |
| **Type / Interface** | `PascalCase`, **không** prefix `I` | `Question`, `ReviewGrade` |

> Chọn **kebab-case cho mọi file** (kể cả component) để đồng nhất với `shadcn/ui` và tránh lỗi case-sensitivity khi deploy Linux/Vercel (Windows dev không phân biệt hoa/thường → dễ sập trên CI).

### 4.2. Barrel exports (`index.ts`)

- **NÊN:** barrel ở **cấp feature** và cấp thư mục nhỏ (`constants/index.ts`) → import gọn: `import { QuestionCard } from '@/features/questions'`.
- **KHÔNG NÊN:** một barrel "khổng lồ" gom toàn bộ `src` → gây **circular import** và phá tree-shaking (Next phải load cả cây). Không barrel cho `app/`.

### 4.3. Path alias

`tsconfig.json` chỉ cần **một alias gốc** cho đơn giản và ổn định:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Dùng: `@/features/quiz`, `@/hooks/use-debounced-value`, `@/constants/routes`, `@/lib/supabase/server`.

---

## 5. Ví dụ tách bạch: helper thuần + constant + type + custom hook

> Ví dụ điển hình nhất cho ranh giới: **spaced repetition (SM-2)** của flashcard. Xem 4 file — ranh giới giữa "logic thuần" và "React logic" rất rõ.

### (b) Constant — `constants/flashcard.ts` *(chống hardcode, `const assertion`)*

```ts
// src/features/flashcard/constants/flashcard.constants.ts

/** Chất lượng nhớ (quality) theo thang SM-2: 0..5. Dùng const assertion để suy ra union. */
export const REVIEW_GRADE = {
  AGAIN: 0, // quên hẳn
  HARD: 3,
  GOOD: 4,
  EASY: 5,
} as const;

/** Tham số thuật toán — KHÔNG rải số "ma thuật" trong code. */
export const SPACED_REPETITION = {
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,
  FIRST_INTERVAL_DAYS: 1,
  SECOND_INTERVAL_DAYS: 6,
} as const;
```

### (c) Type — `types/flashcard.ts` *(type-safety: union suy ra từ constant, không khai báo lại)*

```ts
// src/features/flashcard/types/flashcard.types.ts
import type { REVIEW_GRADE } from '../constants/flashcard.constants';

/** Union 0 | 3 | 4 | 5 — luôn đồng bộ với constant, không thể lệch. */
export type ReviewGrade = (typeof REVIEW_GRADE)[keyof typeof REVIEW_GRADE];

export interface ReviewState {
  repetitions: number; // số lần nhớ đúng liên tiếp
  easeFactor: number;
  intervalDays: number;
}

export interface NextReview extends ReviewState {
  dueDate: Date; // ngày ôn tập kế tiếp
}
```

### (a) Helper THUẦN — `helpers/spaced-repetition.ts` *(KHÔNG import React → test cực dễ)*

```ts
// src/helpers/spaced-repetition.ts
import { SPACED_REPETITION } from '@/features/flashcard/constants/flashcard.constants';
import type { NextReview, ReviewGrade, ReviewState } from '@/features/flashcard/types/flashcard.types';
import { addDays } from '@/helpers/date';

/**
 * Thuật toán SM-2: tính lần ôn tập kế tiếp.
 * Hàm THUẦN (pure): cùng input -> cùng output, không side-effect, không React.
 */
export function calculateNextReview(
  state: ReviewState,
  grade: ReviewGrade,
  today: Date = new Date(),
): NextReview {
  const { MIN_EASE_FACTOR, FIRST_INTERVAL_DAYS, SECOND_INTERVAL_DAYS } = SPACED_REPETITION;

  // Nhớ kém (< GOOD) -> reset chuỗi, ôn lại sau 1 ngày.
  if (grade < 3) {
    return {
      repetitions: 0,
      easeFactor: state.easeFactor,
      intervalDays: FIRST_INTERVAL_DAYS,
      dueDate: addDays(today, FIRST_INTERVAL_DAYS),
    };
  }

  const repetitions = state.repetitions + 1;
  const intervalDays =
    repetitions === 1 ? FIRST_INTERVAL_DAYS
    : repetitions === 2 ? SECOND_INTERVAL_DAYS
    : Math.round(state.intervalDays * state.easeFactor);

  const nextEase = state.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  const easeFactor = Math.max(MIN_EASE_FACTOR, nextEase);

  return { repetitions, easeFactor, intervalDays, dueDate: addDays(today, intervalDays) };
}
```

```ts
// src/helpers/date.ts — cũng thuần
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

### (d) Custom hook — `hooks/use-flashcard-review.ts` *(CHỈ React logic; nối 3 phần trên)*

```ts
// src/features/flashcard/hooks/use-flashcard-review.ts
'use client';

import { useCallback, useMemo, useState } from 'react';
import { calculateNextReview } from '@/helpers/spaced-repetition';         // (a) helper thuần
import { SPACED_REPETITION } from '../constants/flashcard.constants';       // (b) constant
import type { Flashcard, ReviewGrade, ReviewState } from '../types/flashcard.types'; // (c) type
import { flashcardService } from '../services/flashcard.service';

export function useFlashcardReview(deck: Flashcard[]) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentCard = deck[index] ?? null;

  const grade = useCallback(
    async (value: ReviewGrade) => {
      if (!currentCard) return;
      setIsSaving(true);

      const state: ReviewState = {
        repetitions: currentCard.repetitions,
        easeFactor: currentCard.easeFactor ?? SPACED_REPETITION.DEFAULT_EASE_FACTOR,
        intervalDays: currentCard.intervalDays,
      };

      // Hook chỉ ĐIỀU PHỐI: gọi helper (tính) rồi service (lưu). Không tự tính SM-2 ở đây.
      const next = calculateNextReview(state, value);
      await flashcardService.saveReview(currentCard.id, next);

      setIsFlipped(false);
      setIndex((i) => i + 1);
      setIsSaving(false);
    },
    [currentCard],
  );

  const progress = useMemo(
    () => ({ current: index, total: deck.length, isDone: index >= deck.length }),
    [index, deck.length],
  );

  return { currentCard, isFlipped, isSaving, progress, flip: () => setIsFlipped((f) => !f), grade };
}
```

**Ranh giới lộ rõ:** thuật toán SM-2 nằm ở **helper thuần** (unit test không cần React); các con số nằm ở **constant**; kiểu dữ liệu ở **type** (union suy ra từ constant → không thể lệch); còn **hook** chỉ giữ state React và điều phối. Muốn đổi thuật toán → sửa 1 file helper, không đụng UI.

---

## 6. Server vs Client Components + Data fetching + Error/Loading

### 6.1. Bảng quyết định `'use client'`

| Tình huống | Loại | Lý do |
|---|---|---|
| Hiển thị data, layout, list tĩnh | **Server** (mặc định) | Fetch ngay tại server, bundle 0 JS |
| `useState`, `useEffect`, `useRef` | **Client** | Cần runtime browser |
| Event handler (`onClick`, `onChange`) | **Client** | Tương tác |
| Dùng Zustand / Context / `next-themes` | **Client** | Hook state |
| Browser API (`localStorage`, `window`) | **Client** | Chỉ có ở browser |
| Đọc DB, secret, service-role | **Server** | Bảo mật, không lộ key |

**Chiến lược "client boundary xuống thấp nhất":** trang là Server Component fetch data → truyền props xuống → chỉ **lá tương tác** mới `'use client'`.

```tsx
// src/app/(app)/questions/page.tsx  — SERVER COMPONENT
import { Suspense } from 'react';
import { questionsService } from '@/features/questions';
import { QuestionList, QuestionFilters } from '@/features/questions';
import { PageHeader } from '@/components/common/page-header';
import { QuestionListSkeleton } from '@/features/questions';
import type { QuestionQuery } from '@/features/questions';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<QuestionQuery>;
}) {
  const query = await searchParams;

  return (
    <div className="container py-8">
      <PageHeader title="Ngân hàng câu hỏi" description="Luyện tập theo chủ đề & cấp độ" />
      <QuestionFilters />                              {/* 'use client' — filter tương tác */}
      <Suspense key={JSON.stringify(query)} fallback={<QuestionListSkeleton />}>
        {/* Server Component con: fetch độc lập -> streaming từng phần */}
        <QuestionListLoader query={query} />
      </Suspense>
    </div>
  );
}

async function QuestionListLoader({ query }: { query: QuestionQuery }) {
  const questions = await questionsService.list(query); // fetch tại server qua service layer
  return <QuestionList questions={questions} />;
}
```

### 6.2. `loading.tsx` / `error.tsx` theo segment

```tsx
// src/app/(app)/questions/loading.tsx  — hiện ngay khi route đang tải (streaming)
import { QuestionListSkeleton } from '@/features/questions';
export default function Loading() {
  return <QuestionListSkeleton />;
}
```

```tsx
// src/app/(app)/questions/error.tsx  — error boundary BẮT BUỘC là Client Component
'use client';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      title="Không tải được câu hỏi"
      description={error.message}
      action={<Button onClick={reset}>Thử lại</Button>}
    />
  );
}
```

### 6.3. Xử lý lỗi ở service layer — kiểu `Result<T, E>`

Service **không throw bừa**; trả về `Result` để caller xử lý tường minh (type-safe).

```ts
// src/types/common.ts
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export interface AppError {
  code: string;
  message: string;
}
```

```ts
// src/helpers/result.ts  (thuần)
import type { Result, AppError } from '@/types/common';
export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: AppError): Result<never> => ({ ok: false, error });
```

> Quy ước: trong **Server Component** cho phép `throw` để `error.tsx` bắt (đơn giản). Trong **Server Action / mutation** dùng `Result` để trả lỗi validation về UI mà không crash.

---

## 7. Service layer bọc Supabase + generated types

### 7.1. Ba loại client (dùng `@supabase/ssr`)

```ts
// src/lib/supabase/server.ts — cho Server Components / Actions
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/config/env';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
}
```

```ts
// src/lib/supabase/client.ts — cho Client Components
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config/env';
import type { Database } from '@/types/database.types';

export const createClient = () =>
  createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

> `admin.ts` (service-role) **chỉ** dùng trong server (seed, admin task). Không bao giờ import ở Client Component.

### 7.2. Generated types (chống hardcode kiểu DB)

```bash
# [THỦ CÔNG] chạy khi schema đổi -> ghi ra file, KHÔNG sửa tay
npx supabase gen types typescript --linked > src/types/database.types.ts
```

```ts
// src/types/supabase.ts — alias tiện dụng
import type { Database } from './database.types';
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Question = Tables<'questions'>;   // luôn khớp cột DB, đổi schema -> compile báo lỗi
export type Flashcard = Tables<'flashcards'>;
```

### 7.3. Service = ranh giới data-access duy nhất

```ts
// src/features/questions/services/questions.service.ts
import { createClient } from '@/lib/supabase/server';
import { PAGINATION } from '@/constants/config';
import { buildQuestionFilter } from '../helpers/question.helpers'; // hàm thuần build filter
import type { Question, QuestionQuery } from '../types/question.types';

export const questionsService = {
  async list(query: QuestionQuery): Promise<Question[]> {
    const supabase = await createClient();
    const { level, category, search, page = 1 } = query;

    let q = supabase.from('questions').select('*');
    q = buildQuestionFilter(q, { level, category, search });     // logic filter -> helper thuần

    const from = (page - 1) * PAGINATION.PAGE_SIZE;
    const { data, error } = await q.range(from, from + PAGINATION.PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
```

> Component/hook **không bao giờ** gọi `supabase.from(...)` trực tiếp. Mọi query đi qua `*.service.ts` → đổi backend/query 1 chỗ, dễ mock khi test.

---

## 8. Zustand — slices, middleware, selectors

### 8.1. Tổ chức theo **slice pattern** (một store, nhiều slice)

```ts
// src/store/types.ts
import type { ReviewGrade } from '@/features/flashcard/types/flashcard.types';

export interface UiSlice {
  isSidebarOpen: boolean;
  locale: 'vi' | 'en';
  toggleSidebar: () => void;
  setLocale: (locale: 'vi' | 'en') => void;
}

export interface QuizSessionSlice {
  currentIndex: number;
  answers: Record<string, ReviewGrade>;
  answer: (questionId: string, grade: ReviewGrade) => void;
  next: () => void;
  reset: () => void;
}

export type RootStore = UiSlice & QuizSessionSlice;
```

```ts
// src/store/slices/ui.slice.ts
import type { StateCreator } from 'zustand';
import type { RootStore, UiSlice } from '../types';

export const createUiSlice: StateCreator<RootStore, [['zustand/immer', never]], [], UiSlice> = (set) => ({
  isSidebarOpen: true,
  locale: 'vi',
  toggleSidebar: () => set((s) => { s.isSidebarOpen = !s.isSidebarOpen; }), // immer -> "mutate" an toàn
  setLocale: (locale) => set((s) => { s.locale = locale; }),
});
```

### 8.2. Tạo store + middleware (`devtools` → `persist` → `immer`)

```ts
// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEYS } from '@/constants/config';
import type { RootStore } from './types';
import { createUiSlice } from './slices/ui.slice';
import { createQuizSessionSlice } from './slices/quiz-session.slice';

export const useAppStore = create<RootStore>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUiSlice(...a),
        ...createQuizSessionSlice(...a),
      })),
      {
        name: STORAGE_KEYS.APP_STORE,
        // CHỈ persist cái cần nhớ (tránh lưu state tạm) -> type-safe partialize
        partialize: (s) => ({ locale: s.locale, isSidebarOpen: s.isSidebarOpen }),
      },
    ),
    { name: 'AppStore' },
  ),
);
```

### 8.3. Selectors — tránh re-render thừa

```ts
// src/store/selectors/quiz.selectors.ts
import { useAppStore } from '../index';

// Chọn ĐÚNG mảnh state cần dùng -> component chỉ re-render khi mảnh đó đổi.
export const useLocale = () => useAppStore((s) => s.locale);
export const useSidebarOpen = () => useAppStore((s) => s.isSidebarOpen);
export const useQuizAnswer = (id: string) => useAppStore((s) => s.answers[id]);
```

```tsx
// ĐÚNG: subscribe 1 field
const locale = useLocale();

// SAI: lấy cả store -> re-render mỗi khi bất kỳ field nào đổi
// const store = useAppStore();
```

> Nếu selector trả **object mới**, dùng `useShallow` để so sánh nông:
> `import { useShallow } from 'zustand/react/shallow'` → `useAppStore(useShallow((s) => ({ a: s.a, b: s.b })))`.

**Quy ước Zustand:** hook store tên `useXxxStore`; selector tên `useXxx(...)`; slice file `*.slice.ts`; **không** đặt async fetch trong store (fetch thuộc service layer) — store chỉ giữ **client state** (UI, phiên làm quiz), không giữ **server state**.

---

## 9. Chống hardcode & type-safety tuyệt đối

| Kỹ thuật | Ví dụ | Lợi ích |
|---|---|---|
| **`const assertion` + union suy ra** | `LEVELS` → `Level` | Thêm/sửa 1 chỗ, union tự cập nhật |
| **Union thay vì `enum`** | `type Level = 'junior' \| 'mid' \| 'senior'` | Nhẹ hơn `enum`, tree-shake tốt, khớp string DB |
| **Generated types từ Supabase** | `Tables<'questions'>` | DB đổi cột → TypeScript báo lỗi ngay |
| **Zod ở biên (env, form, API)** | `env.ts`, `questionSchema` | Runtime-safe, không tin dữ liệu ngoài |
| **`satisfies`** | config object | Giữ literal type mà vẫn check shape |

```ts
// src/constants/levels.ts
export const LEVELS = ['junior', 'mid', 'senior'] as const;
export type Level = (typeof LEVELS)[number];             // 'junior' | 'mid' | 'senior'

export const LEVEL_LABEL = {
  junior: { vi: 'Junior', en: 'Junior' },
  mid: { vi: 'Middle', en: 'Middle' },
  senior: { vi: 'Senior', en: 'Senior' },
} satisfies Record<Level, { vi: string; en: string }>;   // thiếu 1 level -> compile lỗi
```

```ts
// src/constants/routes.ts — không rải string đường dẫn khắp nơi
export const ROUTES = {
  HOME: '/',
  QUESTIONS: '/questions',
  QUESTION_DETAIL: (slug: string) => `/questions/${slug}`,
  QUIZ: '/quiz',
  FLASHCARDS: '/flashcards',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;
```

---

## 10. Cấu hình dự án (chuẩn senior)

### 10.1. `tsconfig.json` — strict tối đa

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,     // arr[i] -> T | undefined (bắt bug ngầm)
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true, // an toàn khi deploy Linux
    "verbatimModuleSyntax": true,          // ép import type rõ ràng
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 10.2. Validate ENV bằng zod — `config/env.ts`

```ts
// src/config/env.ts  (fail-fast: sai env là app không chạy, không lỗi mơ hồ lúc runtime)
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // chỉ có ở server
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Biến môi trường không hợp lệ:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data; // dùng `env.X` khắp nơi -> autocomplete + type-safe
```

> Cân nhắc `@t3-oss/env-nextjs` để **tách server/client env** và chặn rò biến server ra client tự động.

### 10.3. ESLint (flat config) — enforce ranh giới kiến trúc

```js
// eslint.config.mjs
import next from '@next/eslint-plugin-next';

export default [
  // ...preset next + typescript...
  {
    rules: {
      // 1) helpers/ TUYỆT ĐỐI không import react
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react', 'react-dom'], message: 'helpers/ phải là hàm THUẦN — không import React.' },
        ],
      }],
      '@typescript-eslint/consistent-type-imports': 'error', // import type { X }
    },
  },
  {
    // 2) cấm import chéo sâu vào nội bộ feature khác (phải qua barrel index.ts)
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@/features/*/*'], message: 'Import feature khác chỉ qua barrel @/features/<name>.' }],
      }],
    },
  },
];
```

### 10.4. Prettier — `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 10.5. Husky + lint-staged + commitlint

```json
// package.json (trích)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/commit-msg
npx --no-install commitlint --edit "$1"
```

```js
// commitlint.config.cjs — Conventional Commits
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // feat, fix, refactor, docs, chore, test, style, perf, ci...
};
```

---

## 11. Các bước THỦ CÔNG (đánh dấu rõ)

| # | Việc | Nơi làm | Ghi chú |
|---|---|---|---|
| M1 | Tạo project + org trên **Supabase** | dashboard | Lấy `URL`, `anon key`, `service_role key` |
| M2 | Chạy migration + RLS policies | Supabase CLI | `supabase db push` |
| M3 | Generate types | terminal | `supabase gen types typescript --linked > src/types/database.types.ts` — chạy lại mỗi khi đổi schema |
| M4 | Tạo `.env.local` | máy local | Copy từ `.env.example`, điền secret (KHÔNG commit) |
| M5 | Bật **Google OAuth** | Supabase → Auth → Providers | Cần Google Cloud OAuth client |
| M6 | Tạo repo **GitHub** | github.com | `main` protected, PR review |
| M7 | Kết nối **Vercel** + set ENV | vercel.com | Import repo → thêm biến môi trường production |
| M8 | Init `shadcn/ui` + `husky` | terminal | `npx shadcn init`, `npx husky init` |

---

## 12. Vì sao kiến trúc này "sẵn sàng mở rộng"

- **Thêm Coding Challenge / Mock Interview (phase sau):** chỉ tạo `src/features/coding-challenge/` với đúng bộ `components/hooks/services/...` và route `app/(app)/coding-challenge/`. **Không** đụng vào feature cũ hay tầng shared.
- **Đổi backend / thêm cache layer:** chỉ sửa `services/*.service.ts` — component/hook không biết Supabase tồn tại.
- **i18n song ngữ:** UI text đi qua `i18n/dictionaries`, thuật ngữ kỹ thuật (`closure`, `hoisting`, `reconciliation`) là **data**, giữ nguyên trong nội dung câu hỏi — không dịch.
- **Type-safety end-to-end:** DB (generated) → service → hook → component; đổi 1 cột DB làm `tsc` báo lỗi trước khi merge.
- **Test-friendly:** helpers thuần test không cần render; services mock được; hooks test bằng `@testing-library/react`.

**Thứ tự triển khai đề xuất:** cấu hình (mục 10) → `lib/supabase` + `config/env` + `types` → shared (`constants/helpers/hooks/components/common`) → feature `auth` → `questions` → `quiz` → `flashcard` + `learning-path` → `progress/dashboard` → `admin`.