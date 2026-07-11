# Ghi chú Phản biện & Rủi ro (Review Notes)

> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

Tài liệu này tổng hợp kết quả bước phản biện độc lập (adversarial review) trên toàn bộ bản kế hoạch — dùng để theo dõi các điểm cần lưu ý khi triển khai.

## Đánh giá tổng quan
Bộ tài liệu rất công phu và nhìn chung chất lượng cao (taxonomy rộng, features chi tiết, kiến trúc chuẩn senior). Tuy nhiên có 3 lỗ hổng nghiêm trọng cần sửa TRƯỚC khi build: (1) Data Model (Section 4) chưa đủ để chạy 2 tính năng MVP must-have — custom quiz và learning-path progress; (2) Ba section mô tả 3 mô hình dữ liệu khác nhau cho quiz/flashcard/learning-path và tên bảng lệch nhau (flashcards vs flashcard_reviews, path_steps vs learning_path_items, quiz_sessions vs quiz_attempts) — chưa có single source of truth; (3) enum `type` và `difficulty_level` trong DB mâu thuẫn với taxonomy (mất phân loại theory/coding/behavioral và mất tách level vs difficulty, thiếu hẳn frequency). Taxonomy tuy rộng vẫn còn vài mảng nên bổ sung (React 19/Next 15 features, Forms/RHF, History API, Web Components). Cần một buổi reconcile schema + chốt kiến trúc thư mục trước khi code.

## Bổ sung cho Taxonomy (đã tích hợp vào 01-knowledge-taxonomy.md)
1. JavaScript Core thiếu: JSON serialization (JSON.parse/stringify, replacer/reviver, mất undefined/function, circular reference), Regular Expressions, strict mode ('use strict'), Date/Intl/timezone handling
2. React thiếu Portals (createPortal cho modal/tooltip) VA cac React 19 features cot loi cua stack: use() hook, Server Actions hooks (useActionState, useOptimistic, useFormStatus), ref-as-prop, form actions — dang la Next 15/React 19 nen bat buoc co
3. Next.js thiếu: Parallel Routes & Intercepting Routes (@slot, (.)folder), generateStaticParams, draft/preview mode, next/dynamic — day la phan 'advanced' cua App Router
4. DOM & Browser thiếu: History API & client-side routing (pushState, SPA navigation), Web Components/Custom Elements/Shadow DOM, 'what happens when you type a URL' (end-to-end DNS->TLS->HTTP->render — cau hoi kinh dien FE)
5. Forms như một chủ đề độc lập: react-hook-form + zod, controlled vs uncontrolled form, async/schema validation, field array — hien nam rai rac du RHF+zod nam trong stack (Section 5)
6. State Management thiếu: URL/searchParams as state (rat quan trong voi RSC/App Router), form state
7. Network & Security thiếu topic riêng cho Cookie security attributes (HttpOnly/Secure/SameSite) và rate limiting/retry/idempotency phia client
8. i18n/localization như một topic (app song ngu nhung taxonomy khong day localization: Intl format, pluralization, RTL, locale routing)
9. DSA thiếu LRU Cache implementation (rat hay hoi FE) va stack/queue/linked-list co ban; nen bo sung vao fe-specific-algos
10. PWA / Service Worker / offline-first như topic (lien quan nguyen tac P4 'offline-tolerant' nhung khong co topic day du)
11. Testing thiếu: accessibility testing (jest-axe), component/visual regression, Storybook
12. TypeScript nên thêm runtime validation với zod ở biên (đã dùng trong env/form) như một điểm kiến thức riêng

## Thiếu sót về Tính năng cần lưu ý
1. SRS reminder/notification bi thieu hoan toan: value prop cua spaced repetition phu thuoc user quay lai dung han, Settings co tab 'Notifications' nhung khong dinh nghia he thong nhac (email/push/cron job) cho 'the den han' — thieu ca co che lan data model
2. Custom quiz ('Tao quiz nhanh') thieu quiz_sessions de luu config + danh sach question_ids da chon (phuc vu reproducible/resume/cham diem server) — flow §4 mo ta nhung khong co bang
3. 'Danh dau da hieu' per-question khong co noi luu: chi co user_topic_progress dang aggregate (questions_studied count), khong co bang trang thai tung (user, question)
4. Streak & activity heatmap thieu nguon du lieu: mo ta luu last_active_date/current_streak/longest_streak va bang activity_log (§6) nhung khong bang/cot nao ton tai trong schema
5. Search: AC noi full-text tren title+body+TAGS va group ket qua theo Question/Topic/Path, nhung tsvector chi index question+answer — tags, topics, learning_paths khong nam trong FTS
6. Offline queue cho review (P4 + AC flashcard) chi noi 'queue local, sync' ma khong co co che ky thuat (IndexedDB/Service Worker) hay bang dong bo
7. Soft delete: Admin AC yeu cau giu deleted_at nhung khong bang nao co cot deleted_at
8. Auth thieu: resend verification email, rate-limit chong brute-force, password strength policy
9. Per-option explanation cho quiz: cau mau (Section 1 Mau 3) va quiz review the hien giai thich tung dap an, nhung options jsonb chi co {key,text_vi,text_en} — khong co field explanation
10. Content versioning/isDeprecated: taxonomy tach QuestionContent de versioning va co isDeprecated, nhung feature+schema khong ho tro lich su/deprecate noi dung
11. 'Cau hoi lien quan' (relatedQuestionIds trong taxonomy): feature+UI co nhung schema khong luu quan he (chi goi y computed theo topic/tag — can lam ro)
12. Bookmark note: schema bookmarks co cot note nhung feature Bookmarks khong nhac chuc nang ghi chu (mismatch feature vs schema)

## Vấn đề về Data Model / RLS
1. NGHIEM TRONG - Learning path progress khong co data model: Section 4 chi co learning_paths + learning_path_items (flat, polymorphic), THIEU hoan toan user_path_progress/step completion, thieu tang module va pass_threshold per step. Tinh nang MVP must-have 'theo doi tien do lo trinh + unlock tuan tu + resume' khong the build
2. NGHIEM TRONG - quiz_attempts.quiz_id la NOT NULL references quizzes, nhung custom quiz ('Tao quiz nhanh') khong co row trong quizzes -> khong the tao attempt cho quiz tu tao. Can quiz_sessions rieng hoac quiz_id nullable + cot config jsonb
3. enum question_type (single_choice/multiple_choice/true_false/open_ended) la ANSWER FORMAT, khac hoan toan taxonomy QuestionType (theory/coding/quiz/system-design/behavioral) la KIND. Schema khong luu duoc kind -> khong filter/serve duoc coding/behavioral/system-design/theory; can tach 2 truong (format + kind)
4. difficulty_level enum gop 'level' (junior/mid/senior = tham nien) vao ten 'difficulty'; taxonomy yeu cau TACH level (seniority) va difficulty (1-5 do kho thuan). Schema chi co 1 truong -> mat difficulty so, estimatedTimeSec, subtopic
5. frequency (1-5) — truong cot loi cua taxonomy de build deck 'must-know' va chon cau MVP (frequency>=4) — bi THIEU hoan toan trong bang questions
6. flashcard_reviews THIEU cot state (new/learning/review/relearning) ma thuat toan §3.3 set va flashcard stats (new/learning/mastered) can; cung khong the gioi han 'new cards/ngay' (default interval_days=0, due_date=current_date khien moi card moi 'den han ngay' -> flood queue)
7. Thieu cac bang: activity_log (nguon streak/heatmap/dashboard), review_logs (immutable SRS log), user_badges, va cot streak (last_active_date/current_streak/longest_streak) tren profiles
8. questions.slug la NULLABLE nhung route dung slug (/questions/[questionSlug]) + unique -> cau khong co slug thi khong co trang chi tiet; khong nhat quan id vs slug
9. RLS: chi flashcard_reviews co policy admin_read; cac bang ca nhan khac (quiz_attempts, quiz_attempt_answers, bookmarks, user_topic_progress) chi co owner_all -> admin KHONG doc duoc de thong ke, mau thuan ma tran quyen 'admin doc (thong ke)' va admin dashboard aggregate
10. options jsonb thieu field giai thich per option (optionExplanations trong taxonomy); correct_keys khong duoc rang buoc la tap con cua option keys
11. Thieu per-question progress table va cac cot taxonomy: companies, source, subtopic, relatedQuestionIds, estimatedTimeSec

## Điểm chưa nhất quán giữa các tài liệu
1. Ten bang flashcard lech 3 section: Section 4 = 'flashcard_reviews'; Section 3 dung Tables<'flashcards'> (bang KHONG ton tai -> se loi compile khi gen types); Section 6 liet ke CA 'flashcards' LAN 'flashcard_reviews' nhu 2 bang. Chot 1 ten duy nhat
2. Mo hinh learning path khac nhau: Section 2 (learning_paths->path_modules->path_steps + user_path_progress) vs Section 4 (learning_paths->learning_path_items, khong progress) vs Section 6 (path_steps). 3 mo hinh, phai chot 1
3. Mo hinh quiz khac nhau: Section 2 dung quiz_sessions + quiz_attempts(answers jsonb); Section 4 dung quizzes + quiz_attempts + quiz_attempt_answers (normalized, khong quiz_sessions)
4. Ten bang ca nhan lech: user_topic_progress (S4) vs user_progress (S6); bookmarks (S4) vs user_bookmarks (S6); flashcard_reviews (S4) vs user_flashcards (S2 §3.2)
5. SRS field names lech: interval_days + due_date (S4) vs interval + next_review_at (S6) vs intervalDays (S3 helper). Chot ten cot
6. Routes khong nhat quan: /paths (S2) vs /learning-path (S3) vs khong co (S5); /review cho SRS due queue (S2) vs khong co, gop vao /flashcards (S3,S5); /quiz/session/[sessionId]+/quiz/result/[attemptId] (S2) vs /quiz/[quizId] (S3) vs /quiz/[id]+/quiz/[id]/result (S5); /topics co (S2) vs khong (S3,S5); [questionSlug] (S2) vs [id] (S5)
7. Kien truc thu muc MAU THUAN nen tang: Section 3 feature-based (src/features/<domain> + services/) vs Section 5 layer-based (components/domain, lib/helpers, KHONG co features/, KHONG co services/). Phai chot 1 truoc khi code
8. Vi tri + ten file SM-2 helper lech 3 cho: src/helpers/spaced-repetition.ts (S3, kebab) vs src/helpers/spacedRepetition.ts (S4, camelCase) vs lib/helpers/srs.ts (S5). Quy uoc S3 la kebab-case nhung S4 dung camelCase nhieu file
9. Ten hook flashcard lech: useFlashcardReview (S3) / useFlashcardSession (S4) / useFlashcardSRS (S5)
10. BUG + mau thuan thuat toan SM-2: pseudocode Section 2 §3.3 tinh ease_factor UNCONDITIONALLY (du comment ghi 'chi khi grade>=3') -> Again (grade 0) tut ease ~0.8 moi lan; con helper Section 3 early-return giu nguyen ease khi grade<3. Hai spec cho ket qua khac nhau
11. Field 'type' cua question: taxonomy (theory/coding/quiz/system-design/behavioral) vs schema (single_choice/multiple_choice/true_false/open_ended) — hai he phan loai hoan toan khac
12. Search AC (title+body+tags, group Question/Topic/Path) vs tsvector thuc te (chi question_vi+answer_vi) — pham vi index khong khop
13. Supabase CLI install lech: Section 4 §7.1 dung 'npm install -g supabase' (Supabase KHONG ho tro cai global qua npm) trong khi Section 6 noi ro npm -g khong duoc

## Rủi ro lớn nhất & lưu ý
1. Data Model (Section 4) chua the chay 2 tinh nang MVP must-have: custom quiz (quiz_id NOT NULL) va learning-path progress (khong co bang). Neu build code theo generated types tu Section 4, hai luong nay se vo — phai sua schema TRUOC
2. Khong co single source of truth cho schema: 3 section mo ta 3 mo hinh quiz/flashcard/learning-path + ten bang lech. Rui ro cao build lech giua data-model va features. Can 1 buoi reconcile chot bang duy nhat lam nguon chan ly, roi moi gen types
3. Xung dot enum type/difficulty vs taxonomy: mat kha nang phan loai theory/coding/system-design/behavioral va mat tach level/difficulty + thieu frequency -> khong build duoc 'must-know deck', chon cau MVP, va can bang lo trinh dung nhu Section 1 thiet ke
4. Kien truc thu muc mau thuan (feature-based Section 3 vs layer-based Section 5): yeu cau chot bach 'tach hooks/helpers/constants/types' de bi hieu khac nhau -> team code lech. Phai thong nhat 1 cay thu muc truoc khi khoi tao
5. Spaced repetition thieu reminder/notification + offline queue chua co co che ky thuat + thieu activity_log/streak fields -> value prop khac biet nhat cua san pham (SRS + streak) bi yeu ve mat van hanh du UI da thiet ke
6. Bao mat: service_role/RLS xu ly tot, nhung RLS admin-read thieu cho cac bang ca nhan -> admin dashboard/analytics khong doc duoc, mau thuan ma tran quyen. Can them policy admin SELECT hoac dung view aggregate
7. Vai loi ky thuat nho trong DevOps co the chan onboarding nguoi moi (user chua tung dung Supabase): 'supabase db query --stdin' khong phai lenh hop le (nen dung psql), 'scoop bucket add main' sai bucket cho supabase (can supabase bucket), 'Set-ExecutionPolicy -ExecutionScope' sai param (la -Scope), 'npm install -g supabase' khong duoc ho tro
8. questions.slug nullable + routing theo slug + khong nhat quan id/slug giua cac section co the gay 404 va lien ket hong khi seed noi dung
