> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# 🔒 09 — RECONCILED ARCHITECTURE (Cây thư mục — Source of Truth)

> **Nguồn chân lý cho cấu trúc code.** Chuẩn hoá & thay thế cây thư mục mô tả trong [03-architecture.md](./03-architecture.md) (giải quyết R4). PR lệch cấu trúc này bị từ chối.

---

I've read both documents in full. The core conflict is clear: **docs/03** prescribes a `src/`-rooted, **feature-first + shared layer** architecture, while **docs/05** (written earlier, greenfield) sketches a flat, **layer-based** tree (`components/domain`, `lib/helpers`, `lib/constants`, no `src/`, no features). Below is the single canonical resolution.

---

# R4 — CÂY THƯ MỤC DUY NHẤT (Architecture Reconcile Gate)

> **Vai trò:** Staff Front-end Architect. Tài liệu này **chốt** một cấu trúc thư mục duy nhất cho `FE Interview Prep`, dung hòa `docs/03` (feature-based) với `docs/05` (layer-based), và định nghĩa dứt điểm ranh giới **Hooks / Helpers / Constants / Types / Components / Common**. Giải thích tiếng Việt (giữ thuật ngữ EN); code TypeScript bằng English. Build-ready.

---

## 1. Quyết định kiến trúc

**Mô hình chốt: `feature-first + shared layer`, đóng gốc tại `src/`.**

- **Lý do 1 — khả năng mở rộng đóng/mở (open-closed):** mỗi domain (`questions`, `quiz`, `flashcard`, `learning-path`, `progress`, `auth`, `admin`) là một module tự đóng gói. Thêm `coding-challenge` / `mock-interview` (phase sau) = thêm 1 folder feature, **không đụng** tầng shared hay feature cũ. Cấu trúc layer-based của `docs/05` (`components/domain/` gom tất cả) sẽ phình to và rối khi số domain tăng.
- **Lý do 2 — ranh giới tính chất code enforce được:** tách `hooks` (React logic) / `helpers` (pure, cấm `import react`) / `constants` / `types` lặp lại **cả ở shared lẫn trong feature**, cho phép ESLint `no-restricted-imports` chặn vi phạm ở CI. Đây là nguyên tắc lõi của `docs/03` mà `docs/05` chưa hình thức hóa.

`docs/05` **không bị vứt bỏ** — toàn bộ design tokens (§2), component inventory (§3), a11y (§6) vẫn là nguồn chân lý cho UI; chỉ **cấu trúc thư mục** của nó (mục cuối §8) được thay bằng cây dưới đây.

---

## 2. Sổ đối chiếu mâu thuẫn — cái gì thắng, vì sao

| # | Điểm mâu thuẫn | docs/03 | docs/05 | **CHỐT (source of truth)** |
|---|---|---|---|---|
| 1 | Thư mục gốc | `src/` | (không có, root) | **`src/`** — giữ config files ở root sạch sẽ, chuẩn Next 15 |
| 2 | Cách nhóm code | feature-first | layer (`components/domain/`) | **feature-first**; domain components dời vào `features/<domain>/components/` |
| 3 | Nơi để helpers | `src/helpers` | `lib/helpers` | **`src/helpers`** (shared) + `features/*/helpers` (local). `lib/` = **chỉ infra** |
| 4 | Nơi để constants | `src/constants` | `lib/constants` | **`src/constants`** + `features/*/constants.ts` |
| 5 | Tên tầng data-access | `services/*.service.ts` | (nằm trong `lib`) | **`api/*.api.ts` trong mỗi feature** — 1 từ vựng duy nhất |
| 6 | Thuật toán SRS | `helpers/spaced-repetition.ts` | `lib/helpers/srs.ts` | **`src/helpers/spaced-repetition.ts`** (shared: dùng bởi `flashcard` **và** `progress`/dashboard để đếm "đến hạn ôn") |
| 7 | Generated DB types | `types/database.types.ts` | (n/a) | **`lib/supabase/database.types.ts`** (generated, co-located với client) + `types/db.ts` (alias tiện dụng) |
| 8 | Đặt tên hook | `use-*.ts` (kebab) | `useQuiz`, `useFlashcardSRS` | **file `use-*.ts` (kebab), export `useXxx`** — hai bên nói về hai thứ khác nhau, không thật sự mâu thuẫn |
| 9 | Shape của types/constants feature | folder (`types/`, `constants/`) | (n/a) | **single file `types.ts` / `constants.ts`**; chỉ "thăng cấp" thành folder khi feature phình to |
| 10 | `globals.css` | `app/globals.css` | `app/globals.css` | **`src/app/globals.css`** (entry Tailwind + tokens docs/05 §2.3) + `src/styles/` cho CSS bổ trợ (shiki/prose) |

---

## 3. Cây thư mục đầy đủ (canonical)

```text
src/
├── app/                                  # === APP ROUTER: CHỈ routing + layout, KHÔNG business logic ===
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx                        # landing
│   ├── (app)/                              # khu vực đã đăng nhập
│   │   ├── layout.tsx                      # app shell (AppSidebar + Topbar), guard auth
│   │   ├── questions/
│   │   │   ├── page.tsx                     # Server Component: list câu hỏi (search/filter/bookmark)
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx                    # Client Component (error boundary)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                 # chi tiết (questions.slug NOT NULL + UNIQUE — R7)
│   │   │       └── loading.tsx
│   │   ├── quiz/
│   │   │   ├── page.tsx                     # quiz hub
│   │   │   ├── custom/page.tsx              # CUSTOM QUIZ builder (chọn topic/level/difficulty)
│   │   │   ├── run/page.tsx                 # chạy quiz ad-hoc (quiz_set_id = NULL — R1)
│   │   │   └── [attemptId]/
│   │   │       ├── page.tsx
│   │   │       └── result/page.tsx
│   │   ├── flashcards/page.tsx             # SRS review (SM-2)
│   │   ├── learning-path/
│   │   │   ├── page.tsx                     # roadmap junior->senior
│   │   │   └── [pathSlug]/page.tsx          # tiến độ theo path
│   │   └── dashboard/page.tsx              # tiến độ + streak
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── auth/callback/route.ts          # OAuth callback (Supabase, Google + email)
│   ├── admin/
│   │   ├── layout.tsx                       # guard role = admin (RLS + check server-side)
│   │   ├── page.tsx
│   │   └── questions/
│   │       ├── page.tsx                     # CRUD (Table)
│   │       └── actions.ts                   # 'use server' — Server Actions
│   ├── api/
│   │   └── health/route.ts
│   ├── layout.tsx                           # ROOT: <html>, providers, fonts, theme
│   ├── globals.css                          # Tailwind entry + design tokens (docs/05 §2.3)
│   ├── not-found.tsx
│   └── error.tsx
│
├── features/                             # === DOMAIN MODULES (feature-first) ===
│   ├── questions/
│   │   ├── components/                      # question-card, question-filters, answer-reveal,
│   │   │                                    #   bookmark-button, search-bar (CHỈ UI)
│   │   ├── hooks/                           # use-question-filters.ts, use-bookmark.ts (CHỈ React logic)
│   │   ├── api/                             # questions.api.ts (data-access DUY NHẤT của domain)
│   │   ├── helpers/                         # question.helpers.ts (hàm thuần: buildQuestionFilter...)
│   │   ├── types.ts                         # types nội bộ feature
│   │   ├── constants.ts                     # constants nội bộ feature
│   │   └── index.ts                         # BARREL — public API
│   ├── quiz/
│   │   ├── components/                      # quiz-runner, quiz-result, answer-option, custom-quiz-builder
│   │   ├── hooks/                           # use-quiz-runner.ts, use-custom-quiz.ts
│   │   ├── api/                             # quiz.api.ts
│   │   ├── helpers/                         # scoring.ts (hàm thuần)
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── flashcard/
│   │   ├── components/                      # flashcard-deck, flashcard-flip, review-grade-buttons
│   │   ├── hooks/                           # use-flashcard-review.ts
│   │   ├── api/                             # flashcard.api.ts (đọc/ghi SRS state)
│   │   ├── helpers/                         # deck.helpers.ts (sort due cards — thuần)
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── learning-path/
│   │   ├── components/                      # roadmap-stepper, path-progress
│   │   ├── hooks/                           # use-path-progress.ts
│   │   ├── api/                             # learning-path.api.ts (đọc items + ghi progress — R1)
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── progress/                            # dashboard / streak / analytics (read models)
│   │   ├── components/                      # stat-row, activity-chart (ghép từ common)
│   │   ├── hooks/                           # use-dashboard.ts
│   │   ├── api/                             # progress.api.ts (aggregate, streak/activity — R5)
│   │   ├── types.ts
│   │   └── index.ts
│   ├── auth/
│   │   ├── components/                      # login-form, oauth-buttons
│   │   ├── hooks/                           # use-session.ts
│   │   ├── api/                             # auth.api.ts, profile.api.ts (profiles.role — admin)
│   │   ├── types.ts
│   │   └── index.ts
│   ├── admin/
│   │   ├── components/                      # question-form (RHF+zod), question-table
│   │   ├── hooks/                           # use-question-form.ts
│   │   ├── api/                             # admin.api.ts (gọi Server Actions)
│   │   ├── types.ts
│   │   └── index.ts
│   ├── coding-challenge/                    # [PHASE SAU] — scaffold sẵn, chưa build
│   └── mock-interview/                      # [PHASE SAU]
│
├── components/                           # === UI DÙNG CHUNG (cross-feature) ===
│   ├── ui/                                  # shadcn/ui primitives (button.tsx, card.tsx...) — generated
│   ├── common/                              # building blocks dùng bởi ≥2 feature:
│   │   ├── empty-state.tsx                  #   EmptyState, PageHeader, DataTable, ConfirmDialog
│   │   ├── page-header.tsx
│   │   ├── data-table.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── progress-ring.tsx                #   ProgressRing (quiz result + dashboard + path)
│   │   ├── stat-card.tsx                    #   StatCard (dashboard)
│   │   ├── streak-badge.tsx                 #   StreakBadge (dashboard + flashcard)
│   │   ├── level-badge.tsx                  #   taxonomy display — dùng nhiều feature
│   │   ├── difficulty-indicator.tsx
│   │   ├── topic-chip.tsx
│   │   ├── code-block.tsx                   #   CodeBlock/Shiki (question detail + quiz + flashcard)
│   │   └── confetti-burst.tsx
│   ├── layout/                              # app shell chrome
│   │   ├── app-sidebar.tsx
│   │   ├── app-topbar.tsx
│   │   ├── command-menu.tsx                 # ⌘K global
│   │   ├── theme-toggle.tsx
│   │   └── mobile-tab-bar.tsx
│   └── providers/                           # theme-provider.tsx... (Client Components)
│
├── hooks/                                # === SHARED React hooks (CHỈ React logic) ===
│   ├── use-debounced-value.ts
│   ├── use-media-query.ts
│   ├── use-local-storage.ts
│   └── use-mounted.ts
│
├── helpers/                              # === SHARED PURE FUNCTIONS (TUYỆT ĐỐI không import react) ===
│   ├── date.ts                              # addDays, formatRelative, isDue
│   ├── string.ts                            # slugify, truncate, highlightMatch
│   ├── array.ts                             # groupBy, chunk, shuffle
│   ├── format.ts                            # formatScore, formatPercent
│   ├── result.ts                            # ok()/err() cho Result<T,E>
│   └── spaced-repetition.ts                 # SM-2 (thuần) — shared: flashcard + progress
│
├── constants/                            # === SHARED CONSTANTS ===
│   ├── routes.ts                            # ROUTES.QUESTIONS, ROUTES.QUIZ_CUSTOM...
│   ├── query-keys.ts                        # QUERY_KEYS cho cache
│   ├── taxonomy.ts                          # QUESTION_TYPE | LEVEL | DIFFICULTY | FREQUENCY | CATEGORY (R3, docs/01)
│   ├── messages.ts                          # i18n keys (UI strings)
│   ├── config.ts                            # PAGINATION, DEBOUNCE_MS, STORAGE_KEYS
│   └── index.ts
│
├── types/                                # === SHARED TYPES (hand-written) ===
│   ├── db.ts                                # Tables<'questions'>... alias trên generated types
│   ├── common.ts                            # Result, Nullable, PaginatedResponse
│   ├── api.ts                               # DTO request/response
│   └── i18n.ts                              # Locale, Dictionary
│
├── lib/                                  # === HẠ TẦNG (infra) ===
│   ├── supabase/
│   │   ├── client.ts                        # browser client (Client Components)
│   │   ├── server.ts                        # server client (Server Components / Actions)
│   │   ├── middleware.ts                    # refresh session
│   │   ├── admin.ts                         # service-role client (CHỈ server-side)
│   │   └── database.types.ts                # [GENERATED] supabase gen types — KHÔNG sửa tay
│   ├── cn.ts                                # clsx + tailwind-merge
│   └── fetcher.ts
│
├── store/                                # === ZUSTAND (global client-state) ===
│   ├── slices/
│   │   ├── ui.slice.ts                      # theme, sidebar, locale
│   │   └── quiz-session.slice.ts            # phiên làm quiz đang diễn ra (draft answers)
│   ├── selectors/
│   │   └── quiz.selectors.ts
│   ├── types.ts                             # RootStore
│   └── index.ts
│
├── config/                               # === CẤU HÌNH ứng dụng ===
│   ├── env.ts                               # validate ENV bằng zod (fail-fast)
│   ├── site.ts                              # tên app, metadata, nav items
│   └── i18n.ts
│
├── i18n/                                 # === UI STRINGS ONLY (KHÔNG lưu trong DB) ===
│   ├── dictionaries/
│   │   ├── vi.json
│   │   └── en.json
│   └── get-dictionary.ts
│
├── styles/                               # === CSS bổ trợ ===
│   └── shiki.css                            # dual-theme code highlight overrides
│
└── middleware.ts                         # Next middleware: refresh session, redirect auth
```

> **Lưu ý về data-access:** KHÔNG còn `src/services/` dùng chung (docs/03 có). Mọi truy cập dữ liệu nằm trong `features/<domain>/api/`. Dữ liệu "liên domain" (vd `profiles`) thuộc feature sở hữu nó (`auth/api/profile.api.ts`) và được feature khác dùng **qua barrel** `@/features/auth`. Một từ vựng duy nhất: `api/`.

---

## 4. Zoom-in: một feature module + barrel

```text
features/quiz/
├── components/          # CHỈ render UI (Server mặc định; 'use client' ở lá tương tác)
├── hooks/               # CHỈ React logic — điều phối, KHÔNG tự tính, KHÔNG tự query
├── api/                 # ranh giới data-access DUY NHẤT — nơi duy nhất gọi supabase.from()
├── helpers/             # hàm thuần riêng của quiz (scoring) — cấm import react
├── types.ts            # types nội bộ (promote -> types/ folder khi lớn)
├── constants.ts        # constants nội bộ
└── index.ts            # BARREL — public API, giấu chi tiết nội bộ
```

```ts
// src/features/quiz/index.ts — chỉ export cái "public"
export { QuizRunner } from './components/quiz-runner';
export { QuizResult } from './components/quiz-result';
export { CustomQuizBuilder } from './components/custom-quiz-builder';
export { useQuizRunner } from './hooks/use-quiz-runner';
export type { QuizScore, QuizSource } from './types';
// KHÔNG export helpers/api nội bộ -> giữ ranh giới đóng gói
```

> **Import chéo feature:** feature A import feature B **chỉ qua barrel** (`@/features/quiz`), cấm thọc sâu (`@/features/quiz/api/...`). Enforce bằng ESLint (mục 6).

---

## 5. Bảng "để ở đâu"

### 5.A. FEATURE hay SHARED? (the promotion rule)

```
Chỉ 1 feature dùng?      -> features/<domain>/{components,hooks,api,helpers}, types.ts, constants.ts
≥ 2 feature dùng?        -> src/{components/common, hooks, helpers, constants, types}
Là hạ tầng (infra)?      -> src/lib  (supabase client, cn, fetcher, database.types.ts)
Là UI primitive?         -> src/components/ui (shadcn) | src/components/common (tự viết)
Là chrome app shell?     -> src/components/layout
```

| Đoạn code | Ai dùng | **Để ở đâu** |
|---|---|---|
| `QuestionCard` | chỉ questions | `features/questions/components/question-card.tsx` |
| `ProgressRing` | quiz result + dashboard + path | `components/common/progress-ring.tsx` (shared) |
| `scoreQuiz()` (chấm điểm) | chỉ quiz | `features/quiz/helpers/scoring.ts` (local, thuần) |
| `calculateNextReview()` SM-2 | flashcard **+** progress (đếm due) | `helpers/spaced-repetition.ts` (shared, thuần) |
| `useBookmark()` | chỉ questions | `features/questions/hooks/use-bookmark.ts` |
| `useDebouncedValue()` | filter/search nhiều nơi | `hooks/use-debounced-value.ts` (shared) |
| `createClient()` supabase | infra | `lib/supabase/{server,client}.ts` |

### 5.B. Trong 6 "xô": Hooks / Helpers / Constants / Types / Components / Common

| Xô | Định nghĩa 1 dòng | Được phép | Cấm | Ví dụ ranh giới cụ thể |
|---|---|---|---|---|
| **Custom Hooks** | **React logic** — dùng `useState/useEffect/...`, điều phối helper+api | `import react`, gọi `api/` | tự tính thuật toán, tự gọi `supabase.from()` | `use-quiz-runner.ts` gọi `scoreQuiz()` rồi `quizApi.saveAttempt()` |
| **Helpers** | **Hàm thuần** — cùng input → cùng output, không side-effect | `import` constant/type khác | **`import react`** (ESLint chặn), chạm DB/`window` | `formatRelative(date)` → `helpers/date.ts`; `scoreQuiz()` → feature helper |
| **Constants** | Giá trị hằng, `const assertion` chống hardcode | export literal + `satisfies` | logic, gọi hàm runtime | route path → `constants/routes.ts`; `PAGINATION` → `constants/config.ts` |
| **Types** | Kiểu — union suy ra từ constant, alias trên generated | `import type` | giá trị runtime | type DB → `types/db.ts` (alias) trên `lib/supabase/database.types.ts` (generated) |
| **Components** | Render UI của **một feature** | JSX, dùng hook/common/ui | business query trực tiếp | `quiz-runner.tsx` → `features/quiz/components/` |
| **Common** | UI **dùng chung ≥2 feature**, không gắn business | JSX thuần, props-driven | biết về 1 domain cụ thể | `EmptyState`, `ProgressRing`, `CodeBlock` → `components/common/` |

**4 câu hỏi kim chỉ nam:** *Có `import react` không?* → có = hooks/component, không = helper/constant/type. *Có gọi `supabase` không?* → chỉ được ở `api/`. *Chỉ 1 feature hay ≥2?* → quyết định feature-local vs shared. *Là giá trị hay là kiểu?* → constant vs type.

### 5.C. Ánh xạ `components/domain/` (docs/05) → feature-first

| Component (docs/05 §3.2) | **Vị trí chốt** |
|---|---|
| QuestionCard, AnswerReveal, BookmarkButton, SearchBar, FilterSidebar | `features/questions/components/` |
| QuizRunner, QuizResult, AnswerOption, CustomQuizBuilder | `features/quiz/components/` |
| FlashcardDeck, FlashCard(flip), review-grade-buttons | `features/flashcard/components/` |
| RoadmapStepper | `features/learning-path/components/` |
| ProgressRing, StreakBadge, StatCard, LevelBadge, DifficultyIndicator, TopicChip, CodeBlock, EmptyState, ConfettiBurst | `components/common/` (dùng ≥2 feature) |
| AppSidebar, CommandMenu, ThemeToggle | `components/layout/` |

---

## 6. Quy ước

**Đặt tên** (theo docs/03 §4.1 — giữ nguyên):
- Folder + mọi file: `kebab-case` (đồng bộ shadcn, an toàn case-sensitive khi deploy Linux/Vercel).
- Component: `question-card.tsx` → `export function QuestionCard()`.
- Hook: file `use-quiz-runner.ts` → export `useQuizRunner`.
- Data-access: `*.api.ts` (vd `quiz.api.ts`) → export object `xxxApi`.
- Helper/type/constant nội bộ feature: `types.ts`, `constants.ts` (single file; thăng cấp thành folder khi > ~150 dòng).
- Constant value: `SCREAMING_SNAKE_CASE`. Type/Interface: `PascalCase`, không prefix `I`.
- Next special files giữ nguyên: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, `actions.ts`.

**Barrel (`index.ts`):** chỉ ở **cấp feature** + thư mục nhỏ (`constants/index.ts`). KHÔNG barrel khổng lồ gom cả `src` (gây circular import + phá tree-shaking). KHÔNG barrel cho `app/`.

**Path alias — một alias gốc duy nhất:**
```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```
Dùng: `@/features/quiz`, `@/hooks/use-debounced-value`, `@/constants/routes`, `@/helpers/date`, `@/lib/supabase/server`, `@/types/db`.

**ESLint enforce ranh giới** (docs/03 §10.3):
```js
// 1) helpers/ cấm import react
{ files: ['src/helpers/**', 'src/features/*/helpers/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: [
    { group: ['react', 'react-dom'], message: 'helpers/ phải là hàm THUẦN — không import React.' }] }] } },
// 2) import feature khác chỉ qua barrel
{ files: ['src/features/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: [
    { group: ['@/features/*/*'], message: 'Import feature khác chỉ qua barrel @/features/<name>.' }] }] } },
```

---

## 7. Snippet minh họa — feature `quiz` (ranh giới 4 xô rõ ràng)

```ts
// (b) CONSTANT — src/features/quiz/constants.ts
/** Chống "magic number": ngưỡng điểm & nguồn tạo quiz. */
export const QUIZ_SCORING = {
  PASS_THRESHOLD: 0.5, // >= 50% là đạt
  HIGH_SCORE: 0.8,     // >= 80% -> màu success
  CELEBRATE: 0.9,      // >= 90% -> confetti
} as const;

/** Custom quiz (ad-hoc, không gắn quiz_set) vs bộ đề có sẵn — R1. */
export const QUIZ_SOURCE = { PRESET: 'preset', CUSTOM: 'custom' } as const;
```

```ts
// (c) TYPE — src/features/quiz/types.ts
import type { Tables } from '@/types/db';        // alias trên generated DB types
import type { QUIZ_SOURCE } from './constants';

/** Row DB (generated) — đổi cột DB thì tsc báo lỗi. Tên bảng theo schema chuẩn (R2). */
export type QuizAttempt = Tables<'quiz_attempts'>;

/** Union suy ra từ constant — không khai báo lại, không thể lệch. */
export type QuizSource = (typeof QUIZ_SOURCE)[keyof typeof QUIZ_SOURCE];

export interface QuizAnswer { questionId: string; selectedOptionId: string; isCorrect: boolean; }

/** Kết quả chấm điểm THUẦN (helper trả về) — không chạm DB/React. */
export interface QuizScore { correct: number; total: number; ratio: number; passed: boolean; }
```

```ts
// (a) HELPER THUẦN — src/features/quiz/helpers/scoring.ts
// KHÔNG import react, KHÔNG chạm supabase -> unit test không cần render.
import { QUIZ_SCORING } from '../constants';
import type { QuizAnswer, QuizScore } from '../types';

export function scoreQuiz(answers: QuizAnswer[]): QuizScore {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const ratio = total === 0 ? 0 : correct / total;
  return { correct, total, ratio, passed: ratio >= QUIZ_SCORING.PASS_THRESHOLD };
}
```

```ts
// DATA-ACCESS — src/features/quiz/api/quiz.api.ts
// Ranh giới DUY NHẤT chạm supabase. Client lấy TỪ lib (không tự tạo).
import { createClient } from '@/lib/supabase/client';
import type { QuizAnswer, QuizScore, QuizSource } from '../types';

export const quizApi = {
  /** quizSetId có thể null -> hỗ trợ CUSTOM QUIZ ad-hoc (R1). */
  async saveAttempt(input: {
    quizSetId: string | null; source: QuizSource; score: QuizScore; answers: QuizAnswer[];
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_set_id: input.quizSetId,           // NULL cho custom quiz
        source: input.source,
        correct_count: input.score.correct,
        total_count: input.score.total,
        score_ratio: input.score.ratio,
        answers: input.answers,                  // jsonb
      })
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  },
};
```

```ts
// (d) CUSTOM HOOK — src/features/quiz/hooks/use-quiz-runner.ts
// CHỈ React logic: nối helper (a) + constant (b) + type (c) + api. Không tự tính, không tự query.
'use client';
import { useCallback, useMemo, useState } from 'react';
import { scoreQuiz } from '../helpers/scoring';        // (a)
import { QUIZ_SCORING } from '../constants';           // (b)
import type { QuizAnswer, QuizSource } from '../types'; // (c)
import { quizApi } from '../api/quiz.api';             // data-access (dùng lib client)

export function useQuizRunner({ quizSetId, source }: { quizSetId: string | null; source: QuizSource }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const record = useCallback((a: QuizAnswer) => {
    setAnswers((prev) => [...prev.filter((x) => x.questionId !== a.questionId), a]);
  }, []);

  const score = useMemo(() => scoreQuiz(answers), [answers]);          // điều phối helper thuần
  const isHighScore = score.ratio >= QUIZ_SCORING.HIGH_SCORE;

  const submit = useCallback(async () => {
    setIsSaving(true);
    try { await quizApi.saveAttempt({ quizSetId, source, score, answers }); } // điều phối api
    finally { setIsSaving(false); }
    return score;
  }, [quizSetId, source, score, answers]);

  return { answers, score, isHighScore, isSaving, record, submit };
}
```

**Ranh giới lộ rõ:** thuật toán chấm điểm ở **helper thuần** (test không cần React); các ngưỡng ở **constant**; kiểu ở **type** (union suy ra từ constant → không thể lệch); truy cập DB ở **api/** (nơi duy nhất chạm `supabase`, client lấy từ `lib`); **hook** chỉ giữ state React và điều phối. `quizSetId: string | null` trong cả type, api, hook đảm bảo CUSTOM QUIZ (R1) build-ready xuyên suốt.

---

## Tóm tắt cho parent agent

- **R4 giải quyết:** chốt **feature-first + shared layer** tại `src/`. `docs/03` thắng về cấu trúc; `docs/05` giữ vai trò nguồn chân lý cho **design tokens/UI** (không phải cấu trúc thư mục).
- **10 mâu thuẫn docs/03 vs docs/05** đã chốt trong Sổ đối chiếu (mục 2) — đáng chú ý: `src/` prefix; domain components dời vào `features/<domain>/components/`; `helpers`/`constants` ở `src/` (không phải `lib/`); data-access thống nhất tên `api/*.api.ts` (bỏ `services/`); generated DB types ở `lib/supabase/database.types.ts` + alias `types/db.ts`; SM-2 ở `helpers/spaced-repetition.ts` (shared).
- **Ranh giới 6 xô** (hooks/helpers/constants/types/components/common) định nghĩa + bảng ví dụ cụ thể (mục 5).
- **Kết nối các blocker khác** (không phải nhiệm vụ chính nhưng đã chừa chỗ build-ready): route + component + hook cho **CUSTOM QUIZ** (R1), `learning-path` + `progress` feature cho progress/streak (R1/R5), `constants/taxonomy.ts` cho enum type/level/difficulty/frequency (R3), guard `admin/` role (R6), route `[slug]` (R7). Giá trị enum/tên bảng cụ thể thuộc R2/R3 (agent schema) — snippet tham chiếu qua generated types nên không tạo mâu thuẫn mới.