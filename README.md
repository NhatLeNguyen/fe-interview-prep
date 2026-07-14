# FE Interview Prep

Nền tảng web luyện phỏng vấn **Front-end** song ngữ Việt–Anh (giải thích tiếng Việt, giữ nguyên thuật ngữ tiếng Anh), từ **junior đến senior**: ngân hàng câu hỏi, quiz chấm điểm, flashcard ôn tập ngắt quãng (SRS), lộ trình học và theo dõi tiến độ.

> 📚 Kế hoạch & thiết kế đầy đủ nằm trong thư mục [`docs/`](./docs). Bắt đầu từ [`docs/00-MASTER-PLAN.md`](./docs/00-MASTER-PLAN.md). Nguồn chân lý khi code: [`docs/08-RECONCILED-SCHEMA.md`](./docs/08-RECONCILED-SCHEMA.md) (schema DB) và [`docs/09-RECONCILED-ARCHITECTURE.md`](./docs/09-RECONCILED-ARCHITECTURE.md) (cấu trúc code).

## 🧰 Tech stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | Next.js 16 (App Router, RSC) + TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Backend | Supabase (Postgres · Auth · RLS) |
| Deploy / CI-CD | Vercel |

## ✅ Yêu cầu

- **Node.js ≥ 20** và **npm** (dự án đang dùng Node 24, npm 11).
- Một project **Supabase** (free tier) để lấy API keys.

## 🚀 Chạy dự án (local)

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file biến môi trường từ mẫu
cp .env.example .env.local
#    Windows PowerShell:  Copy-Item .env.example .env.local

# 3. Điền giá trị THẬT vào .env.local (xem mục dưới)

# 4. Chạy dev server
npm run dev
```

Mở **http://localhost:3000**.

## 🔑 Biến môi trường (`.env.local`)

Lấy tại **Supabase Dashboard → Settings → API Keys**. File `.env.local` **không** được commit (đã có trong `.gitignore`).

| Biến | Lấy ở đâu | Ghi chú |
|------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Công khai |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_...`) | Công khai, an toàn (RLS bảo vệ) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`) | 🔴 **BÍ MẬT** — chỉ server, KHÔNG commit, KHÔNG prefix `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | URL gốc của app (`http://localhost:3000` khi dev) | Chống host-header injection ở link xác nhận email; **nên set** ở production |

## 📜 Scripts

| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy dev server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint (kèm rule ranh giới kiến trúc) |
| `npm run typecheck` | `tsc --noEmit` — kiểm tra type |
| `npm run format` | Prettier format toàn bộ |

## 🗂️ Cấu trúc thư mục (tóm tắt)

```
src/
├── app/           # App Router: routing + layout (không chứa business logic)
├── features/      # Module theo domain: questions, quiz, flashcard, learning-path, ...
│   └── <domain>/  #   components · hooks · api · helpers · types.ts · constants.ts · index.ts (barrel)
├── components/    # ui (shadcn) · common (dùng chung) · layout · providers
├── hooks/         # React hooks dùng chung
├── helpers/       # Hàm THUẦN (không import React) — date, string, array, SM-2...
├── constants/     # Hằng số hệ thống (routes, taxonomy, config...)
├── types/         # TypeScript types dùng chung
├── lib/supabase/  # Supabase client (server/browser/admin) + database.types.ts
├── store/         # Zustand
├── config/        # env (zod), site, i18n
└── i18n/          # UI strings (song ngữ)
```

Ranh giới được ESLint enforce: `helpers/` cấm import React; feature import nhau chỉ qua barrel. Chi tiết: [`docs/09`](./docs/09-RECONCILED-ARCHITECTURE.md).

## 🗄️ Database (Supabase)

Schema + RLS + migrations: xem [`docs/08-RECONCILED-SCHEMA.md`](./docs/08-RECONCILED-SCHEMA.md). Hướng dẫn tạo project / chạy migration / seed: [`docs/06-setup-and-deployment.md`](./docs/06-setup-and-deployment.md).

Sau khi chạy migration lên DB thật, sinh lại types:

```bash
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

## ☁️ Deploy (Vercel)

Import repo vào Vercel, khai báo **4 biến môi trường** ở trên (nhập **trước khi Deploy** — app validate env lúc build), push `main` là tự deploy. Runbook từng bước (kèm cấu hình `NEXT_PUBLIC_SITE_URL` + Supabase redirect URL): [`docs/DEPLOY.md`](./docs/DEPLOY.md).

---

<sub>Tài liệu tổng quan trực quan: [`docs/plan-overview.html`](./docs/plan-overview.html).</sub>
