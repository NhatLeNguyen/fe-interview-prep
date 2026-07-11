-- seed.sql
-- Chay SAU khi migrations xong VA sau khi tai khoan admin da dang nhap lan dau (de co row trong profiles).
-- Cap quyen admin cho chu du an. Bo sung seed noi dung cau hoi o Phase 1.

update public.profiles set role = 'admin' where email = 'nhatlenguyen843@gmail.com';
