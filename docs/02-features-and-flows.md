> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# ĐẶC TẢ TÍNH NĂNG & LUỒNG NGƯỜI DÙNG — FE Interview Prep (MVP)

> Tài liệu Product Spec do Senior PM/Product Designer biên soạn. Phạm vi: MVP đã chốt (Question Bank, Quiz, Flashcard + Spaced Repetition, Learning Path, Progress Tracking, Auth, Admin, Bookmarks, Search). Kiến trúc phải sẵn sàng mở rộng cho Phase sau (Coding Challenge, Mock Interview).

---

## 0. Nguyên tắc thiết kế sản phẩm (Product Principles)

| # | Nguyên tắc | Diễn giải |
|---|-----------|-----------|
| P1 | **Learner-first** | User là người HỌC, không phải người nhập liệu. Nội dung được seed sẵn chất lượng cao; admin bổ sung dần. |
| P2 | **Song ngữ có chủ đích** | UI có i18n (vi/en). Nội dung giải thích bằng tiếng Việt, GIỮ NGUYÊN thuật ngữ tiếng Anh (`closure`, `hoisting`, `reconciliation`, `event loop`...). Không dịch thuật ngữ. |
| P3 | **Progress luôn hiện diện** | Mỗi màn hình học tập đều phản hồi tiến độ (đã học bao nhiêu, còn lại bao nhiêu, streak). |
| P4 | **Offline-tolerant về mặt logic** | Spaced repetition & quiz scoring tính được ở client, sync lên Supabase; giảm phụ thuộc round-trip. |
| P5 | **Mọi màn hình có 4 trạng thái** | Empty / Loading / Error / Success (+ Partial khi phù hợp). Không có màn hình "chết". |
| P6 | **RLS là ranh giới bảo mật thật** | Không tin client. Mọi quyền đọc/ghi dữ liệu cá nhân enforced bằng Row Level Security ở Supabase. |
| P7 | **Sẵn sàng mở rộng** | Schema & routing đặt chỗ trước cho `challenges/*`, `mock-interview/*` (Phase sau) nhưng KHÔNG build ngay. |

---

## 1. INFORMATION ARCHITECTURE (Bảng Route đầy đủ)

**Chú thích cột:**
- **Access**: `Public` (không cần login) / `Auth` (cần đăng nhập) / `Admin` (cần role admin) / `Guest-only` (chỉ khi chưa login).
- **Render**: `RSC` = React Server Component (server-first, data fetch ở server) / `Client` = Client Component (interaktiv, state nhiều) / `Hybrid` = shell RSC + island client.
- Route theo Next.js 15 App Router. `[param]` = dynamic segment. `(group)` = route group không ảnh hưởng URL.

### 1.1. Nhóm Public / Marketing

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/` | Landing / Home | Giới thiệu sản phẩm, value proposition, CTA đăng ký, preview số liệu (số câu hỏi, chủ đề, learning paths). Nếu đã login → hiển thị nút "Vào Dashboard". | Public | RSC |
| `/about` | Giới thiệu | Về dự án, phương pháp học, nguồn nội dung. | Public | RSC |
| `/pricing` *(placeholder)* | Bảng giá | Đặt chỗ, MVP để "Free". Could-have. | Public | RSC |

### 1.2. Nhóm Auth

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/login` | Đăng nhập | Email/password + "Đăng nhập với Google" (Supabase OAuth). | Guest-only | Client |
| `/signup` | Đăng ký | Email/password + Google. Gửi email xác nhận. | Guest-only | Client |
| `/forgot-password` | Quên mật khẩu | Nhập email → gửi magic reset link. | Guest-only | Client |
| `/reset-password` | Đặt lại mật khẩu | Từ link trong email, đặt mật khẩu mới. | Public (token) | Client |
| `/auth/callback` | OAuth callback | Route handler xử lý code exchange của Supabase, set session cookie, redirect. | Public (token) | Route Handler |
| `/verify-email` | Xác nhận email | Màn hình chờ/hướng dẫn xác nhận email. | Auth (pending) | Client |

### 1.3. Nhóm học tập cốt lõi (App)

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/dashboard` | Dashboard tiến độ | Trang chủ sau đăng nhập: streak, "Ôn tập hôm nay" (due cards), % hoàn thành theo chủ đề, learning path đang theo, hoạt động gần đây. | Auth | Hybrid |
| `/topics` | Danh sách chủ đề (Categories/Topics) | Grid các chủ đề (JavaScript, React, CSS, HTML, Networking, System Design FE, TypeScript...) kèm số câu hỏi & % đã học. | Public* | RSC |
| `/topics/[topicSlug]` | Câu hỏi theo chủ đề | Danh sách câu hỏi thuộc chủ đề + filter (độ khó, đã học/chưa, bookmark) + search trong chủ đề + phân trang. | Public* | Hybrid |
| `/questions` | Toàn bộ ngân hàng câu hỏi | List tất cả câu hỏi, filter đa chiều (topic, difficulty, tag, bookmarked), search, sort. | Public* | Hybrid |
| `/questions/[questionSlug]` | Chi tiết câu hỏi | Đề bài + đáp án chi tiết (song ngữ), code sample, tags, độ khó, câu liên quan, nút bookmark, "đánh dấu đã hiểu", "thêm vào flashcard". | Public* | Hybrid |
| `/bookmarks` | Câu hỏi đã lưu | Danh sách câu hỏi user đã bookmark, filter theo topic. | Auth | Hybrid |
| `/search` | Tìm kiếm toàn cục | Full-text search trên câu hỏi (title, body, tags). Kết quả nhóm theo loại. Query qua `?q=`. | Public* | Hybrid |

> \* **Public\***: Xem được nội dung (SEO tốt, thu hút user), nhưng các hành động cá nhân hoá (bookmark, đánh dấu đã học, thêm flashcard, lưu progress) yêu cầu **Auth** → hiện prompt đăng nhập.

### 1.4. Nhóm Quiz

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/quiz` | Quiz hub | Danh sách quiz có sẵn (theo chủ đề/level) + nút "Tạo quiz nhanh" (custom). | Auth | Hybrid |
| `/quiz/new` | Thiết lập quiz | Chọn chủ đề, độ khó, số câu, chế độ (có/không tính giờ). | Auth | Client |
| `/quiz/session/[sessionId]` | Làm bài | Giao diện làm bài: câu hỏi, đáp án, timer, thanh tiến độ, điều hướng câu. State ở client, autosave. | Auth | Client |
| `/quiz/result/[attemptId]` | Kết quả & Review | Điểm, thời gian, % đúng, review từng câu (đáp án đúng/sai + giải thích). | Auth | RSC |
| `/quiz/history` | Lịch sử quiz | Danh sách các attempt đã làm + thống kê (điểm trung bình, xu hướng). | Auth | Hybrid |

### 1.5. Nhóm Flashcard / Spaced Repetition

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/review` | Ôn tập hôm nay | Hàng đợi các card đến hạn (due). Giao diện lật thẻ + tự đánh giá (Again/Hard/Good/Easy). | Auth | Client |
| `/flashcards` | Bộ flashcard | Quản lý deck: xem các card đang học, lọc theo topic, trạng thái (new/learning/review), thêm/xoá card. | Auth | Hybrid |
| `/flashcards/[deckSlug]` *(optional)* | Deck cụ thể | Nếu tổ chức theo deck/topic. Could-have. | Auth | Hybrid |

### 1.6. Nhóm Learning Path

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/paths` | Danh sách lộ trình | Các learning path theo cấp độ: Junior → Mid → Senior. Mỗi path hiển thị số module, % hoàn thành (nếu đã login). | Public* | RSC |
| `/paths/[pathSlug]` | Chi tiết lộ trình | Cấu trúc path: các module/step (theo thứ tự), điều kiện mở khoá, tiến độ, nút "Bắt đầu/Tiếp tục". | Public* | Hybrid |
| `/paths/[pathSlug]/[stepSlug]` *(optional)* | Bước học cụ thể | Nội dung 1 step (gồm câu hỏi cần đọc + quiz kiểm tra). Có thể gộp vào detail. Should-have. | Auth | Hybrid |

### 1.7. Nhóm Cá nhân (Profile / Settings)

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/profile` | Hồ sơ | Thông tin công khai: tên, avatar, badges, thống kê tổng. | Auth | Hybrid |
| `/settings` | Cài đặt | Tab: Account (email, đổi mật khẩu), Preferences (ngôn ngữ vi/en, theme dark/light, số card/ngày, mục tiêu streak), Notifications, Danger zone (xoá tài khoản). | Auth | Client |

### 1.8. Nhóm Admin

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `/admin` | Admin Dashboard | Tổng quan: số câu hỏi, số user, câu hỏi thiếu đáp án, hoạt động gần đây, quick actions. | Admin | Hybrid |
| `/admin/categories` | Quản lý danh mục | CRUD categories (nhóm lớn). | Admin | Hybrid |
| `/admin/topics` | Quản lý chủ đề | CRUD topics (thuộc category), sắp xếp thứ tự. | Admin | Hybrid |
| `/admin/questions` | Quản lý câu hỏi | Bảng câu hỏi + filter + bulk actions. | Admin | Hybrid |
| `/admin/questions/new` | Tạo câu hỏi | Form tạo: đề, đáp án (rich/markdown song ngữ), độ khó, topic, tags, options (nếu là quiz-type). | Admin | Client |
| `/admin/questions/[id]/edit` | Sửa câu hỏi | Form sửa, preview. | Admin | Client |
| `/admin/quizzes` | Quản lý quiz mẫu | CRUD các quiz curated (bộ câu hỏi cố định theo chủ đề/level). | Admin | Hybrid |
| `/admin/quizzes/[id]/edit` | Sửa quiz mẫu | Chọn câu hỏi, cấu hình. | Admin | Client |
| `/admin/paths` | Quản lý learning path | CRUD paths + modules/steps, sắp xếp, gán câu hỏi/quiz vào step. | Admin | Hybrid |
| `/admin/paths/[id]/edit` | Sửa learning path | Builder kéo-thả module/step. | Admin | Client |
| `/admin/users` *(optional)* | Quản lý user | Xem danh sách user, set role. Should-have. | Admin | Hybrid |

### 1.9. Nhóm hệ thống

| Path | Tên trang | Mô tả | Access | Render |
|------|-----------|-------|--------|--------|
| `not-found.tsx` (`/*`) | 404 | Trang không tồn tại, gợi ý về Home/Topics. | Public | RSC |
| `error.tsx` | Error boundary | Lỗi runtime, nút "Thử lại". | Public | Client |
| `global-error.tsx` | Global error | Lỗi ở root layout. | Public | Client |
| `/offline` *(optional)* | Offline | Nếu thêm PWA sau. Could-have. | Public | RSC |

### 1.10. Route đặt chỗ cho Phase sau (KHÔNG build MVP)

| Path | Ghi chú |
|------|---------|
| `/challenges`, `/challenges/[slug]` | Coding challenge + live editor. Chỉ giữ chỗ trong routing plan & schema. |
| `/mock-interview`, `/mock-interview/[sessionId]` | Mock interview. Placeholder. |

---

## 2. ĐẶC TẢ TỪNG TÍNH NĂNG CHÍNH

Mỗi tính năng gồm: **Mô tả · User Story · UI States · Acceptance Criteria (checklist)**.

---

### 2.1. Question Bank (Ngân hàng câu hỏi)

**Mô tả:** Trung tâm nội dung. User duyệt câu hỏi phỏng vấn FE theo chủ đề/độ khó, đọc đáp án chi tiết song ngữ, search & filter, bookmark, đánh dấu đã hiểu.

**User Stories:**
- Là **người học**, tôi muốn **lọc câu hỏi theo chủ đề và độ khó** để **tập trung vào phần tôi yếu**.
- Là **người học**, tôi muốn **đọc đáp án chi tiết kèm code example** để **hiểu bản chất chứ không học vẹt**.
- Là **người học**, tôi muốn **bookmark câu hỏi khó** để **ôn lại trước buổi phỏng vấn**.
- Là **người học**, tôi muốn **search theo từ khoá (`closure`, `debounce`...)** để **tìm nhanh câu cần**.

**UI States:**

| State | Mô tả hiển thị |
|-------|----------------|
| **Loading** | Skeleton list (8–10 hàng), skeleton filter bar. |
| **Empty (no data)** | Chủ đề chưa có câu hỏi → illustration + "Chưa có câu hỏi ở chủ đề này". |
| **Empty (filter no result)** | "Không tìm thấy câu hỏi khớp bộ lọc" + nút "Xoá bộ lọc". |
| **Error** | "Không tải được câu hỏi" + nút "Thử lại" + link về `/topics`. |
| **Success** | List câu hỏi (title, độ khó badge, topic, trạng thái đã học ✓, icon bookmark). |
| **Partial** | Trang đang tải thêm (infinite scroll/pagination) → spinner cuối list. |

**Acceptance Criteria:**
- [ ] Câu hỏi hiển thị đầy đủ: title, độ khó (Easy/Medium/Hard), topic tag, trạng thái đã học, bookmark.
- [ ] Filter theo: topic, difficulty, tag, "chỉ bookmark", "chưa học". Filter cộng dồn (AND).
- [ ] Search hoạt động trên title + tags (tối thiểu), debounce 300ms, phản ánh vào URL query (`?q=`, `?difficulty=`) để share/bookmark link.
- [ ] Trang chi tiết render đáp án Markdown an toàn (sanitize), code block có syntax highlight, hỗ trợ song ngữ (block vi + giữ term EN).
- [ ] Bookmark toggle tức thì (optimistic update), sync Supabase, chịu được lỗi mạng (revert nếu fail).
- [ ] "Đánh dấu đã hiểu" cập nhật progress của user (RLS: chỉ chính user ghi được).
- [ ] Guest xem được nội dung; hành động cá nhân hoá → mở modal "Đăng nhập để lưu tiến độ".
- [ ] Phân trang hoặc infinite scroll ổn định (không nhảy layout, giữ vị trí khi back).
- [ ] "Câu hỏi liên quan" gợi ý theo cùng topic/tag.

---

### 2.2. Quiz Engine (Trắc nghiệm chấm điểm)

**Mô tả:** Cho phép user tạo/chọn quiz theo chủ đề–độ khó–số câu, làm bài (tuỳ chọn tính giờ), được chấm điểm tự động, review đáp án đúng/sai kèm giải thích, và lưu lịch sử + thống kê.

**User Stories:**
- Là **người học**, tôi muốn **tự tạo quiz theo chủ đề và số câu** để **luyện đúng phần cần**.
- Là **người học**, tôi muốn **làm bài có tính giờ** để **mô phỏng áp lực phỏng vấn**.
- Là **người học**, tôi muốn **xem lại câu sai kèm giải thích** để **hiểu tại sao mình sai**.
- Là **người học**, tôi muốn **xem lịch sử điểm** để **thấy mình tiến bộ**.

**UI States:**

| Màn hình | Loading | Empty | Error | Success |
|----------|---------|-------|-------|---------|
| Setup (`/quiz/new`) | Skeleton form | (n/a) — luôn có options | Toast "Không tải được chủ đề" | Form đầy đủ, nút "Bắt đầu" enable khi hợp lệ |
| Session (`/quiz/session/[id]`) | Spinner "Đang chuẩn bị đề" | "Không đủ câu hỏi cho bộ lọc này" | "Lỗi tải câu hỏi, quay lại setup" | Câu hỏi + đáp án + timer + progress |
| Result (`/quiz/result/[id]`) | Skeleton score | (n/a) | "Không tìm thấy kết quả" | Điểm, biểu đồ, review từng câu |
| History (`/quiz/history`) | Skeleton table | "Bạn chưa làm quiz nào" + CTA | "Không tải được lịch sử" | Bảng attempts + thống kê |

**Luồng chấm điểm & timer:**
- Timer chạy client-side, cảnh báo khi còn 10% thời gian, auto-submit khi hết giờ.
- Chấm điểm: mỗi câu đúng = 1 điểm (single/multiple choice). Multiple-choice yêu cầu đúng toàn bộ đáp án mới tính điểm (hoặc partial — xem AC).
- Kết quả tính được ở client để phản hồi tức thì, đồng thời POST attempt lên Supabase (server tin cậy là nguồn thống kê).

**Acceptance Criteria:**
- [ ] Setup cho chọn: 1+ topics, difficulty (mix/easy/medium/hard), số câu (5/10/20/custom), timed on/off, thời lượng.
- [ ] Nếu số câu yêu cầu > số câu có sẵn → cảnh báo & tự giảm về tối đa khả dụng.
- [ ] Trong session: điều hướng Prev/Next, nhảy câu qua thanh progress, đánh dấu "flag để xem lại".
- [ ] Autosave câu trả lời (chống mất khi reload) — state lưu localStorage/sessionStorage + đồng bộ.
- [ ] Timer chính xác, auto-submit khi hết giờ, không cho sửa sau submit.
- [ ] Chấm điểm chính xác cho single & multiple choice; hiển thị điểm số, %, thời gian, số câu đúng/sai.
- [ ] Review: mỗi câu hiển thị đáp án user chọn (đỏ nếu sai), đáp án đúng (xanh), giải thích song ngữ.
- [ ] Lưu attempt vào DB: user_id, quiz config, danh sách câu + đáp án chọn, điểm, thời gian, timestamp.
- [ ] History hiển thị xu hướng điểm (theo thời gian) & điểm TB theo topic.
- [ ] Kết quả quiz cập nhật vào Progress Tracking (câu đã làm đúng → đánh dấu học).
- [ ] RLS: user chỉ đọc/ghi attempt của chính mình.

---

### 2.3. Flashcard + Spaced Repetition (Ôn tập ngắt quãng)

**Mô tả:** Biến câu hỏi thành flashcard (mặt trước = câu hỏi/khái niệm, mặt sau = đáp án cô đọng). Hệ thống lên lịch ôn tập theo thuật toán spaced repetition; mỗi ngày user vào `/review` để xử lý các card đến hạn.

**User Stories:**
- Là **người học**, tôi muốn **hệ thống nhắc tôi ôn đúng lúc sắp quên** để **ghi nhớ lâu dài mà không tốn sức**.
- Là **người học**, tôi muốn **tự đánh giá mức độ nhớ (Again/Hard/Good/Easy)** để **thuật toán điều chỉnh lịch phù hợp**.
- Là **người học**, tôi muốn **thêm nhanh câu hỏi hay vào flashcard** để **on lại sau**.

**UI States:**

| State | Mô tả |
|-------|-------|
| **Loading** | Skeleton card ở giữa màn hình. |
| **Empty (không có due)** | "Hôm nay không có thẻ cần ôn 🎉" + số thẻ sẽ đến hạn ngày mai + CTA "Thêm thẻ mới". |
| **Empty (chưa có deck)** | "Bạn chưa có flashcard nào" + hướng dẫn thêm từ câu hỏi. |
| **In-progress** | Card mặt trước → nút "Hiện đáp án" → 4 nút đánh giá; progress "3/12". |
| **Error** | "Không lưu được kết quả ôn tập" + retry (queue offline). |
| **Done** | "Đã ôn xong 12 thẻ hôm nay!" + thống kê (đúng/sai, thời gian) + streak +1. |

**Acceptance Criteria:**
- [ ] User thêm được câu hỏi vào flashcard từ trang chi tiết câu hỏi (1 click).
- [ ] `/review` chỉ hiển thị card có `due_date <= hôm nay`, sắp theo độ ưu tiên (quá hạn lâu nhất trước).
- [ ] Mặt trước hiển thị prompt; "Hiện đáp án" lật thẻ; 4 lựa chọn: Again / Hard / Good / Easy.
- [ ] Mỗi đánh giá cập nhật `interval`, `ease_factor`, `repetitions`, `due_date` theo thuật toán (mục 3).
- [ ] Giới hạn số card/ngày theo setting user (mặc định 20 new + không giới hạn review, có thể chỉnh).
- [ ] Kết quả review lưu lên Supabase; hoàn thành session ôn → cập nhật streak.
- [ ] Chịu lỗi mạng: đánh giá được queue local, sync khi có mạng (không mất tiến độ).
- [ ] Card "Again" quay lại cuối hàng đợi trong cùng session (học lại trong ngày).

---

### 2.4. Learning Paths (Lộ trình học theo cấp độ)

**Mô tả:** Lộ trình có cấu trúc dẫn user từ Junior → Mid → Senior. Mỗi path gồm các **module**, mỗi module gồm các **step** (đọc câu hỏi + làm quiz kiểm tra). Hoàn thành step mở khoá step sau; hoàn thành path đạt milestone.

**User Stories:**
- Là **người mới**, tôi muốn **một lộ trình rõ ràng theo cấp độ** để **biết học gì trước, gì sau**.
- Là **người học**, tôi muốn **thấy tiến độ và điều kiện hoàn thành** để **có động lực đi tiếp**.

**UI States:**

| State | Mô tả |
|-------|-------|
| **Loading** | Skeleton timeline các module. |
| **Empty** | (hiếm) "Chưa có lộ trình nào" — admin chưa seed. |
| **Not started** | Path detail với nút "Bắt đầu", tất cả step chưa mở (trừ step 1). |
| **In-progress** | Progress bar %, step hiện tại highlight, step sau locked/unlocked. |
| **Completed** | Badge hoàn thành, "Bạn đã hoàn thành lộ trình Junior!" + gợi ý path tiếp theo. |
| **Error** | "Không tải được lộ trình" + retry. |

**Acceptance Criteria:**
- [ ] Path list hiển thị level (Junior/Mid/Senior), số module, thời lượng ước tính, % hoàn thành (nếu login).
- [ ] Path detail hiển thị dạng timeline/stepper có thứ tự; điều kiện mở khoá rõ ràng.
- [ ] Điều kiện hoàn thành step: đã đọc hết câu hỏi bắt buộc **và** đạt ngưỡng quiz (ví dụ ≥ 70%).
- [ ] Progress được lưu per-user, resume đúng vị trí khi quay lại.
- [ ] Hoàn thành path → ghi milestone + (optional) badge.
- [ ] Guest xem cấu trúc path nhưng phải login để lưu tiến độ.

---

### 2.5. Progress Tracking & Gamification (nhẹ)

**Mô tả:** Dashboard cá nhân tổng hợp: streak học tập, % hoàn thành theo chủ đề, tổng số câu đã học, số flashcard, điểm quiz trung bình, và (nice-to-have) huy hiệu.

**User Stories:**
- Là **người học**, tôi muốn **thấy streak và % hoàn thành** để **duy trì thói quen**.
- Là **người học**, tôi muốn **biết chủ đề nào mình còn yếu** để **ưu tiên ôn**.

**UI States:**

| State | Mô tả |
|-------|-------|
| **Loading** | Skeleton các stat card + charts. |
| **Empty (user mới)** | "Bắt đầu hành trình!" + CTA (làm quiz đầu tiên / chọn learning path). Streak = 0. |
| **Success** | Streak counter, "Ôn tập hôm nay" widget, progress rings theo topic, activity heatmap. |
| **Error** | Stat card lỗi hiển thị "—" + retry cục bộ (không sập cả trang). |

**Acceptance Criteria:**
- [ ] **Streak**: đếm số ngày liên tiếp có hoạt động học (review/quiz/đọc ≥ ngưỡng). Reset nếu bỏ 1 ngày; hiển thị "freeze" info nếu triển khai (Could).
- [ ] **% hoàn thành theo chủ đề** = (câu đã học / tổng câu topic) × 100.
- [ ] Tổng số câu đã học, số flashcard theo trạng thái (new/learning/mastered), điểm quiz TB.
- [ ] "Ôn tập hôm nay" hiển thị số card due + CTA vào `/review`.
- [ ] **Badges (nice-to-have)**: ví dụ "7-day streak", "Hoàn thành Junior Path", "100 câu đã học". Chỉ hiển thị badge đã đạt; badge chưa đạt hiển thị mờ + điều kiện.
- [ ] Mọi số liệu tính từ dữ liệu thật, RLS bảo vệ (chỉ user thấy dữ liệu của mình).

---

### 2.6. Bookmarks

**User Story:** Là **người học**, tôi muốn **một nơi tập hợp câu đã lưu** để **ôn nhanh trước phỏng vấn**.

**UI States:** Loading (skeleton) · Empty ("Chưa lưu câu nào" + gợi ý duyệt câu hỏi) · Error (retry) · Success (list + filter theo topic).

**Acceptance Criteria:**
- [ ] Toggle bookmark ở mọi nơi hiển thị câu hỏi, đồng bộ real-time giữa các trang.
- [ ] `/bookmarks` list + filter topic + search; xoá bookmark ngay tại đây.
- [ ] RLS: chỉ chủ sở hữu đọc/ghi.

---

### 2.7. Global Search

**User Story:** Là **người học**, tôi muốn **tìm nhanh câu hỏi/khái niệm từ bất cứ đâu** để **tiết kiệm thời gian**.

**UI States:** Idle (gợi ý tìm kiếm phổ biến) · Loading (spinner inline) · Empty ("Không có kết quả cho '…'") · Error · Success (kết quả nhóm theo Question/Topic/Path).

**Acceptance Criteria:**
- [ ] Command palette (Ctrl/Cmd+K) mở search toàn cục.
- [ ] Full-text search Postgres (tsvector) trên title, body, tags.
- [ ] Debounce, highlight từ khoá, phím tắt điều hướng kết quả.
- [ ] Query đồng bộ URL ở trang `/search`.

---

### 2.8. Auth (Supabase)

**User Story:** Là **người dùng**, tôi muốn **đăng nhập nhanh bằng Google hoặc email** để **lưu tiến độ học**.

**UI States:** Form idle · Submitting (nút loading) · Error (sai mật khẩu, email tồn tại, mạng) · Success (redirect) · Pending verification.

**Acceptance Criteria:**
- [ ] Đăng ký/đăng nhập bằng email+password và Google OAuth.
- [ ] `/auth/callback` xử lý code exchange, set httpOnly session cookie.
- [ ] Middleware bảo vệ route Auth/Admin; redirect chưa-login về `/login?next=…`.
- [ ] Quên/đặt lại mật khẩu qua email hoạt động.
- [ ] Session refresh tự động; đăng xuất xoá session mọi tab.
- [ ] Trigger tạo row `profiles` khi user mới đăng ký (default role = `user`).

---

### 2.9. Profile / Settings

**Acceptance Criteria:**
- [ ] Đổi ngôn ngữ UI (vi/en), theme (light/dark/system) — lưu persist.
- [ ] Cấu hình học: số new card/ngày, mục tiêu streak.
- [ ] Đổi email/mật khẩu, đăng xuất, xoá tài khoản (confirm 2 bước).
- [ ] Dark mode áp dụng toàn app, không nhấp nháy khi load (no FOUC).

---

### 2.10. Admin (CMS nội dung)

**Mô tả:** Khu vực chỉ admin, để thêm/sửa/cập nhật dần nội dung: categories, topics, questions, quizzes, learning paths.

**User Story:** Là **admin/biên tập**, tôi muốn **CRUD nội dung có preview song ngữ** để **mở rộng ngân hàng câu hỏi mà không cần deploy lại**.

**UI States:** Loading (skeleton table) · Empty ("Chưa có mục nào" + nút Tạo) · Error · Success (data table + actions) · Saving (nút loading, optimistic) · Validation error (inline field).

**Acceptance Criteria:**
- [ ] CRUD đầy đủ cho categories, topics, questions, quizzes, paths.
- [ ] Editor câu hỏi hỗ trợ Markdown song ngữ + preview + code block; thêm options cho câu trắc nghiệm (đánh dấu đáp án đúng).
- [ ] Validation: bắt buộc title, topic, difficulty; cảnh báo câu thiếu đáp án.
- [ ] Path builder: thêm module/step, gán câu hỏi/quiz, sắp thứ tự (drag or order field).
- [ ] Bulk actions cho questions (đổi topic, đổi độ khó, xoá mềm).
- [ ] RLS + role check: chỉ `role = admin` truy cập được (enforced cả ở middleware và DB policy).
- [ ] Soft delete (giữ `deleted_at`) để tránh mất dữ liệu.

---

## 3. SPACED REPETITION — Thuật toán chi tiết

### 3.1. Lựa chọn: SM-2 đơn giản hoá (khuyến nghị)

Dùng biến thể **SM-2** (thuật toán của Anki/SuperMemo) rút gọn — đủ mạnh, dễ hiểu, dễ implement, phổ biến. Người học tự đánh giá bằng **4 nút** thay vì thang 0–5 để UX thân thiện:

| Nút UI | grade (q) | Ý nghĩa |
|--------|-----------|---------|
| **Again** | 0 | Không nhớ / sai. Reset chu kỳ. |
| **Hard** | 3 | Nhớ nhưng khó. Tăng interval ít, giảm ease. |
| **Good** | 4 | Nhớ ổn. Interval theo công thức chuẩn. |
| **Easy** | 5 | Quá dễ. Tăng interval mạnh, tăng ease. |

### 3.2. Dữ liệu lưu mỗi card (bảng `user_flashcards`)

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `user_id` | uuid | FK → auth.users (RLS key) |
| `question_id` | uuid | FK → questions |
| `ease_factor` | numeric | Hệ số dễ, khởi tạo **2.5**, min **1.3** |
| `interval` | int | Số ngày tới lần ôn kế tiếp |
| `repetitions` | int | Số lần liên tiếp trả lời đúng (≥ Good) |
| `due_date` | date | Ngày đến hạn ôn |
| `last_reviewed_at` | timestamptz | Lần ôn gần nhất |
| `state` | enum | `new` / `learning` / `review` / `relearning` |
| `lapses` | int | Số lần "Again" (quên) — phục vụ thống kê |

Ngoài ra, log mỗi lần review vào bảng `review_logs` (immutable) để phân tích: `card_id, grade, prev_interval, new_interval, prev_ease, new_ease, reviewed_at`.

### 3.3. Công thức tính (pseudocode — đặt trong `helpers/spacedRepetition.ts`, hàm thuần)

```
function schedule(card, grade):
    if grade < 3:                      # Again
        card.repetitions = 0
        card.interval    = 1           # ôn lại ngày mai (hoặc trong ngày nếu learning)
        card.state       = 'relearning'
        card.lapses     += 1
    else:                              # Hard / Good / Easy
        if card.repetitions == 0:
            card.interval = 1
        elif card.repetitions == 1:
            card.interval = 6
        else:
            card.interval = round(card.interval * card.ease_factor)
        card.repetitions += 1
        card.state = 'review'

    # Cập nhật ease_factor (chỉ khi grade >= 3, theo SM-2)
    card.ease_factor = card.ease_factor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    if card.ease_factor < 1.3: card.ease_factor = 1.3

    card.due_date = today + card.interval days
    card.last_reviewed_at = now
    return card
```

**Ghi chú thiết kế:**
- Nút **Hard** có thể giảm nhẹ interval (×1.2 thay vì ×ease) — biến thể Anki. MVP giữ đơn giản như trên; có thể tinh chỉnh sau.
- Card mới (`new`) lần đầu: interval = 1 ngày sau khi Good/Easy.
- **Again** trong cùng session: đưa card về cuối queue để học lại ngay trong ngày, nhưng `due_date` vẫn = mai.

### 3.4. Luồng "Ôn tập hôm nay" (`/review`)

1. Query cards `WHERE user_id = current_user AND due_date <= today`, order theo `due_date ASC` (quá hạn lâu ưu tiên), giới hạn theo setting (new/day).
2. Hiển thị card đầu (mặt trước).
3. User bấm "Hiện đáp án" → mặt sau.
4. User chọn Again/Hard/Good/Easy.
5. Tính `schedule(card, grade)` ở client → cập nhật UI tức thì; POST lên Supabase (upsert card + insert review_log).
6. Nếu Again → đẩy card về cuối queue phiên.
7. Lặp đến hết queue → màn hình "Done" + cập nhật streak.
8. Lỗi mạng → queue local, retry background.

---

## 4. QUIZ ENGINE — Luồng chi tiết

**Sơ đồ luồng (đánh số):**

1. User vào `/quiz` → chọn "Tạo quiz nhanh" hoặc quiz curated.
2. `/quiz/new`: chọn **topics** (1+), **difficulty** (mix/easy/medium/hard), **số câu** (5/10/20/custom), **timed?** + thời lượng.
3. Client validate → nếu số câu > khả dụng, cảnh báo & auto-clamp.
4. POST tạo `quiz_session` (server chọn ngẫu nhiên câu theo filter, seed cố định để reproducible) → nhận `sessionId`.
5. Redirect `/quiz/session/[sessionId]`. Client load câu hỏi (không kèm đáp án đúng để chống cheat — hoặc kèm nhưng chấm ở server).
6. Timer bắt đầu (nếu timed). User trả lời từng câu; autosave local; có thể flag câu.
7. User bấm "Nộp bài" hoặc hết giờ → auto-submit.
8. Gửi danh sách đáp án lên server → server chấm điểm (nguồn tin cậy), tạo `quiz_attempt`.
9. Redirect `/quiz/result/[attemptId]`: điểm, %, thời gian, số đúng/sai.
10. Review từng câu: đáp án user (đỏ nếu sai), đáp án đúng (xanh), giải thích song ngữ.
11. Cập nhật Progress (câu đúng → đánh dấu đã học), có thể "Thêm câu sai vào flashcard".
12. Attempt lưu vào `/quiz/history` → thống kê xu hướng.

**Chấm điểm:**
- Single choice: đúng đáp án = 1 điểm.
- Multiple choice: **all-or-nothing** (MVP) — đúng toàn bộ mới tính điểm. (Partial credit = Could-have.)
- Điểm cuối = (đúng / tổng) × 100%.

**Bảng dữ liệu:** `quiz_sessions` (config + danh sách question_ids), `quiz_attempts` (user_id, session_id, answers jsonb, score, duration, created_at).

---

## 5. LEARNING PATH — Định nghĩa & tiến độ

### 5.1. Mô hình dữ liệu

```
learning_paths (id, slug, title, level[junior|mid|senior], description, order)
  └── path_modules (id, path_id, title, order)
        └── path_steps (id, module_id, title, order,
                        question_ids[], quiz_id?, pass_threshold)

user_path_progress (user_id, step_id, status[locked|available|completed], completed_at)
```

### 5.2. Cấp độ & ví dụ cấu trúc

| Level | Ví dụ module | Ví dụ step |
|-------|--------------|-----------|
| **Junior** | HTML & CSS Cơ bản, JS Fundamentals | "Box model & Flexbox", "`var` vs `let` vs `const`, hoisting" |
| **Mid** | React Core, Async JS | "Hooks & lifecycle", "Event loop, Promise, `async/await`" |
| **Senior** | Performance & Architecture, System Design FE | "Reconciliation & memoization", "Rendering strategies, caching" |

### 5.3. Điều kiện hoàn thành

- **Step completed** khi: đọc hết `question_ids` bắt buộc **AND** (nếu có `quiz_id`) đạt điểm ≥ `pass_threshold` (mặc định 70%).
- **Module completed** khi tất cả step trong module completed.
- **Path completed** khi tất cả module completed → milestone + badge (optional).
- Step kế tiếp chuyển từ `locked` → `available` khi step trước completed (tuần tự). Có thể cho phép "học tự do" (unlock all) tuỳ setting — MVP: tuần tự.

### 5.4. Hiển thị tiến độ

- Path list: progress bar % = (steps completed / total steps).
- Path detail: stepper dọc, icon trạng thái (✓ completed / ● available / 🔒 locked), nút "Tiếp tục" nhảy đến step available đầu tiên.

---

## 6. PROGRESS TRACKING & GAMIFICATION (nhẹ)

| Thành phần | Cách tính | Priority |
|-----------|-----------|----------|
| **Streak** | Số ngày liên tiếp có ≥1 hoạt động học (review/quiz/đọc). Lưu `last_active_date`, `current_streak`, `longest_streak`. | Must |
| **% theo chủ đề** | (câu đã học trong topic / tổng câu topic) × 100. | Must |
| **Câu đã học** | Đếm distinct question_id có trạng thái "đã hiểu" hoặc trả lời đúng trong quiz. | Must |
| **Flashcard stats** | Đếm theo state: new/learning/review/mastered (interval ≥ 21 ngày = mastered). | Should |
| **Điểm quiz TB** | Trung bình score các attempt gần nhất. | Should |
| **Activity heatmap** | Lịch nhiệt số hoạt động/ngày (giống GitHub). | Could |
| **Badges** | "7-day streak", "First Quiz", "100 câu", "Junior Path Done". Lưu `user_badges`. | Could (nice-to-have) |

**Ghi nhận hoạt động:** mỗi hành động học ghi vào bảng `activity_log` (user_id, type, ref_id, created_at) — nguồn dữ liệu tính streak, heatmap, dashboard.

---

## 7. PHÂN QUYỀN (Permissions Matrix)

| Hành động | Guest (chưa login) | User (đã login) | Admin |
|-----------|:---:|:---:|:---:|
| Xem topics/questions/paths (nội dung) | ✅ | ✅ | ✅ |
| Search & filter | ✅ | ✅ | ✅ |
| Bookmark câu hỏi | ❌ (prompt login) | ✅ | ✅ |
| Đánh dấu "đã học" / lưu progress | ❌ | ✅ | ✅ |
| Thêm/ôn flashcard, spaced repetition | ❌ | ✅ | ✅ |
| Làm quiz & lưu lịch sử | ❌ (có thể cho làm thử, không lưu) | ✅ | ✅ |
| Theo dõi learning path (lưu tiến độ) | ❌ | ✅ | ✅ |
| Xem dashboard cá nhân | ❌ | ✅ | ✅ |
| Đổi settings/profile | ❌ | ✅ | ✅ |
| CRUD categories/topics/questions | ❌ | ❌ | ✅ |
| CRUD quizzes/paths | ❌ | ❌ | ✅ |
| Quản lý users / set role | ❌ | ❌ | ✅ |

**Enforcement:**
- **Middleware** (Next.js): chặn route `/admin/*` và route Auth trước khi render.
- **RLS policies** (Supabase): ranh giới thật. VD: `user_flashcards` chỉ `auth.uid() = user_id`. Bảng nội dung `questions`: SELECT cho mọi người, INSERT/UPDATE/DELETE chỉ khi `profiles.role = 'admin'`.
- Role lưu ở `profiles.role` (`user` | `admin`), kiểm tra qua policy dùng `auth.uid()`.

---

## 8. USER FLOWS CHÍNH (đánh số)

### Flow A — Onboarding (user mới)
1. Vào `/` → bấm "Bắt đầu miễn phí".
2. `/signup` → đăng ký Google/email.
3. (Email) xác nhận qua `/verify-email`.
4. `/auth/callback` set session → redirect `/dashboard`.
5. Dashboard rỗng → CTA: "Chọn learning path" hoặc "Làm quiz đầu tiên".
6. Chọn ngôn ngữ & theme ở `/settings` (optional).

### Flow B — Học theo lộ trình
1. `/paths` → chọn "Junior Path".
2. `/paths/junior` → bấm "Bắt đầu" → step 1 available.
3. Đọc câu hỏi trong step → đánh dấu đã hiểu.
4. Làm quiz kiểm tra step → đạt ≥ 70%.
5. Step completed → step 2 unlock, progress bar tăng.
6. Lặp đến hết path → milestone + badge → gợi ý "Mid Path".

### Flow C — Ôn tập ngắt quãng hằng ngày
1. Dashboard hiển thị "Ôn tập hôm nay: 12 thẻ".
2. Bấm → `/review`.
3. Lật từng thẻ, tự đánh giá Again/Hard/Good/Easy.
4. Thuật toán cập nhật lịch → thẻ tiếp theo.
5. Hết queue → "Done" + streak +1.

### Flow D — Luyện quiz mô phỏng
1. `/quiz` → "Tạo quiz nhanh".
2. `/quiz/new`: React, Medium, 10 câu, timed 15 phút.
3. Làm bài → nộp/hết giờ.
4. `/quiz/result/[id]`: điểm 8/10, review câu sai + giải thích.
5. "Thêm 2 câu sai vào flashcard".
6. Xem `/quiz/history` để theo dõi tiến bộ.

### Flow E — Duyệt & bookmark câu hỏi
1. `/topics` → chọn "JavaScript".
2. `/topics/javascript` → filter Hard.
3. Mở `/questions/[slug]` → đọc đáp án.
4. Bookmark → (nếu guest) prompt login.
5. Xem lại tại `/bookmarks`.

### Flow F — Admin thêm câu hỏi
1. Admin login → `/admin`.
2. `/admin/questions` → "Tạo câu hỏi".
3. Nhập đề + đáp án song ngữ + topic + difficulty + tags (+ options nếu quiz-type).
4. Preview → Lưu (RLS kiểm tra role).
5. Câu hỏi xuất hiện ngay ở ngân hàng (không cần deploy).

---

## 9. ƯU TIÊN MoSCoW (MVP vs Sau)

### Must-have (MVP bắt buộc)
| Tính năng | Ghi chú |
|-----------|---------|
| Auth (Supabase, Google + email, RLS) | Nền tảng cá nhân hoá |
| Question Bank: list, filter, search, detail, đáp án song ngữ | Nội dung cốt lõi |
| Bookmark | Cơ bản, chi phí thấp |
| Quiz Engine: setup → làm → chấm → review → history | Giá trị luyện tập chính |
| Flashcard + Spaced Repetition (SM-2 rút gọn) + `/review` | Điểm khác biệt sản phẩm |
| Learning Path: list, detail, progress tuần tự | Định hướng học |
| Progress Dashboard: streak, % topic, câu đã học | Giữ chân user |
| Admin CRUD: categories, topics, questions | Vận hành nội dung |
| Seed dữ liệu mẫu chất lượng cao | User là người học |
| Dark mode + i18n (vi/en) | Yêu cầu đã chốt |
| 404/error/empty/loading states | Chất lượng UX |

### Should-have (nên có, có thể ngay sau MVP)
| Tính năng | Ghi chú |
|-----------|---------|
| Global search (Cmd+K, full-text) | Nâng cao tìm kiếm |
| Quiz curated (admin tạo bộ quiz cố định) | Bổ sung cho quiz tự tạo |
| Admin CRUD quizzes & paths (builder) | Mở rộng nội dung có cấu trúc |
| Flashcard stats (mastered) + điểm quiz TB | Làm giàu dashboard |
| Admin users & set role | Vận hành |
| Path step tách route riêng | Nếu nội dung step lớn |

### Could-have (nice-to-have, làm khi rảnh)
| Tính năng | Ghi chú |
|-----------|---------|
| Badges / huy hiệu | Gamification nhẹ |
| Activity heatmap | Trực quan hoá |
| Partial credit cho multiple-choice | Tinh chỉnh chấm điểm |
| Streak freeze | Giữ động lực |
| Pricing page, PWA/offline | Tương lai |

### Won't-have (Phase sau — chỉ đặt chỗ kiến trúc)
| Tính năng | Ghi chú |
|-----------|---------|
| Coding challenge + live editor (`/challenges`) | Schema & route giữ chỗ, không build MVP |
| Mock interview (`/mock-interview`) | Phase sau |
| Social/leaderboard, chia sẻ deck | Ngoài phạm vi hiện tại |

---

## 10. Gợi ý cấu trúc thư mục (phục vụ tách bạch code chuẩn senior)

> Để đảm bảo yêu cầu tách Custom Hooks / Helpers / Constants / Types / Components / Common. Chi tiết implementation sẽ ở tài liệu Technical Spec riêng — đây chỉ là ánh xạ từ feature spec.

```
src/
  app/                      # routes (mục 1)
  components/               # UI components theo feature
  components/common/        # Button, Card, EmptyState, ErrorState, Skeleton...
  hooks/                    # useReviewQueue, useQuizSession, useBookmarks (CHỈ React logic)
  helpers/                  # spacedRepetition.ts, scoreQuiz.ts, formatDate.ts (hàm THUẦN, no React)
  constants/                # difficulties.ts, routes.ts, srsConfig.ts (EASE_INIT, MIN_EASE...)
  types/                    # question.ts, quiz.ts, flashcard.ts, path.ts (type-safety tuyệt đối)
  lib/supabase/             # client, server, middleware, RLS-aware queries
  stores/                   # zustand: quizStore, reviewStore, uiStore
```

**Ranh giới quan trọng:**
- Thuật toán SM-2 (`helpers/spacedRepetition.ts`) là **hàm thuần** → test dễ, tái sử dụng client/server.
- Hằng số SRS (`EASE_INIT = 2.5`, `MIN_EASE = 1.3`, `GRADE_MAP`) đặt ở `constants/` — không hardcode rải rác.
- Custom hooks chỉ điều phối React state + gọi helpers; không chứa logic nghiệp vụ thuần.

---

**Tài liệu tiếp theo cần biên soạn:** (1) Data Model & RLS Policy Spec (Supabase schema chi tiết); (2) UI/UX Design System & Component Spec; (3) Seed Content Plan (danh mục chủ đề + số lượng câu hỏi mục tiêu mỗi topic/level).