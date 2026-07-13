-- supabase/seeds/02_admin.sql — cấp quyền admin cho chủ dự án (bootstrap admin ĐẦU TIÊN).
-- Thứ tự: chạy trong SQL Editor SAU khi tài khoản đã ĐĂNG NHẬP lần đầu (để có row trong profiles).
--
-- ⚠️ QUAN TRỌNG: trigger enforce_role_guard chặn MỌI thay đổi role khi chưa có admin nào
-- (kể cả trong SQL Editor, vì auth.uid() = null → is_admin() = false → role bị revert âm thầm).
-- Vì vậy phải TẮT trigger tạm thời cho lần bootstrap admin đầu tiên này.
-- (Sau khi đã có admin, admin có thể đổi role người khác qua app/DB bình thường vì is_admin() = true.)

alter table public.profiles disable trigger trg_enforce_role_guard;

update public.profiles set role = 'admin' where email = 'nhatlenguyen843@gmail.com';

alter table public.profiles enable trigger trg_enforce_role_guard;
