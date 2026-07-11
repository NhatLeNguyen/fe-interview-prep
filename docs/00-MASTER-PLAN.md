# 00 — MASTER PLAN · FE Interview Prep

> **Tài liệu điều phối cấp cao (Master Plan).** File này là "lớp orchestration" của toàn bộ dự án: tổng hợp tầm nhìn, phạm vi, lộ trình và các quyết định chốt. Nó **không lặp lại** nội dung chi tiết — mỗi mảng kỹ thuật nằm ở file riêng trong `docs/` (xem [Mục lục tài liệu](#3-mục-lục-tài-liệu)).
>
> **Người phụ trách tài liệu:** Technical Program Manager
> **Cập nhật lần cuối:** 2026-07-11
> **Trạng thái:** `PHASE 0 — READY TO BUILD` · **Reconcile Gate: ✅ PASSED (2026-07-11)** — 3 blocker R1/R2/R3 + R4–R7 + 17 issue reviewer đã đóng. Nguồn chân lý build: [08-RECONCILED-SCHEMA.md](./08-RECONCILED-SCHEMA.md) (schema + types) & [09-RECONCILED-ARCHITECTURE.md](./09-RECONCILED-ARCHITECTURE.md) (cây thư mục); nhật ký chốt: [10-RECONCILE-GATE-RESOLUTION.md](./10-RECONCILE-GATE-RESOLUTION.md).

---

## ✅ RECONCILE GATE ĐÃ PASSED — sẵn sàng build

Bộ tài liệu ban đầu chất lượng cao nhưng có **3 lỗ hổng nghiêm trọng** (custom quiz & learning-path progress không có bảng; tên bảng lệch nhau; enum xung đột taxonomy). **Reconcile Gate đã chạy xong (2026-07-11)** và đóng dứt điểm cả 3 blocker + R4–R7 + **17 issue** do bước verify (feature-coverage / security-RLS / SQL-consistency) bắt được.

- 🔒 **Schema + TypeScript types (nguồn chân lý DB):** [08-RECONCILED-SCHEMA.md](./08-RECONCILED-SCHEMA.md)
- 🔒 **Cây thư mục (nguồn chân lý code):** [09-RECONCILED-ARCHITECTURE.md](./09-RECONCILED-ARCHITECTURE.md)
- 📋 **Nhật ký chốt R1–R7:** [10-RECONCILE-GATE-RESOLUTION.md](./10-RECONCILE-GATE-RESOLUTION.md)

Giờ đã **an toàn để gen types & build Phase 1**. Các Section 4/3 gốc vẫn giữ để tham khảo nhưng khi khác biệt thì **08/09 thắng**. Bối cảnh 3 blocker gốc nằm ở [Section 7 — Rủi ro & Lưu ý](#7-rủi-ro--lưu-ý-từ-reviewer).

---

## 1. Executive Summary & Tầm nhìn sản phẩm

**FE Interview Prep** là nền tảng web giúp lập trình viên Front-end luyện phỏng vấn một cách có hệ thống, từ **junior đến senior**. Khác với việc đọc tản mạn các bài blog hay danh sách câu hỏi rời rạc, sản phẩm gói toàn bộ kiến thức phỏng vấn FE vào một **lộ trình học có cấu trúc**: ngân hàng câu hỏi kèm đáp án giải thích chi tiết, quiz trắc nghiệm chấm điểm tức thì, và hệ thống **flashcard ôn tập ngắt quãng (spaced repetition)** để kiến thức không bị quên. Nội dung **song ngữ Việt–Anh**: giải thích bằng tiếng Việt để dễ tiếp thu, nhưng **giữ nguyên thuật ngữ tiếng Anh** (`closure`, `hoisting`, `reconciliation`, `event loop`...) đúng như cách chúng xuất hiện trong phỏng vấn thật.

Điểm khác biệt cốt lõi (value proposition) nằm ở **cặp SRS + streak**: người học không chỉ "đọc để biết" mà được dẫn dắt ôn lại đúng thời điểm sắp quên, kèm theo dõi tiến độ và chuỗi ngày học (streak) để tạo động lực. Người dùng ở đây là **người học** — họ không phải tự đi tổng hợp câu hỏi; toàn bộ nội dung được **seed sẵn với chất lượng cao và đầy đủ**, và được duy trì qua một **trang Admin** cho phép thêm/sửa/cập nhật dần.

Về mặt kỹ thuật, dự án được thiết kế như một **sản phẩm thật, chuẩn senior**: kiến trúc tách bạch (hooks / helpers / constants / types / components), type-safety tuyệt đối với TypeScript strict mode, bảo mật bằng Supabase Row Level Security (RLS), và sẵn sàng mở rộng cho các tính năng phase sau (**Coding challenge** với live editor, **Mock interview**) mà không phải đập đi xây lại. Master Plan này đảm bảo mọi mảng ghép đúng vào nhau trước khi một dòng code được viết.

---

## 2. Mục tiêu & Phạm vi

### 2.1. Mục tiêu sản phẩm (Product Goals)

| # | Mục tiêu | Đo lường thành công (định tính) |
|---|----------|-------------------------------|
| G1 | Người học có lộ trình rõ ràng junior → senior | Học viên biết "học gì tiếp theo" mà không cần tự sắp xếp |
| G2 | Kiến thức được ghi nhớ lâu dài | SRS đẩy đúng thẻ cần ôn; streak duy trì thói quen |
| G3 | Nội dung chất lượng, sẵn sàng dùng ngay | Seed đầy đủ, không có chỗ "TODO/trống" khi user vào |
| G4 | Codebase dễ bảo trì & mở rộng | Thêm tính năng phase sau không phá vỡ cấu trúc hiện tại |
| G5 | An toàn dữ liệu người dùng | RLS chặn mọi truy cập chéo; không lộ `service_role` |

### 2.2. In-scope — MVP (Phase 1)

- ✅ **Auth**: Supabase Auth (Google OAuth + email), RLS đầy đủ.
- ✅ **Ngân hàng câu hỏi**: xem theo chủ đề/cấp độ, **search, filter, bookmark**, đáp án giải thích chi tiết.
- ✅ **Quiz trắc nghiệm**: chấm điểm tự động + giải thích từng đáp án; hỗ trợ **custom quiz** (người dùng tự chọn chủ đề/độ khó để tạo bộ đề).
- ✅ **Flashcard + Spaced Repetition (SRS)**: lịch ôn ngắt quãng, "must-know deck".
- ✅ **Learning Path**: lộ trình theo cấp độ, **theo dõi tiến độ từng bước**.
- ✅ **Dashboard tiến độ cá nhân**: streak, hoạt động, thống kê học tập.
- ✅ **Admin CRUD**: thêm/sửa/xóa/cập nhật câu hỏi, quiz, flashcard, learning path.
- ✅ **UI i18n + Dark mode**: giao diện đa ngôn ngữ (khung), nội dung song ngữ.

### 2.3. Out-of-scope — Phase sau (kiến trúc phải sẵn sàng, nhưng KHÔNG làm ở MVP)

- 🔜 **Coding Challenge** (live code editor, chấm tự động) — Phase 2.
- 🔜 **Mock Interview** (mô phỏng phỏng vấn) — Phase 2.
- 🔜 **Gamification đầy đủ** (badge, leaderboard, XP) — Phase 2.
- 🔜 **SEO nâng cao, Analytics, PWA/offline, i18n hoàn chỉnh, tối ưu performance** — Phase 3.

> **Nguyên tắc:** MVP tập trung vào **learning loop cốt lõi** (đọc → quiz → SRS → theo dõi tiến độ). Mọi thứ khác chỉ được thêm khi loop này đã vững.

---

## 3. Mục lục tài liệu

| File | Nội dung | Vai trò |
|------|----------|---------|
| [`docs/01-knowledge-taxonomy.md`](./01-knowledge-taxonomy.md) | Cây phân loại kiến thức FE: chủ đề, category (theory/coding/system-design/behavioral), level, difficulty, frequency. | **Nguồn chân lý về phân loại nội dung** — quyết định enum trong DB. |
| [`docs/02-features-and-flows.md`](./02-features-and-flows.md) | Đặc tả tính năng & user flows: ngân hàng câu hỏi, quiz, flashcard/SRS, learning path, dashboard, admin. | Định nghĩa hành vi hệ thống & yêu cầu dữ liệu. |
| [`docs/03-architecture.md`](./03-architecture.md) | Kiến trúc ứng dụng: Next.js App Router, tách hooks/helpers/constants/types, state (Zustand), data layer. | Lý giải kiến trúc (→ cây thư mục chuẩn hoá ở **09**). |
| [`docs/04-supabase-data-model.md`](./04-supabase-data-model.md) | Data model: giải thích Supabase, RLS, kết nối cho người mới. | Nền tảng DB (→ schema chuẩn hoá ở **08**). |
| [`docs/05-ui-ux-design-system.md`](./05-ui-ux-design-system.md) | Design system: shadcn/ui, tokens, dark mode, component patterns, responsive. | Chuẩn UI/UX & thư viện component dùng chung. |
| [`docs/06-setup-and-deployment.md`](./06-setup-and-deployment.md) | Hướng dẫn setup & deploy: repo, env, Supabase project, Vercel CI/CD, các bước thủ công. | Runbook DevOps beginner-friendly. |
| [`docs/07-review-notes.md`](./07-review-notes.md) | Kết quả phản biện độc lập: blocker, rủi ro, điểm chưa nhất quán. | Bối cảnh vì sao cần Reconcile Gate. |
| 🔒 [`docs/08-RECONCILED-SCHEMA.md`](./08-RECONCILED-SCHEMA.md) | Schema Postgres hợp nhất + RLS + trigger + **TypeScript types**. | **NGUỒN CHÂN LÝ DB (dùng để build).** |
| 🔒 [`docs/09-RECONCILED-ARCHITECTURE.md`](./09-RECONCILED-ARCHITECTURE.md) | Cây thư mục đã chốt (feature-first + shared layer) + quy tắc "để ở đâu". | **NGUỒN CHÂN LÝ CODE (dùng để build).** |
| 📋 [`docs/10-RECONCILE-GATE-RESOLUTION.md`](./10-RECONCILE-GATE-RESOLUTION.md) | Nhật ký chốt R1–R7, quyết định quan trọng, hạng mục defer. | Decision log của Reconcile Gate. |

---

## 4. Lộ trình theo Phase (Roadmap)

> Công việc được đánh số `P{phase}.{n}`. Checkbox `[ ]` để tick tiến độ. Mỗi phase có **Mục tiêu**, **Công việc chính** và **Definition of Done (DoD)** — chỉ được coi là "xong" khi DoD đạt.

### Phase 0 — Khởi tạo (Foundation)

**Mục tiêu:** Dựng khung dự án chạy được end-to-end (local + deploy), chưa có nghiệp vụ.

**Công việc chính:**
- [ ] `P0.1` Tạo GitHub repo, thiết lập branch protection cho `main`.
- [ ] `P0.2` Khởi tạo Next.js 15 (App Router) + TypeScript **strict mode**.
- [ ] `P0.3` Cài & cấu hình Tailwind CSS + shadcn/ui (theme tokens, dark mode base).
- [ ] `P0.4` Cài Zustand + dựng khung store rỗng.
- [ ] `P0.5` Dựng **cây thư mục chuẩn** (hooks/helpers/constants/types/components/common) theo `docs/03`.
- [ ] `P0.6` Tạo Supabase project; lấy `Project URL` + `anon key`; cấu hình `.env.local` + `.env.example`.
- [ ] `P0.7` Cài Supabase CLI (đúng cách — xem [Section 5](#5-checklist-các-bước-thủ-công)), link project, khởi tạo migration folder.
- [ ] `P0.8` Kết nối GitHub → Vercel; setup **CI/CD** (preview deploy mỗi PR, production deploy trên `main`); nạp env vào Vercel.
- [ ] `P0.9` Dựng khung i18n + layout gốc (header, theme toggle, locale switch).

**Definition of Done:**
- ✅ Chạy `npm run dev` local không lỗi; trang chủ render với dark mode + đổi ngôn ngữ khung.
- ✅ Push lên `main` → Vercel deploy production thành công; mỗi PR có preview URL.
- ✅ Kết nối được Supabase (test 1 query đơn giản qua client).
- ✅ TypeScript strict bật, `tsc --noEmit` sạch; lint/format pipeline chạy.

---

### 🚦 Reconcile Gate — Cổng chốt trước khi build

> ✅ **GATE ĐÃ PASSED (2026-07-11).** Toàn bộ RG.1–RG.7 đã hoàn tất; kết quả ở [08-RECONCILED-SCHEMA](./08-RECONCILED-SCHEMA.md) · [09-RECONCILED-ARCHITECTURE](./09-RECONCILED-ARCHITECTURE.md) · [10-RESOLUTION](./10-RECONCILE-GATE-RESOLUTION.md). (Giữ lại phần dưới để tham chiếu công việc đã làm.)

**Công việc:**
- [x] `RG.1` **Chốt schema duy nhất** làm single source of truth: hợp nhất 3 mô hình quiz/flashcard/learning-path đang mâu thuẫn giữa Section 2/3/4; thống nhất **tên bảng** (chọn dứt điểm: `flashcards` vs `flashcard_reviews`, `path_steps` vs `learning_path_items`, `quiz_sessions` vs `quiz_attempts`).
- [x] `RG.2` **Bổ sung schema cho 2 MVP must-have đang thiếu**: (a) custom quiz — bỏ ràng buộc `quiz_id NOT NULL` hoặc thêm cơ chế quiz ad-hoc; (b) learning-path progress — **thêm bảng progress** (hiện chưa có).
- [x] `RG.3` **Sửa enum theo taxonomy (Section 1)**: khôi phục phân loại `category` (theory/coding/system-design/behavioral), tách bạch `level` (junior→senior) khỏi `difficulty`, và **thêm `frequency`** để dựng "must-know deck" + chọn câu MVP.
- [x] `RG.4` **Chốt cây thư mục duy nhất**: dung hòa feature-based (Section 3) vs layer-based (Section 5); định nghĩa rõ "tách hooks/helpers/constants/types" nghĩa là gì để team không code lệch.
- [x] `RG.5` Chốt cơ chế kỹ thuật cho **SRS + streak**: `activity_log`/`streak` fields, reminder/notification, và (đặt chỗ) offline queue.
- [x] `RG.6` Chốt **quy ước id/slug**: `questions.slug` NOT NULL + unique, routing nhất quán để tránh 404.
- [x] `RG.7` **Chỉ sau khi RG.1–RG.6 xong** → generate TypeScript types từ schema đã chốt.

**Definition of Done:**
- ✅ Có **một** file schema được đánh dấu "SOURCE OF TRUTH" (`docs/08`); các section khác trỏ về nó.
- ✅ 2 luồng custom quiz + learning-path progress đã có bảng/cột đủ để build.
- ✅ Generated types phản ánh đúng taxonomy; không còn tên bảng lệch.

---

### Phase 1 — MVP

**Mục tiêu:** Learning loop hoàn chỉnh, có nội dung seed chất lượng, chạy production.

**Công việc chính:**
- [ ] `P1.1` **Auth**: Google OAuth + email; middleware bảo vệ route; RLS policies cho mọi bảng cá nhân (kèm **policy admin SELECT** — xem rủi ro Section 7).
- [ ] `P1.2` **Data model + migrations** (theo schema đã chốt ở Reconcile Gate).
- [ ] `P1.3` **Seed** bộ dữ liệu mẫu chất lượng cao & đầy đủ (câu hỏi, đáp án, quiz, flashcard, learning path) — theo taxonomy `docs/01`.
- [ ] `P1.4` **Ngân hàng câu hỏi**: list + detail, search, filter (chủ đề/level/difficulty), bookmark.
- [ ] `P1.5` **Quiz**: chọn/custom quiz, chấm điểm, giải thích đáp án, lưu kết quả.
- [ ] `P1.6` **Flashcard + SRS**: thuật toán ngắt quãng, "must-know deck", lịch ôn hằng ngày.
- [ ] `P1.7` **Learning Path**: hiển thị lộ trình theo level, đánh dấu hoàn thành từng bước, lưu progress.
- [ ] `P1.8` **Dashboard tiến độ**: streak, activity log, thống kê quiz/flashcard.
- [ ] `P1.9` **Admin CRUD**: giao diện quản trị thêm/sửa/xóa nội dung; kiểm soát quyền admin.
- [ ] `P1.10` **QA & polish MVP**: kiểm thử luồng chính, responsive, dark mode, i18n khung.

**Definition of Done:**
- ✅ User mới đăng ký → có ngay nội dung đầy đủ (không màn hình trống).
- ✅ Hoàn thành trọn loop: đọc câu hỏi → làm quiz → ôn flashcard → thấy tiến độ + streak cập nhật.
- ✅ Custom quiz và learning-path progress **hoạt động thật** (đúng schema đã reconcile).
- ✅ RLS được kiểm chứng: user A không đọc được dữ liệu user B; admin đọc được dữ liệu tổng hợp.
- ✅ Admin thêm 1 câu hỏi mới → hiển thị đúng phía user, không 404.

---

### Phase 2 — Nâng cao (Advanced)

**Mục tiêu:** Bổ sung tính năng khác biệt hóa, tận dụng kiến trúc đã chừa sẵn.

**Công việc chính:**
- [ ] `P2.1` **Coding Challenge**: live code editor, bộ test, chấm tự động, lưu lời giải.
- [ ] `P2.2` **Mock Interview**: mô phỏng phiên phỏng vấn (câu hỏi theo kịch bản, ghi lại phản hồi).
- [ ] `P2.3` **Gamification đầy đủ**: badge, XP, leaderboard, milestone.
- [ ] `P2.4` **Notification/Reminder** cho SRS (nhắc ôn đúng lịch).

**Definition of Done:**
- ✅ Coding challenge chạy trong sandbox an toàn, chấm được ít nhất 1 bộ đề mẫu.
- ✅ Mock interview hoàn thành 1 kịch bản end-to-end.
- ✅ Gamification không phá vỡ data model MVP (chỉ mở rộng, không sửa breaking).

---

### Phase 3 — Polish & Scale

**Mục tiêu:** Trưởng thành hóa sản phẩm về vận hành, hiệu năng, trải nghiệm.

**Công việc chính:**
- [ ] `P3.1` **SEO**: metadata, sitemap, structured data, OG images.
- [ ] `P3.2` **Analytics**: tracking hành vi học tập (privacy-aware).
- [ ] `P3.3` **i18n hoàn chỉnh**: dịch toàn bộ UI, không còn chuỗi hardcode.
- [ ] `P3.4` **PWA + offline**: cài đặt như app, **offline queue** cho SRS.
- [ ] `P3.5` **Tối ưu performance**: caching, code-splitting, Core Web Vitals.

**Definition of Done:**
- ✅ Lighthouse/Core Web Vitals đạt ngưỡng "good" trên trang chính.
- ✅ Dùng offline được các chức năng ôn tập cốt lõi.
- ✅ Không còn chuỗi UI chưa dịch.

---

## 5. Checklist các bước THỦ CÔNG

> ⚠️ Đây là các bước **user phải tự làm** (Claude không thao tác được trên tài khoản GitHub/Google/Supabase/Vercel của bạn). Giữ **đúng thứ tự**. Chi tiết từng bước ở [`docs/06-setup-and-deployment.md`](./06-setup-and-deployment.md).

### A. GitHub
- [ ] Tạo repository mới (private hoặc public).
- [ ] Thêm `.gitignore` (bỏ qua `.env*`, `node_modules`, `.next`).
- [ ] Bật branch protection cho `main` (yêu cầu PR + CI pass).

### B. Supabase
- [ ] Tạo project mới trên [supabase.com](https://supabase.com); chọn region gần bạn.
- [ ] Lưu lại **Project URL** và **anon public key** (Settings → API).
- [ ] Lưu **`service_role` key** vào nơi bí mật (password manager) — **KHÔNG bao giờ commit / KHÔNG dán vào chat**.
- [ ] Cài **Supabase CLI đúng cách** (xem lưu ý kỹ thuật ở Section 7 — tránh các lệnh sai):
  - Windows/scoop: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` → `scoop install supabase`.
  - Hoặc dùng bản binary chính thức / npx theo hướng dẫn `docs/06`. (Không dùng `npm install -g supabase` — không được hỗ trợ.)
- [ ] `supabase login` và `supabase link` tới project.

### C. Google OAuth
- [ ] Tạo project trên Google Cloud Console → OAuth consent screen.
- [ ] Tạo **OAuth 2.0 Client ID** (Web application).
- [ ] Thêm **Authorized redirect URI** trỏ tới Supabase callback (`https://<project-ref>.supabase.co/auth/v1/callback`).
- [ ] Dán **Client ID + Client Secret** vào Supabase → Authentication → Providers → Google.

### D. Vercel
- [ ] Import GitHub repo vào Vercel.
- [ ] Cấu hình **Environment Variables** (mục E) cho cả Production & Preview.
- [ ] Xác nhận CI/CD: PR tạo preview deploy, merge `main` tạo production deploy.
- [ ] Cập nhật **redirect/callback URL production** trong Supabase Auth (thêm domain Vercel).

### E. Environment Variables (`.env.local` + Vercel)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Project URL.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = service_role (**chỉ dùng server-side**, chỉ đặt trong env server/Vercel — không prefix `NEXT_PUBLIC_`).
- [ ] Các biến khác (site URL, provider keys) theo `docs/06`.
- [ ] Tạo `.env.example` (không chứa giá trị thật) để người khác clone biết cần biến gì.

---

## 6. Thông tin Claude cần từ bạn (để tiếp tục)

Để Claude viết được migration, seed, và code kết nối, bạn cung cấp các thông tin **an toàn** sau (dán trực tiếp vào chat OK):

| Cần | Ví dụ | An toàn để dán? |
|-----|-------|-----------------|
| **Supabase Project URL** | `https://abcdxyz.supabase.co` | ✅ An toàn (public) |
| **Supabase anon public key** | `eyJhbGciOi...` (JWT dài, role=anon) | ✅ An toàn (được thiết kế để lộ ra client, đã có RLS bảo vệ) |
| **Vercel production domain** | `fe-interview-prep.vercel.app` | ✅ An toàn |
| **Google OAuth Client ID** | `xxxx.apps.googleusercontent.com` | ✅ An toàn (Client ID là public) |

### 🔴 TUYỆT ĐỐI KHÔNG dán vào chat:
- ❌ **`service_role` key** — key này bypass toàn bộ RLS, tương đương "chìa khóa vạn năng" của database. Nếu lộ, người khác đọc/xóa toàn bộ dữ liệu. Chỉ đặt trong env server (Vercel/`.env.local`).
- ❌ **Google OAuth Client Secret**, database password, bất kỳ private key nào.
- ❌ Nếu lỡ dán → **rotate/regenerate ngay** trong Supabase/Google Console.

> **Quy tắc vàng:** nếu tên biến có `SECRET`, `SERVICE_ROLE`, `PASSWORD`, `PRIVATE` → không bao giờ vào chat, không bao giờ commit, không bao giờ prefix `NEXT_PUBLIC_`.

---

## 7. Rủi ro & Lưu ý (từ reviewer)

> Reviewer đánh giá bộ tài liệu **công phu, chất lượng cao** (taxonomy rộng, features chi tiết, kiến trúc chuẩn senior). Tuy nhiên có các vấn đề phải xử lý — **3 cái đầu là blocker, phải sửa TRƯỚC khi build** (giải quyết trong [Reconcile Gate](#reconcile-gate--cổng-chốt-trước-khi-build)).

### 🔴 Blocker (phải sửa trước khi code)

| # | Rủi ro | Ảnh hưởng | Hành động |
|---|--------|-----------|-----------|
| R1 | **Data Model (Section 4) chưa chạy được 2 MVP must-have**: custom quiz vướng `quiz_id NOT NULL`; learning-path progress **không có bảng**. | Nếu gen types từ Section 4 rồi build, **2 luồng này vỡ**. | `RG.2` — sửa schema: nới `quiz_id` cho quiz ad-hoc + thêm bảng progress. |
| R2 | **Không có single source of truth cho schema**: 3 section mô tả 3 mô hình quiz/flashcard/learning-path khác nhau; **tên bảng lệch** (`flashcards` vs `flashcard_reviews`, `path_steps` vs `learning_path_items`, `quiz_sessions` vs `quiz_attempts`). | Build lệch giữa data-model và features; rủi ro rất cao. | `RG.1` — một buổi reconcile chốt **bảng duy nhất** làm nguồn chân lý, rồi mới gen types. |
| R3 | **Xung đột enum `type`/`difficulty_level` vs taxonomy**: mất phân loại theory/coding/system-design/behavioral; mất tách `level` vs `difficulty`; **thiếu `frequency`**. | Không dựng được "must-know deck", không chọn được câu MVP, không cân được lộ trình đúng thiết kế Section 1. | `RG.3` — sửa enum khớp taxonomy; thêm `frequency`. |

### 🟠 Cần thống nhất trước khi khởi tạo

| # | Rủi ro | Ảnh hưởng | Hành động |
|---|--------|-----------|-----------|
| R4 | **Kiến trúc thư mục mâu thuẫn**: feature-based (Section 3) vs layer-based (Section 5); yêu cầu "tách hooks/helpers/constants/types" bị hiểu khác nhau. | Team code lệch, khó merge, khó bảo trì. | `RG.4` — chốt **một cây thư mục** + định nghĩa rõ từng lớp trước khi Phase 1. |
| R5 | **SRS + streak yếu về vận hành**: thiếu reminder/notification, chưa có cơ chế offline queue, thiếu `activity_log`/`streak` fields — dù UI đã thiết kế. | Value prop khác biệt nhất (SRS + streak) không hoạt động đầy đủ. | `RG.5` — thêm fields + cơ chế; notification/offline lùi Phase 2/3 nhưng **chừa schema từ đầu**. |
| R6 | **RLS thiếu admin-read cho bảng cá nhân**: `service_role`/RLS xử lý tốt, nhưng admin dashboard/analytics **không đọc được** dữ liệu tổng hợp → mâu thuẫn ma trận quyền. | Admin/analytics vỡ. | Thêm **policy admin SELECT** cho các bảng cá nhân, hoặc dùng **view aggregate**. |
| R7 | **`questions.slug` nullable + routing theo slug + id/slug không nhất quán** giữa các section. | Gây **404** và liên kết hỏng khi seed nội dung. | `RG.6` — `slug` NOT NULL + unique; chốt quy ước routing thống nhất. |

### 🟡 Lỗi kỹ thuật DevOps (chặn onboarding người mới — user chưa từng dùng Supabase)

Các lệnh **sai** trong tài liệu DevOps hiện tại cần sửa trong `docs/06` trước khi ai đó làm theo:

| Lệnh sai trong docs | Vấn đề | Đúng phải là |
|---------------------|--------|--------------|
| `supabase db query --stdin` | Không phải lệnh hợp lệ | Dùng `psql` (kết nối connection string) để chạy SQL |
| `scoop bucket add main ...` | Sai bucket cho supabase | `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` |
| `Set-ExecutionPolicy -ExecutionScope ...` | Sai tên tham số | Tham số đúng là `-Scope` (vd `-Scope CurrentUser`) |
| `npm install -g supabase` | Không được hỗ trợ | Dùng scoop/brew/binary chính thức, hoặc `npx supabase` |

### 🟢 Bổ sung taxonomy (không blocker, nên thêm để đầy đủ)

Taxonomy tuy rộng vẫn còn vài mảng nên bổ sung vào `docs/01`:
- [ ] **React 19 / Next 15 features** (Server Components, Actions, `use`, caching mới...).
- [ ] **Forms + React Hook Form (RHF)** + validation.
- [ ] **History API** (routing nền tảng, SPA navigation).
- [ ] **Web Components**.

---

## 8. Ước lượng công sức tương đối theo Phase

> Đơn vị **"bước"/"tuần" tương đối** — dùng để so sánh khối lượng giữa các phase, **không phải cam kết thời gian cứng**. 1 "tuần" ≈ một nhịp làm việc, không phải 40 giờ chính xác.

| Phase | Khối lượng tương đối | Nhịp ước lượng | Ghi chú |
|-------|----------------------|----------------|---------|
| **Phase 0** — Khởi tạo | ▓▓░░░░░░ (nhỏ–vừa) | ~1 tuần | Chủ yếu là thao tác thủ công + dựng khung; ít logic. |
| **Reconcile Gate** | ▓░░░░░░░ (nhỏ nhưng bắt buộc) | ~2–4 bước (nửa–1 buổi tập trung) | Rẻ nếu làm bây giờ; **rất đắt** nếu bỏ qua rồi phải refactor. |
| **Phase 1** — MVP | ▓▓▓▓▓▓▓░ (lớn nhất) | ~4–6 tuần | Phần nặng nhất: auth, schema, seed chất lượng, 6 nhóm tính năng, admin. |
| **Phase 2** — Nâng cao | ▓▓▓▓▓░░░ (lớn) | ~3–4 tuần | Coding editor + mock interview là phức tạp (sandbox, chấm). |
| **Phase 3** — Polish & Scale | ▓▓▓░░░░░ (vừa) | ~2–3 tuần | SEO/analytics/PWA/perf — nhiều việc nhỏ, ít rủi ro kiến trúc. |

**Đường tới hạn (critical path):** `Phase 0` → **`Reconcile Gate`** (không thể bỏ qua) → `Phase 1`. Phần lớn giá trị và rủi ro nằm ở Phase 1; đầu tư nghiêm túc vào Reconcile Gate là cách rẻ nhất để giảm rủi ro toàn dự án.

---

### Phụ lục — Nguyên tắc điều phối
- **Không code nghiệp vụ khi Reconcile Gate chưa PASS.**
- **Schema chốt ở `docs/04` là nguồn chân lý duy nhất**; mọi types phải generate từ đó.
- **Kiến trúc thư mục chốt ở `docs/03`**; PR lệch cấu trúc bị từ chối.
- **Bảo mật là mặc định**: RLS bật cho mọi bảng; `service_role` chỉ ở server; không secret nào vào git/chat.
- Mỗi tính năng chỉ "xong" khi đạt **Definition of Done** của phase tương ứng.
