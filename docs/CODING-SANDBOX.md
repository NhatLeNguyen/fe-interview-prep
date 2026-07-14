# Coding Sandbox (Piston) — Hướng dẫn dựng

Tính năng **Luyện code** (`/coding`) chấm code bằng cách chạy trong **Piston** — sandbox mã nguồn mở, cô lập tiến trình. App gọi Piston qua biến env `PISTON_URL`.

> ⚠️ API public của Piston (`emkc.org`) đã chuyển **whitelist-only từ 2026-02-15** → không dùng trực tiếp được nữa. Phải **tự host** (miễn phí).

Kiến trúc đã tách sạch: chỉ [`src/lib/piston.ts`](../src/lib/piston.ts) gọi Piston. Đổi backend không đụng phần còn lại.

---

## 1. Chạy local (dev)

Cần **Docker**.

```bash
# 1. Chạy Piston
docker run -d --name piston -p 2000:2000 ghcr.io/engineer-man/piston

# 2. Cài runtime Node (Piston mới KHÔNG có sẵn runtime nào)
curl -s -X POST http://localhost:2000/api/v2/packages \
  -H 'content-type: application/json' \
  -d '{"language":"node","version":"18.15.0"}'

# 3. Kiểm tra đã cài
curl -s http://localhost:2000/api/v2/runtimes
```

Trong `.env.local`:

```bash
PISTON_URL=http://localhost:2000/api/v2
```

> `PISTON_URL` **phải gồm path `/api/v2`**. App tự chọn runtime `node` (bỏ qua `deno`).

Chạy `npm run dev`, vào `/coding`, chọn 1 bài, viết hàm → **Chạy**/**Nộp**.

---

## 2. Production

Piston cần chạy ở một nơi Vercel gọi tới được. Vài lựa chọn **free tier**:

| Nền tảng | Ghi chú |
|----------|---------|
| **Fly.io** | Deploy image `ghcr.io/engineer-man/piston`, mở port, free tier nhỏ đủ dùng. |
| **Railway / Render** | Deploy container tương tự; có free tier giới hạn. |
| **VPS nhỏ** | Tự chủ, có phí thấp. |

Sau khi có URL (vd `https://piston-xxx.fly.dev`):
1. Cài runtime node (bước 2 ở trên, đổi host).
2. Trên Vercel → **Settings → Environment Variables**: `PISTON_URL=https://piston-xxx.fly.dev/api/v2` → **Redeploy**.

**Bảo mật:** Piston tự cô lập tiến trình + enforce timeout. Nên đặt Piston sau mạng riêng/rate-limit; app đã: yêu cầu đăng nhập để chạy + cooldown client + giới hạn độ dài code.

---

## 3. Cách chấm hoạt động

1. Server action đọc **toàn bộ** test case (kể cả ẩn) bằng service_role.
2. Ghép `code user + harness` (gọi `functionName(...args)`, so sánh sâu với `expected`, in JSON kết quả).
3. Gửi Piston chạy Node → parse kết quả.
4. Trả client: ca **mẫu** kèm chi tiết; ca **ẩn** chỉ đạt/không (giấu nội dung).

Nếu Piston không chạy (chưa dựng / sai `PISTON_URL`), UI hiện lỗi "Không chạy được code lúc này".

---

## 4. Bài mẫu

`supabase/seeds/04_coding.sql` (chạy **sau** `migrations/0007_coding.sql` và `seeds/01_content.sql`) seed 5 bài JS: sum-array, reverse-string, fizzbuzz, unique-array, flatten-array.
