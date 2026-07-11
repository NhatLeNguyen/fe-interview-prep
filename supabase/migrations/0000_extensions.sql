-- 0000_extensions.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

-- 0000_extensions.sql
create extension if not exists pgcrypto;   -- gen_random_uuid()
