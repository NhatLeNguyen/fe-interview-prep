-- supabase/seeds/02_admin.sql — cấp quyền admin cho chủ dự án.
-- Thứ tự: chạy SAU khi tài khoản admin đã ĐĂNG NHẬP lần đầu (để có row trong profiles).
-- (Chạy trong SQL Editor.)

update public.profiles set role = 'admin' where email = 'nhatlenguyen843@gmail.com';
