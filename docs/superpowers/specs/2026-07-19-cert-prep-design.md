# Ôn thi chứng chỉ (AWS CLF/SAA + PMP) — Design Spec

**Ngày:** 2026-07-19 · **Trạng thái:** Approved (design). Nhẹ, tái dùng tối đa engine sẵn có.

Bổ sung nội dung tự học + câu ôn tập cho **AWS Cloud Practitioner (CLF-C02)**, **AWS Solutions Architect Associate (SAA-C03)**, **PMP**. Tái dùng quiz + flashcard. Tách bạch khỏi nội dung FE Interview bằng trục **track**.

Nguồn chân lý kiến trúc: [`docs/09`](../../09-RECONCILED-ARCHITECTURE.md). Schema mở rộng, không phá vỡ.

---

## 1. Phạm vi

### Trong
- Bảng `tracks` + `categories.track_id` (backfill FE về track `fe-interview`).
- Nội dung 3 track cert (theory = nội dung học, quiz = câu ôn tập), ~80+ câu/cert.
- Section `/certs` (landing) → `/certs/[trackSlug]` (domain → topic) → `/certs/[trackSlug]/[topicSlug]` (học + quiz + flashcard).
- FE flows (ngân hàng câu hỏi, custom quiz + danh sách danh mục) **lọc mặc định track `fe-interview`** để cert không lọt vào phần FE.

### Ngoài (không làm)
- Mock exam tính giờ, learning-path riêng cho cert, admin UI cho cert, phủ đề 100%.

### Quyết định đã chốt
- Mô hình track (bảng tracks + track_id) · ~80+ câu/cert · reuse quiz+flashcard · không mock exam.

---

## 2. Mô hình dữ liệu (migration `0011_tracks.sql`)

```sql
create table public.tracks (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  kind        text not null check (kind in ('interview','certification')),
  sort_order  int  not null default 0,
  is_published boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Thêm track cho categories. Nullable -> backfill -> NOT NULL (trong cùng migration).
alter table public.categories add column track_id uuid references public.tracks(id) on delete restrict;

insert into public.tracks (slug, name, description, kind, sort_order) values
  ('fe-interview','Phỏng vấn Front-end','Ngân hàng câu hỏi phỏng vấn FE junior→senior.','interview',0),
  ('aws-clf','AWS Cloud Practitioner','Ôn thi AWS Certified Cloud Practitioner (CLF-C02).','certification',10),
  ('aws-saa','AWS Solutions Architect Associate','Ôn thi AWS SAA-C03.','certification',11),
  ('pmp','PMP','Ôn thi Project Management Professional (PMBOK/ECO).','certification',12);

update public.categories set track_id = (select id from public.tracks where slug='fe-interview')
  where track_id is null;
alter table public.categories alter column track_id set not null;

alter table public.tracks enable row level security;
create policy "tracks_public_read" on public.tracks
  for select to public using ( is_published = true or (select public.is_admin()) );
create policy "tracks_admin_write" on public.tracks
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
```

Phân cấp: **track → category (domain) → topic (phần) → question**. Không đổi bảng topics/questions (kế thừa track qua category).

**Cấp độ:** cột `questions.level` NOT NULL → cert đặt nominal (clf→junior, saa→mid, pmp→senior). UI cert hiển thị **độ khó (1–5) + domain**, không dùng LevelBadge.

---

## 3. Tách nội dung cert khỏi FE

`categories` giờ thuộc 1 track → filter theo track ở 3 chỗ FE (mặc định `fe-interview`):

1. **`questionsApi.list`**: thêm `trackSlug?` → join `topics.categories.tracks.slug`. Trang `/questions` truyền `fe-interview`.
2. **`questionsApi.listCategories`**: thêm `trackSlug?` (mặc định `fe-interview`) → dropdown quiz FE chỉ hiện danh mục FE.
3. **`quizApi.pickQuizQuestionIds`**: thêm `trackSlug?` + `topicId?` → khi chọn "tất cả" không kéo nhầm câu cert; cert quiz truyền trackSlug/topicId.

Flashcard: **không đổi** (deck cá nhân, trộn track là bình thường).

Quiz cert: tái dùng nguyên `startCustomQuiz` + `quiz_attempts` + runner + scoring; chỉ thêm tham số ẩn `track`/`topic` trong form quiz của trang cert.

---

## 4. Feature `src/features/certs/`

```
src/features/certs/
  api/certs.api.ts     # listTracks (kind='certification'), getTrack(slug) [domains+topics+counts],
                       #   getTopicStudy(trackSlug, topicSlug) [câu theory của topic]
  components/
    track-card.tsx
    domain-accordion.tsx   # domain -> topics (link study + nút quiz)
    study-list.tsx         # danh sách Q&A theory (concept + giải thích) + add-flashcard
  types.ts               # CertTrackSummary, CertTrackDetail, CertDomain, CertTopic, StudyItem
  index.ts
```
Ranh giới: reuse `AddFlashcardButton` (flashcard feature), quiz qua form action `startCustomQuiz`.

### Routes / pages
- `/certs` (Public*): card mỗi track cert (name, mô tả, số domain/câu).
- `/certs/[trackSlug]` (Public*): overview — accordion domain → topic; mỗi topic có nút "Học" (→ topic page) + "Quiz phần này" (form POST startCustomQuiz với track+topic).
- `/certs/[trackSlug]/[topicSlug]` (Public*): trang học — Q&A theory của topic (prompt = khái niệm, answer_md = giải thích), mỗi câu có nút thêm flashcard (yêu cầu đăng nhập); nút "Làm quiz phần này".
- Nav: thêm **"Ôn thi chứng chỉ"** (Public*, sau "Luyện code"). `/certs` KHÔNG vào PROTECTED_PREFIXES.

---

## 5. Nội dung (seed `06_cert_content.sql`)

Sinh bằng workflow nhiều agent (1 agent/domain), mỗi câu gồm: type (`theory` học | `quiz` ôn), prompt_md, answer_md, (quiz: options + correct_keys), difficulty, level nominal. Verify pass kiểm chính xác + đúng shape quiz.

**Domain (category) theo blueprint chính thức:**
- **aws-clf (CLF-C02):** Cloud Concepts · Security & Compliance · Cloud Technology & Services · Billing, Pricing & Support.
- **aws-saa (SAA-C03):** Secure Architectures · Resilient Architectures · High-Performing Architectures · Cost-Optimized Architectures.
- **pmp:** People · Process · Business Environment.

Mỗi domain có vài topic; ~80+ câu/track (trộn theory + quiz).

⚠️ **Độ chính xác:** nội dung sinh tự động cần user review trước khi tin dùng (số liệu dịch vụ AWS, quy trình PMP có thể sai). Seed là bộ khởi đầu chất lượng, không đảm bảo 100%.

Script sinh + assemble ra SQL (như 01_content/04_coding): tra `track_id`/`category_id`/`topic_id` theo slug (subselect), idempotent (upsert theo question slug). Chèn cả tracks(nếu chưa)/categories/topics cần thiết.

---

## 6. Verify

- **Unit:** nếu tách helper (vd map domain→category) thì test; chủ yếu logic ở SQL/api.
- **Gate:** typecheck · lint · vitest · build.
- **Runtime smoke:** `/certs` liệt kê 3 track; `/certs/aws-clf` hiện domain/topic; trang topic hiện Q&A; **FE `/questions` KHÔNG hiện câu cert**; **dropdown quiz FE KHÔNG hiện danh mục cert**; quiz "tất cả" của FE không kéo câu cert.
- **Review:** subagent soi track-scoping (rò rỉ cert vào FE & ngược lại), RLS tracks, shape seed.

---

## 7. Bước thủ công của user
- Chạy `migrations/0011_tracks.sql` rồi `seeds/06_cert_content.sql`.
- **Review nội dung cert** đã seed (độ chính xác thi cử).

## 8. Rủi ro
- Độ chính xác nội dung cert (giảm thiểu bằng verify pass + cảnh báo review).
- Backfill `track_id`: migration đặt NOT NULL sau backfill — nếu có category rớt (không nên) sẽ lỗi; migration chạy 1 lần lúc đã có categories FE.
