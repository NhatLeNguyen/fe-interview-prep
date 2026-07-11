-- seed-content.sql — STARTER content (bộ mẫu nhỏ để demo feature "ngân hàng câu hỏi").
-- Cach chay: Supabase Dashboard > SQL Editor > New query > dan file nay > Run.
-- Idempotent: chay lai khong loi (on conflict do nothing). Bo seed day du se bo sung sau.

-- ============ CATEGORIES ============
insert into public.categories (slug, name, description, color, sort_order) values
  ('javascript', 'JavaScript', 'Ngôn ngữ lõi của web: types, scope, closure, async, event loop.', '#f7df1e', 1),
  ('react',      'React',      'Thư viện UI: hooks, rendering, reconciliation, performance.',        '#61dafb', 2),
  ('css',        'CSS & Layout','Layout, flexbox, grid, responsive, specificity, box model.',        '#2965f1', 3)
on conflict (slug) do nothing;

-- ============ TOPICS ============
insert into public.topics (category_id, slug, name, description, level, sort_order) values
  ((select id from public.categories where slug='javascript'), 'js-types',      'Types & Coercion',        'Kiểu dữ liệu, ép kiểu, so sánh.',              'junior', 1),
  ((select id from public.categories where slug='javascript'), 'js-closure',    'Closure',                 'Bao đóng, lexical scope, ứng dụng.',           'mid',    2),
  ((select id from public.categories where slug='javascript'), 'js-event-loop', 'Event Loop',              'Bất đồng bộ, microtask/macrotask.',            'mid',    3),
  ((select id from public.categories where slug='javascript'), 'js-this',       'this & Binding',          'Ngữ cảnh this, bind/call/apply, arrow.',       'mid',    4),
  ((select id from public.categories where slug='react'),      'react-hooks',   'React Hooks',             'useState, useEffect, quy tắc hooks.',          'mid',    1),
  ((select id from public.categories where slug='react'),      'react-render',  'Rendering & Reconciliation','Re-render, key, memo, virtual DOM.',         'senior', 2),
  ((select id from public.categories where slug='css'),        'css-box',       'Box Model',               'content/padding/border/margin, box-sizing.',   'junior', 1),
  ((select id from public.categories where slug='css'),        'css-flexbox',   'Flexbox',                 'Trục chính/phụ, align, justify, grow/shrink.', 'junior', 2)
on conflict (slug) do nothing;

-- ============ QUESTIONS ============
insert into public.questions (slug, topic_id, type, level, difficulty, frequency, estimated_time_sec, prompt_md, answer_md, code_snippet, code_language) values

-- JS: types
('phan-biet-null-undefined', (select id from public.topics where slug='js-types'), 'theory', 'junior', 1, 5, 60,
 $q$Phân biệt null và undefined trong JavaScript?$q$,
 $a$- **undefined**: biến đã khai báo nhưng CHƯA gán giá trị (hoặc truy cập property không tồn tại). Do JS engine tự gán.
- **null**: giá trị "rỗng" do LẬP TRÌNH VIÊN chủ động gán, thể hiện "không có gì".

Lưu ý: `typeof undefined === "undefined"` nhưng `typeof null === "object"` (một bug lịch sử của JS). Khi so sánh: `null == undefined` là `true`, nhưng `null === undefined` là `false`.$a$,
 null, null),

('== va === khac nhau', (select id from public.topics where slug='js-types'), 'theory', 'junior', 2, 5, 60,
 $q$Toán tử == và === khác nhau thế nào?$q$,
 $a$- `===` (strict equality): so sánh cả **giá trị** lẫn **kiểu**, KHÔNG ép kiểu.
- `==` (loose equality): **ép kiểu (type coercion)** trước khi so sánh, dễ gây kết quả bất ngờ (`0 == ""` là `true`, `null == undefined` là `true`).

Best practice: luôn dùng `===` trừ khi có lý do rõ ràng.$a$,
 null, null),

-- JS: closure
('closure-la-gi', (select id from public.topics where slug='js-closure'), 'theory', 'junior', 2, 5, 120,
 $q$Closure là gì? Cho ví dụ ứng dụng thực tế.$q$,
 $a$**Closure** là khả năng một hàm "nhớ" và truy cập được các biến ở **lexical scope** nơi nó được định nghĩa, ngay cả khi hàm đó được thực thi ở scope khác.

Ứng dụng thực tế: tạo biến private (data privacy), hàm factory, memoization, và các hook như `useState` của React đều dựa trên closure.$a$,
 $c$function createCounter() {
  let count = 0;              // biến private nhờ closure
  return () => ++count;
}
const inc = createCounter();
inc(); // 1
inc(); // 2$c$, 'js'),

('closure-trong-vong-lap', (select id from public.topics where slug='js-closure'), 'coding', 'mid', 3, 4, 150,
 $q$Vì sao vòng lặp với var in ra toàn số cuối? Cách sửa?$q$,
 $a$Với `var`, chỉ có MỘT biến `i` được chia sẻ (function scope). Khi các callback `setTimeout` chạy (sau vòng lặp), `i` đã bằng giá trị cuối.

Cách sửa: dùng `let` (block scope → mỗi vòng lặp một binding mới), hoặc tạo closure bằng IIFE.$a$,
 $c$// Sai: in 3, 3, 3
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
// Đúng: in 0, 1, 2
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));$c$, 'js'),

-- JS: event loop
('event-loop-hoat-dong', (select id from public.topics where slug='js-event-loop'), 'theory', 'mid', 3, 5, 180,
 $q$Giải thích cơ chế Event Loop trong JavaScript.$q$,
 $a$JS là **single-threaded**. Event Loop cho phép xử lý bất đồng bộ: khi call stack rỗng, nó lấy task từ queue ra chạy.

- **Macrotask queue**: setTimeout, setInterval, I/O, event.
- **Microtask queue**: Promise.then, queueMicrotask, MutationObserver.

Thứ tự: sau mỗi macrotask (hoặc script đồng bộ), engine xử lý HẾT microtask queue rồi mới sang macrotask tiếp theo → microtask luôn ưu tiên.$a$,
 null, null),

('doan-du-output-promise', (select id from public.topics where slug='js-event-loop'), 'coding', 'mid', 4, 5, 120,
 $q$Đoán output: thứ tự in ra là gì?$q$,
 $a$Kết quả: **1, 4, 3, 2**.

- `1`, `4`: code đồng bộ chạy trước.
- `3`: microtask (Promise) chạy trước macrotask.
- `2`: macrotask (setTimeout) chạy cuối cùng.$a$,
 $c$console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);$c$, 'js'),

-- JS: this
('this-trong-arrow-function', (select id from public.topics where slug='js-this'), 'theory', 'mid', 3, 4, 120,
 $q$this trong arrow function khác regular function thế nào?$q$,
 $a$- **Regular function**: `this` được xác định lúc GỌI hàm (dynamic), phụ thuộc cách gọi (method, standalone, new, call/apply/bind).
- **Arrow function**: KHÔNG có `this` riêng — nó "mượn" `this` từ lexical scope bao quanh (lúc ĐỊNH NGHĨA). Không thể đổi bằng bind/call/apply.

Vì vậy arrow function tiện cho callback (giữ nguyên `this` của component/class).$a$,
 null, null),

-- React: hooks
('quy-tac-cua-hooks', (select id from public.topics where slug='react-hooks'), 'theory', 'junior', 2, 5, 90,
 $q$Các quy tắc (Rules of Hooks) khi dùng React Hooks?$q$,
 $a$1. **Chỉ gọi hooks ở top level** — không gọi trong vòng lặp, điều kiện, hay hàm lồng. React dựa vào THỨ TỰ gọi hooks giữa các lần render để map state đúng.
2. **Chỉ gọi hooks trong React function component hoặc custom hook** — không gọi trong hàm JS thường.

Vi phạm → state bị lệch giữa các render. ESLint plugin `react-hooks` giúp bắt lỗi này.$a$,
 null, null),

('useeffect-dependency', (select id from public.topics where slug='react-hooks'), 'coding', 'mid', 3, 5, 150,
 $q$useEffect chạy khi nào? Dependency array ảnh hưởng ra sao?$q$,
 $a$- Không truyền array: effect chạy sau MỌI lần render.
- `[]` (rỗng): chỉ chạy MỘT lần sau mount (và cleanup khi unmount).
- `[a, b]`: chạy sau mount và mỗi khi `a` hoặc `b` thay đổi (so sánh `Object.is`).

Cleanup function (return) chạy trước khi effect chạy lại và khi unmount — dùng để hủy subscription, clear timer.$a$,
 $c$useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []); // chỉ chạy 1 lần$c$, 'jsx'),

-- React: rendering
('vi-sao-can-key-trong-list', (select id from public.topics where slug='react-render'), 'theory', 'mid', 3, 5, 120,
 $q$Vì sao cần prop key khi render list? Dùng index làm key có sao không?$q$,
 $a$`key` giúp React nhận diện phần tử nào thay đổi/thêm/xóa trong quá trình **reconciliation**, tối ưu re-render và giữ đúng state của từng item.

Dùng `index` làm key GÂY BUG khi list có thể sắp xếp lại/thêm/xóa ở giữa: React map sai state (ví dụ input giữ giá trị của item cũ). Nên dùng id ổn định, duy nhất.$a$,
 null, null),

('react-memo-khi-nao-dung', (select id from public.topics where slug='react-render'), 'theory', 'senior', 4, 4, 150,
 $q$React.memo, useMemo, useCallback dùng khi nào? Có nên lạm dụng?$q$,
 $a$- **React.memo**: bọc component, skip re-render nếu props không đổi (shallow compare).
- **useMemo**: cache kết quả tính toán nặng giữa các render.
- **useCallback**: cache tham chiếu hàm (tránh tạo hàm mới mỗi render, hữu ích khi truyền vào child đã memo).

KHÔNG nên lạm dụng: bản thân việc so sánh + lưu cache cũng tốn chi phí và bộ nhớ. Chỉ dùng khi đo được vấn đề performance thực sự (component nặng, re-render thường xuyên).$a$,
 null, null),

-- CSS: box model
('box-sizing-border-box', (select id from public.topics where slug='css-box'), 'theory', 'junior', 1, 5, 90,
 $q$box-sizing: border-box khác content-box thế nào?$q$,
 $a$- **content-box** (mặc định): `width` chỉ tính phần content; padding và border CỘNG THÊM vào kích thước thực → dễ vỡ layout.
- **border-box**: `width` bao gồm cả content + padding + border → dễ kiểm soát kích thước hơn.

Best practice phổ biến: `*, *::before, *::after { box-sizing: border-box; }`.$a$,
 null, null),

-- CSS: flexbox
('flexbox-can-giua', (select id from public.topics where slug='css-flexbox'), 'coding', 'junior', 1, 5, 60,
 $q$Căn giữa một phần tử theo cả chiều ngang và dọc bằng Flexbox?$q$,
 $a$Dùng `justify-content` (căn theo trục chính) và `align-items` (căn theo trục phụ) đều `center`.$a$,
 $c$.parent {
  display: flex;
  justify-content: center; /* ngang (main axis) */
  align-items: center;     /* dọc (cross axis) */
  min-height: 100vh;
}$c$, 'css'),

('flex-grow-shrink-basis', (select id from public.topics where slug='css-flexbox'), 'theory', 'mid', 3, 4, 120,
 $q$flex-grow, flex-shrink, flex-basis nghĩa là gì?$q$,
 $a$Shorthand `flex: <grow> <shrink> <basis>`:
- **flex-grow**: tỉ lệ item "nở" ra khi còn dư không gian (0 = không nở).
- **flex-shrink**: tỉ lệ item "co" lại khi thiếu không gian (0 = không co).
- **flex-basis**: kích thước gốc trước khi grow/shrink (thay cho width theo trục chính).

Ví dụ `flex: 1` = `1 1 0%` → các item chia đều không gian.$a$,
 null, null)

on conflict (slug) do nothing;
