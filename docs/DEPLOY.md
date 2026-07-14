# Deploy lên Vercel — Runbook

Hướng dẫn deploy **production** thực tế cho FE Interview Prep. Áp dụng cho lần deploy đầu và các lần sau.

> Nền tảng: **Vercel Hobby** (free) + **Supabase Free**. Không cần thẻ tín dụng.

---

## ⚠️ Đọc trước

App validate biến môi trường bằng Zod **ngay lúc build** (`src/config/env.ts`). Nếu thiếu `NEXT_PUBLIC_SUPABASE_URL` hoặc `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **build trên Vercel FAIL**. Vì vậy phải nhập env **trước khi bấm Deploy**.

`.env.local` bị `.gitignore` → không lên GitHub → phải nhập tay trong dashboard Vercel.

---

## Bước 0 — Push code lên GitHub

Vercel deploy từ GitHub, nên mọi thay đổi phải được commit + push trước:

```bash
git add -A
git commit
git push origin main
```

---

## Bước 1 — Tạo tài khoản Vercel

1. Vào **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Cho phép Vercel truy cập repo `fe-interview-prep` (có thể giới hạn chỉ repo này).

## Bước 2 — Import project

1. Dashboard → **Add New… → Project**.
2. Chọn repo `fe-interview-prep` → **Import**.
3. Vercel tự nhận **Framework: Next.js** — giữ nguyên toàn bộ (Build Command, Output Directory, Root Directory `./`).

## Bước 3 — Nhập Environment Variables

Ở màn hình Import, mở **Environment Variables** và thêm **4 biến** (copy value y hệt từ `.env.local` để tránh sai):

| Name | Value | Bí mật? |
|------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Không |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | key `sb_publishable_...` | Không (RLS bảo vệ) |
| `SUPABASE_SERVICE_ROLE_KEY` | key `sb_secret_...` | 🔴 **CÓ** — KHÔNG prefix `NEXT_PUBLIC_`, KHÔNG commit |
| `NEXT_PUBLIC_SITE_URL` | *(để trống, điền ở Bước 5)* | Không |

Mỗi biến để mặc định áp dụng cho cả **Production / Preview / Development**.

> `SUPABASE_SERVICE_ROLE_KEY` dùng cho chấm điểm quiz phía server. Vì không có `NEXT_PUBLIC_` nên không bao giờ lộ ra client — đúng thiết kế.

## Bước 4 — Deploy

Bấm **Deploy** → chờ ~1–2 phút → nhận URL dạng `https://fe-interview-prep-xxxx.vercel.app`.

## Bước 5 — Cấu hình URL (bắt buộc cho đăng nhập)

Link xác nhận email dùng `NEXT_PUBLIC_SITE_URL` (`src/features/auth/actions.ts`), và Supabase chặn redirect lạ:

**5a. Vercel** → Project → **Settings → Environment Variables**:
- Sửa `NEXT_PUBLIC_SITE_URL` = URL production (vd `https://fe-interview-prep-xxxx.vercel.app`) → **Save**.
- Vào **Deployments → … → Redeploy** để biến mới có hiệu lực.

**5b. Supabase** → **Authentication → URL Configuration**:
- **Site URL** = `https://fe-interview-prep-xxxx.vercel.app`
- **Redirect URLs** → thêm `https://fe-interview-prep-xxxx.vercel.app/auth/callback`
  (giữ lại `http://localhost:3000/**` cho dev)

## Bước 6 — Kiểm tra production

1. Mở URL Vercel → **đăng ký** tài khoản mới → **đăng nhập**.
2. Chạy vòng lặp: xem câu hỏi → làm quiz → ôn flashcard → Dashboard/streak → Lộ trình.
3. Thử trên **điện thoại** (nav hamburger).

---

## Lưu ý

- **Database:** production dùng chung Supabase project đã chạy migration + seed (câu hỏi, quiz, flashcard, lộ trình). Không cần setup DB riêng.
- **Auto CI/CD:** mỗi `git push origin main` → Vercel tự build + deploy. Mỗi PR → có **Preview deployment** riêng.
- **Admin:** tài khoản `nhatlenguyen843@gmail.com` đã là admin trong DB → đăng nhập prod là vào được `/admin`.
- **Google OAuth (làm sau):** bật provider trong Supabase + thêm redirect URI, không phải sửa code.

## Sự cố thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|-------------|-------------|----------|
| Build fail: `Thiếu NEXT_PUBLIC_SUPABASE_URL` | Chưa nhập env trước khi deploy | Thêm env (Bước 3) → Redeploy |
| Đăng ký xong, link email trỏ về `localhost` | `NEXT_PUBLIC_SITE_URL` chưa set hoặc chưa redeploy | Bước 5a |
| `redirect_uri ... not allowed` | Supabase chưa whitelist domain | Bước 5b |
| Nộp quiz lỗi/không chấm | Thiếu `SUPABASE_SERVICE_ROLE_KEY` | Thêm env → Redeploy |
