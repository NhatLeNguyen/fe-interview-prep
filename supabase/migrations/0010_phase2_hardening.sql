-- 0010_phase2_hardening.sql
-- PHASE 2 — siet quyen ghi cac bang la "KET QUA" (outcome), theo dung chuan da lap o
-- 0006 (vd: revoke update/delete on quiz_attempts from authenticated -> chi server ghi).
--
-- Van de: RLS chi kiem tra "dong nay co phai cua toi khong", KHONG kiem tra
-- "du lieu nay co that khong". Nen moi bang quyet dinh XP/hang/badge/diem deu phai
-- chan client ghi truc tiep; chi server action (service_role) ghi sau khi da xac minh.
-- Chay sau 0000-0009.

-- 1) user_activity: nguon tinh XP + streak.
--    Truoc: authenticated INSERT duoc -> tu bom 1000 dong 'quiz' = +10.000 XP -> hang #1.
revoke insert, update, delete on public.user_activity from authenticated;

-- 2) profiles: cac cot streak la ket qua (badge streak phu thuoc).
--    Van cho user sua ho so binh thuong (full_name, locale, theme, ...).
revoke update (current_streak, longest_streak, last_active_date) on public.profiles from authenticated;

-- 3) user_badges: huy hieu phai do server trao sau khi tinh dieu kien.
--    Truoc: tu insert badge_id bat ky (badges cong khai -> biet id).
revoke insert, update, delete on public.user_badges from authenticated;

-- 4) coding_submissions: 'passed' quyet dinh badge coding + trang thai "Da giai".
--    Truoc: tu insert 1 dong status='passed' ma khong chay code.
revoke insert, update, delete on public.coding_submissions from authenticated;

-- 5) interview_sessions: self_score/status la ket qua (van cho INSERT de tao phien).
revoke update, delete on public.interview_sessions from authenticated;

-- Ghi chu: interview_answers.answer_text/self_rating VAN cho user ghi — do la
-- phan tu danh gia, dung theo thiet ke (diem la tu cham).
