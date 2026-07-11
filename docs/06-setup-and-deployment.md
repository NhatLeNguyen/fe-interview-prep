> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# Hướng dẫn Thiết lập & Triển khai — FE Interview Prep

> Tài liệu này dành cho **Windows + PowerShell**. Mỗi bước gắn nhãn:
> - **[THỦ CÔNG]** — bạn **phải** tự làm (đăng nhập tài khoản GitHub / Google Cloud / Supabase / Vercel — Claude không có quyền truy cập các tài khoản này).
> - **[CLAUDE/CLI]** — Claude hoặc lệnh CLI làm được (Claude **có thể commit/push hộ** sau khi bạn đã cấu hình git credential trên máy).
>
> **Trạng thái hiện tại của máy bạn** (đã kiểm tra): thư mục `d:\FE_Interview` đang **trống**, chưa có git repo. Đã cài sẵn: `git 2.53`, `node v24.14.1`, `npm 11.11.0`. **Chưa cài** GitHub CLI (`gh`) và Supabase CLI — hướng dẫn bên dưới có bước cài.

---

## Mục lục
1. [GitHub — Repo, Git, Branch strategy](#1-github)
2. [Google Cloud OAuth — Đăng nhập Google](#2-google-cloud-oauth)
3. [Supabase — DB, Auth, RLS, Migrations, Seed](#3-supabase)
4. [Vercel — Deploy & CI/CD](#4-vercel)
5. [ENV & Secrets — Quy tắc bảo mật](#5-env--secrets)
6. [✅ CHECKLIST TỔNG các bước THỦ CÔNG (theo đúng thứ tự)](#checklist-tong)
7. [📋 Thông tin USER cần cung cấp lại cho Claude](#thong-tin-cho-claude)

> **Thứ tự triển khai tổng thể (quan trọng):**
> `GitHub → (khởi tạo project Next.js) → Supabase (tạo project, lấy key) → Google OAuth → Nối Google vào Supabase → Vercel (env + deploy) → cập nhật lại Redirect URL ở Supabase & Google bằng domain thật.`
> Có một vòng lặp "con gà–quả trứng" nhỏ: bạn cần URL Supabase để cấu hình Google, và cần domain Vercel để hoàn thiện redirect. Phần 4 và Checklist sẽ nhắc bạn quay lại cập nhật.

---

<a name="1-github"></a>
## 1. GITHUB — Repo, Git, Branch strategy

### 1.1. [THỦ CÔNG] Tạo repository trên github.com

1. Mở https://github.com → đăng nhập → bấm nút **`+`** (góc trên phải) → **New repository**.
2. Điền:
   - **Repository name:** `fe-interview-prep`
   - **Description:** `Nền tảng luyện phỏng vấn Front-end (song ngữ Việt-Anh)`
   - **Visibility:** chọn **Private** (khuyến nghị lúc đầu; có thể chuyển Public sau).
   - **QUAN TRỌNG — KHÔNG tích** "Add a README file", "Add .gitignore", "Choose a license". Để repo trống hoàn toàn, vì ta sẽ push code từ máy lên (tránh xung đột lịch sử git).
3. Bấm **Create repository**.
4. GitHub hiện trang có dòng URL dạng `https://github.com/<username>/fe-interview-prep.git`. **Copy URL này lại** — bước 1.4 cần.

> **Tùy chọn nhanh hơn (nếu muốn dùng GitHub CLI):** cài `gh` bằng lệnh ở 1.5 rồi chạy `gh repo create fe-interview-prep --private --source=. --remote=origin`. Nhưng cách web ở trên là chắc chắn nhất cho người mới.

### 1.2. [CLAUDE/CLI] Khởi tạo project & git ở máy

> Nếu chưa có source Next.js, chạy lệnh sau để scaffold ngay trong thư mục `d:\FE_Interview` (Claude có thể chạy hộ). Bỏ qua nếu bạn đã có code.

```powershell
# Đứng tại d:\FE_Interview (thư mục đang trống)
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm
```

Trả lời prompt: **Turbopack** → tùy thích (Yes cho nhanh). Lệnh này tự tạo cấu trúc Next.js 15 App Router + TypeScript + Tailwind.

Sau đó khởi tạo git (create-next-app thường tự `git init`, nhưng chạy lại cũng không sao):

```powershell
git init
git branch -M main
```

### 1.3. [CLAUDE/CLI] File `.gitignore`

`create-next-app` đã tạo `.gitignore` chuẩn Next.js. **Bổ sung** các dòng sau (Claude sẽ thêm vào cuối file) để chắc chắn **không lộ secrets & file Supabase local**:

```gitignore
# === Env & secrets (TUYỆT ĐỐI KHÔNG COMMIT) ===
.env
.env.local
.env*.local
.env.production

# === Supabase CLI local ===
supabase/.branches
supabase/.temp
supabase/.env

# === Editor / OS ===
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
Thumbs.db
```

> **Lưu ý:** `.env.example` **KHÔNG** nằm trong `.gitignore` — file đó phải được commit (xem Phần 5).

### 1.4. [CLAUDE/CLI] Kết nối remote & push lần đầu

Thay `<username>` bằng username GitHub của bạn:

```powershell
git remote add origin https://github.com/<username>/fe-interview-prep.git
git add .
git commit -m "chore: khởi tạo project Next.js 15 + Tailwind + TypeScript"
git push -u origin main
```

> **Claude có thể push hộ bạn** nếu máy đã lưu git credential. Xem 1.6 để cấu hình một lần. Nếu chưa cấu hình, lần `git push` đầu tiên Windows sẽ bật cửa sổ **Git Credential Manager** yêu cầu đăng nhập GitHub — **[THỦ CÔNG]** bạn đăng nhập một lần, sau đó Claude push được các lần sau.

### 1.5. [THỦ CÔNG — tùy chọn] Cài GitHub CLI (`gh`)

Không bắt buộc, nhưng tiện cho việc tạo PR, branch protection:

```powershell
winget install --id GitHub.cli -e
# Mở PowerShell MỚI để nhận PATH, rồi:
gh auth login
```

### 1.6. [THỦ CÔNG — làm 1 lần] Cấu hình git credential để Claude push hộ

```powershell
git config --global user.name "NhatLeNguyen"
git config --global user.email "nhatlenguyen843@gmail.com"
git config --global credential.helper manager
```

Sau lần `git push` đầu tiên (bạn đăng nhập qua cửa sổ Credential Manager), thông tin được lưu vào **Windows Credential Manager**. Từ đó **Claude/CLI chạy `git push` không cần hỏi mật khẩu nữa**.

> ⚠️ **Ranh giới:** Claude có thể chạy `git commit`/`git push` khi bạn yêu cầu và khi credential đã lưu. Claude **không** đăng nhập tài khoản GitHub thay bạn và **không** tự ý push khi chưa được yêu cầu.

### 1.7. [CLAUDE/CLI] Branch strategy: `main` + `develop`

Mô hình đơn giản, phù hợp solo/nhóm nhỏ:

| Branch | Vai trò | Deploy |
|--------|---------|--------|
| `main` | Code ổn định, đã review. Luôn deployable. | **Production** (Vercel) |
| `develop` | Nhánh tích hợp hằng ngày. | **Preview** (Vercel) |
| `feat/*`, `fix/*`, `chore/*` | Nhánh tính năng, tách từ `develop`. | Preview theo PR |

Tạo `develop`:

```powershell
git checkout -b develop
git push -u origin develop
```

**Quy trình làm việc:**
```powershell
# Bắt đầu tính năng mới
git checkout develop
git pull
git checkout -b feat/question-bank

# ... code ...
git add .
git commit -m "feat(questions): them filter theo chu de va cap do"
git push -u origin feat/question-bank
# -> Mở Pull Request feat/question-bank -> develop trên GitHub
```

### 1.8. [CLAUDE/CLI] Conventional Commits

Format: `type(scope): mô tả ngắn` (mô tả tiếng Việt không dấu để tránh lỗi encoding một số terminal). Các `type` dùng trong dự án:

| Type | Khi nào dùng | Ví dụ |
|------|--------------|-------|
| `feat` | Tính năng mới | `feat(quiz): them cham diem va giai thich dap an` |
| `fix` | Sửa bug | `fix(auth): sua redirect sau khi login Google` |
| `chore` | Cấu hình, deps, không ảnh hưởng logic | `chore: cap nhat dependencies` |
| `docs` | Tài liệu | `docs: them huong dan setup Supabase` |
| `refactor` | Tái cấu trúc, không đổi hành vi | `refactor(hooks): tach useFlashcard ra khoi component` |
| `style` | Format, CSS, không đổi logic | `style: format lai theo prettier` |
| `test` | Thêm/sửa test | `test(helpers): them test cho formatDate` |

### 1.9. [THỦ CÔNG] Bật Branch Protection cơ bản cho `main`

1. Trên GitHub, vào repo → **Settings** → **Branches** (menu trái) → **Add branch ruleset** (hoặc "Add rule" ở giao diện cũ).
2. **Ruleset Name:** `protect-main`. **Enforcement status:** **Active**.
3. **Target branches:** Add target → **Include by pattern** → gõ `main`.
4. Bật các rule (tích chọn):
   - ✅ **Require a pull request before merging** → yêu cầu merge qua PR, không push thẳng.
     - (Tùy chọn) **Require approvals: 1** nếu làm nhóm; solo có thể để 0.
   - ✅ **Require status checks to pass** → chọn check của Vercel sau khi đã kết nối (làm sau Phần 4).
   - ✅ **Block force pushes**.
5. Bấm **Create**.

> Kết quả: `main` không thể bị push thẳng hay force-push, mọi thay đổi vào production phải qua PR.

---

<a name="2-google-cloud-oauth"></a>
## 2. GOOGLE CLOUD OAUTH — Đăng nhập Google

> **Mục tiêu:** tạo **OAuth Client ID + Secret** để Supabase dùng cho nút "Đăng nhập bằng Google".
> **Cần trước:** URL project Supabase (Phần 3.1–3.2). Nếu chưa có, làm Phần 3 tới bước lấy Project URL rồi quay lại đây. Callback URL Supabase có dạng:
> ```
> https://<project-ref>.supabase.co/auth/v1/callback
> ```
> (`<project-ref>` là chuỗi ngẫu nhiên trong Project URL của bạn, ví dụ `abcdefgh1234.supabase.co`).

### 2.1. [THỦ CÔNG] Tạo project trên Google Cloud Console

1. Mở https://console.cloud.google.com → đăng nhập bằng tài khoản Google (`nhatlenguyen843@gmail.com`).
2. Thanh trên cùng, bấm dropdown project (cạnh logo Google Cloud) → **New Project**.
3. **Project name:** `FE Interview Prep` → **Create**. Đợi vài giây, chọn project vừa tạo ở dropdown.

### 2.2. [THỦ CÔNG] Cấu hình OAuth consent screen

1. Menu trái (☰) → **APIs & Services** → **OAuth consent screen**.
2. Nếu hỏi **User Type:** chọn **External** → **Create**.
   *(External = cho phép mọi tài khoản Google đăng nhập; đúng cho app công khai.)*
3. **App information:**
   - **App name:** `FE Interview Prep`
   - **User support email:** chọn email của bạn.
4. **Audience / Developer contact information:** nhập email của bạn → **Save and Continue**.
5. **Scopes:** không cần thêm scope đặc biệt (chỉ cần thông tin cơ bản email/profile) → **Save and Continue**.
6. **Test users:** khi app còn ở chế độ **Testing**, chỉ email trong danh sách này mới đăng nhập được. Bấm **Add Users** → thêm `nhatlenguyen843@gmail.com` và các email bạn muốn test → **Save and Continue**.
7. **Publishing status:** để **Testing** lúc dev cũng được. Khi lên production và muốn ai cũng đăng nhập được, quay lại bấm **Publish App** (Google có thể yêu cầu verify nếu dùng scope nhạy cảm — với email/profile cơ bản thì thường không cần).

### 2.3. [THỦ CÔNG] Tạo OAuth Client ID

1. Menu trái → **APIs & Services** → **Credentials**.
2. Bấm **+ Create Credentials** → **OAuth client ID**.
3. **Application type:** **Web application**.
4. **Name:** `FE Interview Prep Web Client`.
5. **Authorized JavaScript origins** — bấm **Add URI**, thêm:
   - `http://localhost:3000`
   - (Sau khi có domain Vercel) `https://<your-app>.vercel.app` và domain custom nếu có.
6. **Authorized redirect URIs** — bấm **Add URI**, thêm **CHÍNH XÁC** callback của Supabase:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
   > ⚠️ Đây là điểm hay sai nhất. Redirect URI phải trỏ về **Supabase**, KHÔNG phải về localhost/Vercel. Supabase nhận callback từ Google rồi mới chuyển tiếp về app bạn.
7. Bấm **Create**.
8. Popup hiện **Client ID** và **Client secret**. **Copy cả hai và lưu tạm** (Client secret chỉ hiện lúc này; nếu mất có thể tạo lại). 
   - ✅ **Client ID** — an toàn tương đối, sẽ dán vào Supabase.
   - 🔒 **Client secret** — coi như bí mật; **chỉ dán vào Supabase dashboard**, không commit, không gửi vào chat.

> Bạn sẽ dùng **Client ID** & **Client secret** này ở **Phần 3.6** (bật Google provider trong Supabase).

---

<a name="3-supabase"></a>
## 3. SUPABASE — DB, Auth, RLS, Migrations, Seed

> Supabase = Postgres DB + Auth + Storage + auto-generated API, có **Row Level Security (RLS)** để phân quyền theo từng dòng dữ liệu. Đây là "backend" của dự án.

### 3.1. [THỦ CÔNG] Tạo tài khoản & project

1. Mở https://supabase.com → **Start your project** → đăng nhập bằng **GitHub** (tiện, dùng chung tài khoản).
2. Trong Dashboard → **New project**.
3. Điền:
   - **Organization:** chọn hoặc tạo mới (ví dụ tên bạn).
   - **Project name:** `fe-interview-prep`
   - **Database Password:** bấm **Generate a password** → **COPY & LƯU LẠI CẨN THẬN** (đây là mật khẩu Postgres, cần cho `supabase db push`). Coi như secret.
   - **Region:** chọn **Southeast Asia (Singapore)** — gần Việt Nam nhất, độ trễ thấp.
   - **Pricing plan:** **Free** là đủ để bắt đầu.
4. Bấm **Create new project** → đợi ~2 phút để Supabase provision.

### 3.2. [THỦ CÔNG] Lấy Project URL & API keys

1. Vào project → **Settings** (bánh răng, menu trái) → **API**.
2. Copy các giá trị:

| Giá trị | Vị trí | Dùng ở đâu | Bảo mật |
|---------|--------|------------|---------|
| **Project URL** | Mục "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` | ✅ Public, an toàn chia sẻ |
| **anon / public key** | API Keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Public được (RLS bảo vệ dữ liệu) |
| **service_role key** | API Keys → `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` | 🔒🔒 **TUYỆT ĐỐI BÍ MẬT** |

3. Từ Project URL, rút ra **`<project-ref>`** (phần trước `.supabase.co`). **Quay lại Phần 2.3 bước 6** dán callback `https://<project-ref>.supabase.co/auth/v1/callback` vào Google nếu chưa làm.

> 🔎 **Ghi chú tên key mới (2025+):** Dashboard Supabase mới có thể hiển thị thêm **Publishable key** (`sb_publishable_...`) và **Secret key** (`sb_secret_...`) — đây là hệ thống key mới đang dần thay thế. **anon** ↔ tương đương publishable, **service_role** ↔ tương đương secret. Dự án này vẫn dùng tên biến `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` như đã chốt; nếu dashboard chỉ có key mới, dùng key mới với đúng vai trò tương ứng.

### 3.3. [THỦ CÔNG] Cài Supabase CLI

```powershell
# Cách 1 (khuyến nghị trên Windows): Scoop
# 1) Nếu CHƯA có scoop, cài scoop trước:
#    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # cho phép chạy script (nếu bị chặn)
#    irm get.scoop.sh | iex
# 2) Thêm ĐÚNG bucket của Supabase rồi mới cài (supabase KHÔNG nằm trong bucket 'main'):
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Cách 2: dùng npx (không cài global). LƯU Ý: 'npm install -g supabase' KHÔNG được hỗ trợ.
npx supabase --version
```

Kiểm tra:
```powershell
supabase --version   # hoặc: npx supabase --version
```

### 3.4. [CLAUDE/CLI] Khởi tạo Supabase trong project & viết migrations

Claude sẽ tạo cấu trúc migrations. Chạy tại `d:\FE_Interview`:

```powershell
supabase init
```

Lệnh này tạo thư mục `supabase/` (có `config.toml`, `migrations/`, `seed.sql`). **Claude sẽ viết** các file SQL trong `supabase/migrations/` — schema các bảng chính:

- `topics` (chủ đề: JavaScript, React, CSS, TypeScript...)
- `questions` (câu hỏi + đáp án chi tiết, cột song ngữ, `difficulty` junior/mid/senior, `tags`)
- `quizzes`, `quiz_questions` (bộ trắc nghiệm + đáp án đúng + giải thích)
- `flashcards` (thẻ ôn tập)
- `profiles` (hồ sơ user, liên kết `auth.users`)
- `user_progress`, `user_bookmarks`, `flashcard_reviews` (SM-2 spaced repetition: `ease_factor`, `interval`, `next_review_at`)
- `learning_paths`, `path_steps` (lộ trình junior → senior)

Kèm **RLS policies** (nguyên tắc: bảng nội dung như `questions`/`topics` cho **đọc công khai**, ghi chỉ **admin**; bảng cá nhân như `user_progress` chỉ chủ sở hữu đọc/ghi bằng `auth.uid() = user_id`). Kiến trúc để sẵn bảng cho **Coding challenge / Mock interview** (Phase sau) nhưng chưa bật tính năng.

### 3.5. [CLAUDE/CLI hoặc THỦ CÔNG] Chạy migrations

**Cách A — qua Supabase CLI (khuyến nghị, Claude chạy hộ được):**

```powershell
# Đăng nhập CLI (mở trình duyệt xác thực) — [THỦ CÔNG] bước login 1 lần
supabase login

# Link project local với project trên cloud (lấy <project-ref> ở 3.2)
supabase link --project-ref <project-ref>
# -> CLI hỏi Database password: dán mật khẩu Postgres đã lưu ở 3.1

# Đẩy toàn bộ migrations lên Supabase cloud
supabase db push
```

**Cách B — dán SQL thủ công (nếu CLI gặp trục trặc):**
1. Vào Supabase Dashboard → **SQL Editor** → **New query**.
2. Mở lần lượt từng file trong `supabase/migrations/` (Claude đã viết), copy nội dung, dán vào editor → **Run**. Chạy theo đúng thứ tự tên file (timestamp tăng dần).

> ⚠️ `supabase login` phải **[THỦ CÔNG]** một lần (mở browser). Sau đó `supabase link` / `supabase db push` Claude chạy hộ được. Riêng **Database password** không nên dán vào chat — bạn tự nhập khi CLI hỏi, hoặc đặt biến môi trường `SUPABASE_DB_PASSWORD`.

### 3.6. [THỦ CÔNG] Bật Google provider trong Supabase

1. Dashboard → **Authentication** → **Sign In / Providers** (hoặc **Providers**).
2. Tìm **Google** → bật toggle **Enable**.
3. Dán:
   - **Client ID (for OAuth)** ← Client ID từ Phần 2.3.
   - **Client Secret (for OAuth)** ← Client secret từ Phần 2.3.
4. Ở đây Supabase hiển thị lại **Callback URL (for OAuth)** = `https://<project-ref>.supabase.co/auth/v1/callback`. **Đối chiếu** nó khớp chính xác với redirect URI đã khai ở Google (Phần 2.3 bước 6).
5. Bấm **Save**.

### 3.7. [THỦ CÔNG] Cấu hình Site URL & Redirect URLs

1. Dashboard → **Authentication** → **URL Configuration**.
2. **Site URL:** khi dev đặt `http://localhost:3000`. Khi lên production **đổi thành** domain thật (`https://<your-app>.vercel.app` hoặc domain custom).
3. **Redirect URLs** → **Add URL**, thêm tất cả các URL app sẽ nhận redirect sau đăng nhập:
   ```
   http://localhost:3000/**
   https://<your-app>.vercel.app/**
   https://*-<your-team>.vercel.app/**      (cho Preview deployments của mỗi PR)
   https://<custom-domain>/**               (nếu có)
   ```
   *(Dấu `/**` cho phép mọi path con; dòng wildcard preview giúp đăng nhập hoạt động trên các preview URL của PR.)*
4. **Save**.

> 🔁 **Nhắc lại:** sau khi Vercel cấp domain thật (Phần 4), **quay lại** bước này và Phần 2.3 để thêm domain đó vào cả Supabase Redirect URLs lẫn Google Authorized origins/redirect.

### 3.8. [CLAUDE/CLI] Seed dữ liệu mẫu chất lượng cao

Claude viết dữ liệu seed (câu hỏi + đáp án song ngữ Việt-Anh, quiz, flashcard, lộ trình) vào `supabase/seed.sql`. Nạp lên:

```powershell
# Nạp seed vào DB cloud đã link
supabase db push          # nếu seed nằm trong migration
# HOẶC chạy riêng file seed lên remote bằng psql
# (lấy connection string ở Dashboard → Settings → Database → Connection string → URI):
psql "postgresql://postgres:[YOUR-DB-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres" -f supabase\seed.sql
```

Hoặc **[THỦ CÔNG]**: mở **SQL Editor** → dán nội dung `seed.sql` → **Run**.

> Vì user là **người học** (không phải người nhập liệu), bộ seed cần **đầy đủ & chất lượng cao**. Trang **Admin** (bảo vệ bằng RLS + cột `role='admin'` trong `profiles`) để bạn thêm/sửa/cập nhật nội dung dần về sau.

---

<a name="4-vercel"></a>
## 4. VERCEL — Deploy & CI/CD

### 4.1. [THỦ CÔNG] Đăng nhập & Import Project

1. Mở https://vercel.com → **Sign Up / Log in** → chọn **Continue with GitHub** (dùng chung tài khoản, Vercel tự thấy repo).
2. Dashboard → **Add New...** → **Project**.
3. Ở danh sách repo, tìm `fe-interview-prep` → **Import**.
   - Lần đầu Vercel xin quyền truy cập GitHub → **Install** → chọn **All repositories** hoặc chỉ repo này.
4. **Configure Project:**
   - **Framework Preset:** Vercel tự nhận **Next.js** — giữ nguyên.
   - **Root Directory:** `./` (mặc định).
   - **Build/Output settings:** để mặc định.
   - **Environment Variables:** làm ở 4.2 ngay tại đây (hoặc thêm sau).
5. Bấm **Deploy**. (Lần đầu có thể fail nếu thiếu env — không sao, thêm env rồi redeploy.)

### 4.2. [THỦ CÔNG] Thêm Environment Variables

Vào **Project → Settings → Environment Variables**. Thêm **CHÍNH XÁC** các biến sau. Mỗi biến nhớ tích cả 3 môi trường: **Production**, **Preview**, **Development**.

| Name (chính xác) | Value | Môi trường | Ghi chú |
|------------------|-------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (Phần 3.2) | Prod + Preview + Dev | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key (3.2) | Prod + Preview + Dev | Public được |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (3.2) | Prod + Preview + Dev | 🔒 **Secret** — chỉ dùng ở server (Route Handler / Server Action), **không** prefix `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` (Prod), `http://localhost:3000` (Dev) | theo môi trường | Dùng làm `redirectTo` khi gọi OAuth, tránh redirect sai |

> ⚠️ **Nguyên tắc vàng:** biến có tiền tố `NEXT_PUBLIC_` **bị nhúng vào bundle client** → ai cũng đọc được → **chỉ đặt thứ được phép công khai**. `SUPABASE_SERVICE_ROLE_KEY` **KHÔNG** có tiền tố đó → chỉ tồn tại phía server.

Sau khi thêm env → tab **Deployments** → deployment mới nhất → **Redeploy**.

### 4.3. Hiểu về CI/CD tự động (không cần cấu hình thêm)

Vercel gắn sẵn với GitHub, hoạt động ngay:

| Sự kiện Git | Vercel làm gì |
|-------------|---------------|
| `git push` vào **`main`** | Build & deploy lên **Production** (domain chính). |
| `git push` vào **`develop`** / nhánh khác | Tạo **Preview Deployment** (URL riêng). |
| Mở **Pull Request** | Vercel comment vào PR một **Preview URL** để review trực tiếp trước khi merge. |

> Đây chính là lý do Phần 3.7 cần thêm wildcard `https://*-<your-team>.vercel.app/**` vào Supabase Redirect URLs — để đăng nhập chạy được cả trên preview.

### 4.4. [THỦ CÔNG] Nối status check của Vercel vào branch protection

Quay lại **GitHub → Settings → Branches → ruleset `protect-main`** (Phần 1.9) → bật **Require status checks to pass** → tìm và chọn check **`Vercel`** (xuất hiện sau lần deploy đầu). Kết quả: PR nào build Vercel fail thì không merge được vào `main`.

### 4.5. [THỦ CÔNG — tùy chọn] Custom domain

1. **Project → Settings → Domains** → **Add** → nhập domain (ví dụ `feinterview.dev`).
2. Vercel hiện các record DNS (A / CNAME) → **[THỦ CÔNG]** vào nhà cung cấp domain thêm record đó → đợi verify.

### 4.6. [THỦ CÔNG] 🔁 Cập nhật lại Redirect URL sau khi có domain thật

Sau khi biết domain Production (Vercel hoặc custom), **quay lại cập nhật**:
- **Supabase → Auth → URL Configuration:** đặt **Site URL** = domain thật; thêm domain vào **Redirect URLs**.
- **Google Cloud → Credentials → OAuth Client:** thêm domain vào **Authorized JavaScript origins**.
- **Vercel → Env:** đặt `NEXT_PUBLIC_SITE_URL` (Production) = domain thật → Redeploy.

---

<a name="5-env--secrets"></a>
## 5. ENV & SECRETS — Quy tắc bảo mật

### 5.1. [CLAUDE/CLI] `.env.example` — **CÓ commit**

File mẫu (không chứa giá trị thật), commit vào repo để người khác biết cần biến gì:

```dotenv
# .env.example — mau bien moi truong. KHONG chua gia tri that. CO commit.

# --- Supabase (public) ---
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# --- Supabase (server only - BI MAT) ---
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# --- App ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5.2. [THỦ CÔNG] `.env.local` — **KHÔNG commit**

Ở máy, tạo file thật (đã nằm trong `.gitignore`):

```powershell
Copy-Item .env.example .env.local
notepad .env.local   # dan gia tri THAT lay tu Supabase (Phan 3.2)
```

Điền giá trị thật vào `.env.local`. **File này không bao giờ lên git.**

### 5.3. Bảng phân loại độ bí mật

| Biến | Public? | Được commit `.env.example`? | Được dán vào chat với Claude? |
|------|---------|-----------------------------|-------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Có | placeholder | ✅ An toàn |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Có (RLS bảo vệ) | placeholder | ✅ An toàn |
| `NEXT_PUBLIC_SITE_URL` | ✅ Có | placeholder | ✅ An toàn |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **KHÔNG** | **KHÔNG** (chỉ placeholder) | ❌ **TUYỆT ĐỐI KHÔNG** |
| Database password (Postgres) | ❌ | ❌ | ❌ **KHÔNG** |
| Google **Client Secret** | ❌ | ❌ | ❌ **KHÔNG** |

### 5.4. Quy tắc bảo mật (đọc kỹ)

1. **`service_role` key bỏ qua toàn bộ RLS** — ai có nó thao túng được cả DB. Chỉ đặt trong **Vercel Env** và `.env.local`, **chỉ gọi ở code server**. Không commit, không log, không gửi cho ai, **không dán vào chat**.
2. **`anon` key public là bình thường** — nó luôn lộ trong client bundle; an toàn của dữ liệu do **RLS** đảm bảo. Vì vậy **RLS phải luôn bật** trên mọi bảng.
3. Nếu **lỡ commit/lộ** service_role key: vào **Supabase → Settings → API → Rotate/Reset** ngay, cập nhật lại Vercel + `.env.local`.
4. Không đặt secret vào biến `NEXT_PUBLIC_*`.
5. `.env.example` chỉ chứa **placeholder**, không bao giờ giá trị thật.

---

<a name="checklist-tong"></a>
## 6. ✅ CHECKLIST TỔNG — các bước THỦ CÔNG (theo đúng thứ tự thực hiện)

> Chỉ liệt kê bước **[THỦ CÔNG]** bạn phải tự làm. Các bước [CLAUDE/CLI] xen giữa để Claude lo.

**A. GitHub**
- [ ] 1. Tạo repo `fe-interview-prep` (Private, **không** thêm README/gitignore/license) trên github.com. *(1.1)*
- [ ] 2. Đăng nhập Git Credential Manager ở lần `git push` đầu (một lần). *(1.6)*
- [ ] 3. (Tùy chọn) Cài `gh` CLI + `gh auth login`. *(1.5)*
- [ ] 4. Bật **Branch protection** ruleset `protect-main`. *(1.9)*

**B. Supabase (tạo trước để có URL cho Google)**
- [ ] 5. Tạo tài khoản Supabase (login bằng GitHub) + **New project** `fe-interview-prep`, region **Singapore**. *(3.1)*
- [ ] 6. **Lưu Database Password** khi tạo project. *(3.1)*
- [ ] 7. Lấy **Project URL**, **anon key**, **service_role key** (Settings → API). *(3.2)*
- [ ] 8. Cài **Supabase CLI** (scoop hoặc npx). *(3.3)*
- [ ] 9. `supabase login` (mở browser, một lần). *(3.5)*

**C. Google Cloud OAuth**
- [ ] 10. Tạo project Google Cloud `FE Interview Prep`. *(2.1)*
- [ ] 11. Cấu hình **OAuth consent screen** (External, thêm test users). *(2.2)*
- [ ] 12. Tạo **OAuth Client ID** (Web); thêm Authorized redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`. *(2.3)*
- [ ] 13. **Lưu Client ID + Client Secret**. *(2.3)*

**D. Nối Google vào Supabase**
- [ ] 14. Supabase → Authentication → Providers → **bật Google**, dán Client ID + Secret. *(3.6)*
- [ ] 15. Supabase → Authentication → **URL Configuration**: Site URL + Redirect URLs (localhost trước). *(3.7)*
- [ ] 16. (Nếu CLI trục trặc) Dán migrations + seed thủ công qua **SQL Editor**. *(3.5B / 3.8)*

**E. Vercel**
- [ ] 17. Đăng nhập Vercel bằng GitHub → **Import** repo `fe-interview-prep`. *(4.1)*
- [ ] 18. Thêm **Environment Variables** (4 biến × Prod/Preview/Dev). *(4.2)*
- [ ] 19. Redeploy sau khi thêm env. *(4.2)*
- [ ] 20. Nối **status check Vercel** vào branch protection `main`. *(4.4)*
- [ ] 21. (Tùy chọn) Thêm **custom domain** + DNS. *(4.5)*

**F. Vòng cập nhật cuối (sau khi có domain thật)**
- [ ] 22. Supabase URL Configuration: đổi **Site URL** + thêm domain thật + wildcard preview. *(4.6 / 3.7)*
- [ ] 23. Google Credentials: thêm domain thật vào Authorized origins. *(4.6)*
- [ ] 24. Vercel: đặt `NEXT_PUBLIC_SITE_URL` (Prod) = domain thật → Redeploy. *(4.6)*

**G. Secrets ở máy**
- [ ] 25. Tạo `.env.local` từ `.env.example`, điền giá trị thật (không commit). *(5.2)*

---

<a name="thong-tin-cho-claude"></a>
## 7. 📋 THÔNG TIN USER CẦN CUNG CẤP LẠI CHO CLAUDE

Sau khi làm các bước trên, gửi lại cho Claude những thông tin **AN TOÀN** sau để Claude viết code cấu hình client, migrations, seed:

**✅ An toàn để dán vào chat:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon/public key)
- `<project-ref>` (rút từ Project URL)
- Username GitHub + tên repo (để viết đúng lệnh remote)
- Domain Vercel sau khi deploy (`https://<your-app>.vercel.app`)

**🔒 TUYỆT ĐỐI KHÔNG dán vào chat** — tự đặt trực tiếp trong **Vercel Env** và **`.env.local`**:
- `SUPABASE_SERVICE_ROLE_KEY` (service_role key)
- **Database password** của Postgres
- **Google Client Secret**

> Với các secret trên: khi Claude/CLI cần (ví dụ `supabase link` hỏi DB password), **bạn tự nhập vào terminal**, hoặc đặt qua biến môi trường phiên (`$env:SUPABASE_DB_PASSWORD = "..."`) — không viết ra trong đoạn chat.

---

### Ghi chú môi trường đã kiểm tra trên máy bạn
- Thư mục `d:\FE_Interview` đang **trống** → chạy `create-next-app` (1.2) trước khi commit.
- Đã có: `git 2.53`, `node v24.14.1`, `npm 11.11.0`.
- **Chưa** có `gh` (GitHub CLI) và Supabase CLI → xem bước cài 1.5 và 3.3.
- Các MCP connector (Gmail/Google Calendar/Drive) chưa được ủy quyền trong phiên này — **không liên quan** tới việc setup dự án, có thể bỏ qua.