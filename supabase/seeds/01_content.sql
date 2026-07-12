-- supabase/seeds/01_content.sql — bộ câu hỏi phỏng vấn FE (sinh tự động theo taxonomy docs/01).
-- Thứ tự: chạy SAU migrations 0000–0006. Cách chạy: SQL Editor > dán file này > Run.
-- Idempotent (on conflict do nothing). 8 category · 40 topic · 104 câu hỏi.

-- ============ CATEGORIES ============
insert into public.categories (slug, name, description, color, sort_order) values
  ($s$javascript$s$, $s$JavaScript Core$s$, $s$Kiến thức lõi JavaScript: types & coercion, scope & closure, this & binding, prototype, event loop, async/await và quản lý memory.$s$, $s$#f7df1e$s$, 1),
  ($s$typescript$s$, $s$TypeScript$s$, $s$Kiểu tĩnh cho JavaScript: type vs interface, generics, utility types, union & narrowing, type guards, keyof/typeof, mapped types, enum vs const và unknown vs any.$s$, $s$#3178c6$s$, 2),
  ($s$react$s$, $s$React$s$, $s$Thư viyện UI theo hướng component: JSX, hooks, reconciliation, quản lý state và tối ưu performance.$s$, $s$#61dafb$s$, 3),
  ($s$nextjs$s$, $s$Next.js$s$, $s$Framework React full-stack: App Router, Server/Client Components (RSC), cac chien luoc render (SSR/SSG/ISR/CSR), data fetching & caching, server actions va toi uu hoa.$s$, $s$#171717$s$, 4),
  ($s$css$s$, $s$CSS & Layout$s$, $s$Kiến thức layout hiện đại: box model, flexbox, grid, positioning, z-index/stacking context, specificity & cascade, responsive và units (rem/em/vh).$s$, $s$#2965f1$s$, 5),
  ($s$html$s$, $s$HTML & Semantic$s$, $s$HTML ngữ nghĩa (semantic tags), forms & validation, accessibility (a11y/ARIA), meta/SEO, ảnh responsive (srcset/loading/alt), data-*, iframe và script defer/async.$s$, $s$#e34f26$s$, 6),
  ($s$browser-dom$s$, $s$Browser & DOM$s$, $s$Cach trinh duyet render trang (critical rendering path, reflow/repaint), xu ly su kien DOM, luu tru phia client, giao tiep mang (CORS/cache) va toi uu hieu nang.$s$, $s$#f59e0b$s$, 7),
  ($s$web-performance$s$, $s$Web Performance$s$, $s$Tối ưu hiệu năng web: đo và cải thiện Core Web Vitals, giảm bundle size, lazy loading, caching và tối ưu tài nguyên để trang tải nhanh và mượt.$s$, $s$#22c55e$s$, 8)
on conflict (slug) do nothing;

-- ============ TOPICS ============
insert into public.topics (category_id, slug, name, description, level, sort_order) values
  ((select id from public.categories where slug = $s$javascript$s$), $s$js-types-coercion$s$, $s$Types & Coercion$s$, $s$Kiểu dữ liệu, primitive vs reference, ép kiểu (type coercion), so sánh == / ===.$s$, 'junior', 1),
  ((select id from public.categories where slug = $s$javascript$s$), $s$js-scope-closure$s$, $s$Scope, Hoisting & Closure$s$, $s$Lexical scope, hoisting, Temporal Dead Zone (TDZ), closure và ứng dụng.$s$, 'mid', 2),
  ((select id from public.categories where slug = $s$javascript$s$), $s$js-this-prototype$s$, $s$this, Binding & Prototype$s$, $s$Ngữ cảnh this, call/apply/bind, prototype chain và prototypal inheritance.$s$, 'mid', 3),
  ((select id from public.categories where slug = $s$javascript$s$), $s$js-async-eventloop$s$, $s$Event Loop & Async$s$, $s$Event loop, microtask/macrotask, Promise và async/await.$s$, 'senior', 4),
  ((select id from public.categories where slug = $s$javascript$s$), $s$js-patterns-memory$s$, $s$Functional Patterns & Memory$s$, $s$Debounce/throttle, currying, memory leak và garbage collection.$s$, 'senior', 5),
  ((select id from public.categories where slug = $s$typescript$s$), $s$ts-types-vs-interface$s$, $s$Type Alias vs Interface$s$, $s$So sánh type alias và interface: declaration merging, extends vs intersection, khi nào dùng cái nào.$s$, 'junior', 6),
  ((select id from public.categories where slug = $s$typescript$s$), $s$ts-generics$s$, $s$Generics$s$, $s$Type parameter, generic constraint (extends keyof), inference/widening và giữ type safety thay cho any.$s$, 'mid', 7),
  ((select id from public.categories where slug = $s$typescript$s$), $s$ts-utility-types$s$, $s$Utility Types$s$, $s$Partial, Required, Pick, Omit, Record và cách kết hợp để biến đổi type.$s$, 'mid', 8),
  ((select id from public.categories where slug = $s$typescript$s$), $s$ts-narrowing-guards$s$, $s$Union, Narrowing & Type Guards$s$, $s$Thu hẹp union bằng typeof/in/instanceof, user-defined type guard, và unknown vs any.$s$, 'mid', 9),
  ((select id from public.categories where slug = $s$typescript$s$), $s$ts-advanced-operators$s$, $s$keyof, typeof, Mapped Types & enum$s$, $s$Type operator nâng cao: keyof, type query typeof, mapped type, và enum vs const/as const.$s$, 'senior', 10),
  ((select id from public.categories where slug = $s$react$s$), $s$react-jsx-rendering$s$, $s$JSX & Rendering$s$, $s$JSX biên dịch thành gì, cách React render, reconciliation và tầm quan trọng của key.$s$, 'junior', 11),
  ((select id from public.categories where slug = $s$react$s$), $s$react-hooks-core$s$, $s$Hooks cơ bản$s$, $s$useState, useEffect, useRef và Rules of Hooks; các bẫy phổ biến về closure và dependency.$s$, 'mid', 12),
  ((select id from public.categories where slug = $s$react$s$), $s$react-performance$s$, $s$Memoization & Performance$s$, $s$React.memo, useMemo, useCallback, referential equality và khi nào nên/không nên tối ưu.$s$, 'senior', 13),
  ((select id from public.categories where slug = $s$react$s$), $s$react-forms-state$s$, $s$Controlled & Uncontrolled$s$, $s$Form input trong React: controlled vs uncontrolled, single source of truth, ref và defaultValue.$s$, 'mid', 14),
  ((select id from public.categories where slug = $s$react$s$), $s$react-patterns$s$, $s$Patterns nâng cao$s$, $s$Custom hooks, context, error boundary và các pattern tái sử dụng logic.$s$, 'senior', 15),
  ((select id from public.categories where slug = $s$nextjs$s$), $s$nextjs-app-router$s$, $s$App Router & Routing$s$, $s$File conventions trong app/, dynamic routes, route groups, navigation.$s$, 'junior', 16),
  ((select id from public.categories where slug = $s$nextjs$s$), $s$nextjs-rsc$s$, $s$Server & Client Components (RSC)$s$, $s$Phan biet Server vs Client Components, use client/use server boundary, composition.$s$, 'mid', 17),
  ((select id from public.categories where slug = $s$nextjs$s$), $s$nextjs-rendering$s$, $s$Rendering: SSR/SSG/ISR/PPR$s$, $s$Cac chien luoc render, dynamic rendering, streaming va async runtime APIs.$s$, 'senior', 18),
  ((select id from public.categories where slug = $s$nextjs$s$), $s$nextjs-data-caching$s$, $s$Data Fetching, Caching & Server Actions$s$, $s$fetch caching, use cache, revalidation, server actions va mutations.$s$, 'senior', 19),
  ((select id from public.categories where slug = $s$nextjs$s$), $s$nextjs-optimization$s$, $s$Metadata, Images & Proxy$s$, $s$next/image, metadata/SEO va Proxy (Middleware) trong Next.js 16.$s$, 'mid', 20),
  ((select id from public.categories where slug = $s$css$s$), $s$css-box-model$s$, $s$Box Model & Units$s$, $s$Bốn lớp content/padding/border/margin, box-sizing, margin collapsing và các đơn vị rem/em/vh/%.$s$, 'junior', 21),
  ((select id from public.categories where slug = $s$css$s$), $s$css-flexbox-layout$s$, $s$Flexbox$s$, $s$Trục chính/phụ (main/cross axis), justify-content/align-items, flex-grow/shrink/basis, căn chỉnh 1 chiều.$s$, 'junior', 22),
  ((select id from public.categories where slug = $s$css$s$), $s$css-grid-responsive$s$, $s$CSS Grid & Responsive$s$, $s$Grid 2 chiều, fr/minmax/auto-fit, media query và thiết kế mobile-first.$s$, 'mid', 23),
  ((select id from public.categories where slug = $s$css$s$), $s$css-positioning-stacking$s$, $s$Positioning, Stacking & Transitions$s$, $s$position (relative/absolute/fixed/sticky), z-index, stacking context, transition và animation.$s$, 'mid', 24),
  ((select id from public.categories where slug = $s$css$s$), $s$css-specificity-cascade$s$, $s$Specificity, Cascade & Selectors$s$, $s$Cách tính specificity, cascade, !important, inheritance và phân biệt pseudo-class/pseudo-element.$s$, 'senior', 25),
  ((select id from public.categories where slug = $s$html$s$), $s$html-semantic$s$, $s$Semantic Tags$s$, $s$Thẻ ngữ nghĩa: header, nav, main, section, article, aside, footer — ý nghĩa và lợi ích cho SEO/a11y.$s$, 'junior', 26),
  ((select id from public.categories where slug = $s$html$s$), $s$html-forms$s$, $s$Forms & Validation$s$, $s$Form elements, label, input types và HTML5 validation (required, pattern, type, novalidate).$s$, 'mid', 27),
  ((select id from public.categories where slug = $s$html$s$), $s$html-a11y$s$, $s$Accessibility & ARIA$s$, $s$a11y cơ bản, ARIA roles/attributes, keyboard access, alt text cho ảnh.$s$, 'senior', 28),
  ((select id from public.categories where slug = $s$html$s$), $s$html-media-seo$s$, $s$Images, Media & SEO$s$, $s$img srcset/sizes/loading/alt, CLS, meta tags và SEO cơ bản.$s$, 'mid', 29),
  ((select id from public.categories where slug = $s$html$s$), $s$html-embed-perf$s$, $s$Scripts, Embeds & data-*$s$, $s$script defer/async, iframe (sandbox, lazy), data-* attributes và dataset.$s$, 'mid', 30),
  ((select id from public.categories where slug = $s$browser-dom$s$), $s$browser-crp$s$, $s$Critical Rendering Path & Reflow/Repaint$s$, $s$Cach trinh duyet bien HTML/CSS thanh pixel: DOM, CSSOM, render tree, layout, paint, composite; phan biet reflow va repaint, tranh layout thrashing.$s$, 'mid', 31),
  ((select id from public.categories where slug = $s$browser-dom$s$), $s$browser-events$s$, $s$DOM Event Model$s$, $s$Mo hinh su kien DOM: 3 pha capturing/target/bubbling, event delegation, preventDefault vs stopPropagation.$s$, 'junior', 32),
  ((select id from public.categories where slug = $s$browser-dom$s$), $s$browser-storage$s$, $s$Client-side Storage$s$, $s$Luu tru phia client: cookie, localStorage, sessionStorage, IndexedDB - dung luong, vong doi, use case.$s$, 'junior', 33),
  ((select id from public.categories where slug = $s$browser-dom$s$), $s$browser-network$s$, $s$CORS & HTTP Cache$s$, $s$Giao tiep mang cua trinh duyet: same-origin policy, CORS va preflight, HTTP cache (Cache-Control, ETag).$s$, 'mid', 34),
  ((select id from public.categories where slug = $s$browser-dom$s$), $s$browser-perf$s$, $s$Rendering Performance APIs$s$, $s$Toi uu hieu nang: requestAnimationFrame, debounce/throttle cho scroll de tranh jank.$s$, 'mid', 35),
  ((select id from public.categories where slug = $s$web-performance$s$), $s$perf-core-web-vitals$s$, $s$Core Web Vitals$s$, $s$LCP, CLS, INP: ý nghĩa, ngưỡng tốt và cách tối ưu từng metric.$s$, 'mid', 36),
  ((select id from public.categories where slug = $s$web-performance$s$), $s$perf-lazy-code-splitting$s$, $s$Lazy Loading & Code Splitting$s$, $s$Trì hoãn tải tài nguyên, dynamic import, React.lazy/Suspense, native lazy loading.$s$, 'mid', 37),
  ((select id from public.categories where slug = $s$web-performance$s$), $s$perf-bundle-optimization$s$, $s$Tree Shaking & Bundle Analysis$s$, $s$Loại bỏ dead code, điều kiện tree shaking, phân tích và thu nhỏ bundle.$s$, 'senior', 38),
  ((select id from public.categories where slug = $s$web-performance$s$), $s$perf-render-optimization$s$, $s$Memoization & Virtualization$s$, $s$Tránh re-render/tính toán thừa với memoization và render danh sách lớn bằng windowing.$s$, 'senior', 39),
  ((select id from public.categories where slug = $s$web-performance$s$), $s$perf-caching-assets$s$, $s$Caching, Images & Critical CSS$s$, $s$HTTP caching, tối ưu ảnh (format, responsive) và critical CSS để render nhanh.$s$, 'mid', 40)
on conflict (slug) do nothing;

-- ============ QUESTIONS ============
insert into public.questions (slug, topic_id, type, level, difficulty, frequency, prompt_md, answer_md, code_snippet, code_language, answer_format, options, correct_keys) values
  ($s$phan-biet-primitive-va-reference-types$s$, (select id from public.topics where slug = $s$js-types-coercion$s$), 'theory', 'junior', 2, 5, $s$Phân biệt **primitive types** và **reference types** trong JavaScript. Khi gán biến hoặc truyền tham số, chúng khác nhau thế nào?$s$, $s$**Primitive types** (7 loại): `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.
- Lưu **theo giá trị (by value)**, immutable, so sánh theo giá trị.
- Khi gán/truyền tham số → **copy giá trị**, hai biến độc lập.

**Reference types**: `object`, `array`, `function` (nói chung là object).
- Biến chỉ giữ **tham chiếu (pointer)** tới vùng nhớ trên heap.
- Khi gán/truyền tham số → **copy tham chiếu**, cả hai cùng trỏ tới MỘT object → sửa qua biến này thấy ở biến kia.

JavaScript luôn là **pass by value**, nhưng với object thì "value" đó chính là reference (nên hay gọi vui là "pass by reference-value").

```js
let x = 1;
let y = x;   // copy giá trị
y = 2;
console.log(x); // 1

let a = { n: 1 };
let b = a;   // copy tham chiếu
b.n = 2;
console.log(a.n); // 2 (cùng 1 object)
```

Hệ quả cần nhớ: so sánh `{} === {}` là `false` (khác reference); muốn copy độc lập phải dùng shallow copy (`{...obj}`) hoặc deep copy (`structuredClone`).$s$, null, null, null, null, null),
  ($s$quiz-mang-rong-so-sanh-loose-equality$s$, (select id from public.topics where slug = $s$js-types-coercion$s$), 'quiz', 'mid', 4, 3, $s$Biểu thức sau in ra gì?

```js
console.log([] == ![]);
```$s$, $s$Đáp án: **`true`**.

Quá trình **type coercion** từng bước:
1. `![]` → `[]` là object nên luôn **truthy** → `!truthy` = `false`. Biểu thức thành `[] == false`.
2. Toán tử `==` khi so sánh với **boolean** → chuyển boolean sang number: `false` → `0`. Thành `[] == 0`.
3. So sánh object với number → object gọi **ToPrimitive**: `[].toString()` → `''` (chuỗi rỗng). Thành `'' == 0`.
4. So sánh string với number → chuỗi chuyển sang number: `Number('')` → `0`. Thành `0 == 0` → **`true`**.

Đây là ví dụ kinh điển cho thấy vì sao nên tránh `==` và luôn dùng `===`.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"true","explanation":"Đúng. Sau chuỗi coercion: [] == ![] → [] == false → [] == 0 → '' == 0 → 0 == 0 → true."},{"key":"b","text":"false","explanation":"Sai. Trực giác thấy 'mảng rỗng khác phủ định của nó' nhưng coercion biến cả hai vế về 0."},{"key":"c","text":"Ném TypeError","explanation":"Sai. == với object không ném lỗi; nó ép kiểu qua ToPrimitive."},{"key":"d","text":"NaN","explanation":"Sai. == luôn trả về boolean, không bao giờ trả NaN."}]$s$::jsonb, array['a']::text[]),
  ($s$hoisting-var-let-const-va-tdz$s$, (select id from public.topics where slug = $s$js-scope-closure$s$), 'theory', 'junior', 2, 5, $s$Giải thích **hoisting**. `var`, `let`, `const` và **function declaration** được hoisting khác nhau như thế nào? **TDZ** là gì?$s$, $s$**Hoisting**: trong pha biên dịch, JS engine "đưa" các khai báo (declarations) lên đầu scope trước khi chạy code. Lưu ý: chỉ **khai báo** được hoisting, không phải phần **gán giá trị**.

- **`var`**: được hoisting VÀ khởi tạo sẵn là `undefined`. Truy cập trước dòng gán → trả `undefined` (không lỗi).
- **`let` / `const`**: cũng được hoisting nhưng **KHÔNG** khởi tạo. Chúng nằm trong **TDZ (Temporal Dead Zone)** — khoảng từ đầu block đến dòng khai báo. Truy cập trong TDZ → ném `ReferenceError: Cannot access before initialization`.
- **Function declaration** (`function foo(){}`): hoisting **toàn bộ** cả thân hàm → gọi được TRƯỚC khi khai báo.
- **Function expression / arrow** gán vào `var`: chỉ biến được hoisting (= `undefined`), gọi trước → `TypeError: foo is not a function`.

```js
console.log(a); // undefined  (var hoisted = undefined)
console.log(b); // ReferenceError (let trong TDZ)
var a = 1;
let b = 2;
```

TDZ tồn tại để bắt lỗi dùng biến quá sớm — an toàn hơn `var`.$s$, null, null, null, null, null),
  ($s$closure-du-doan-output-bank-account$s$, (select id from public.topics where slug = $s$js-scope-closure$s$), 'coding', 'mid', 3, 5, $s$Đoán output của đoạn code sau và giải thích vì sao `acc.balance` lại như vậy:

```js
function createBankAccount(initial) {
  let balance = initial;
  return {
    deposit(x) { balance += x; return balance; },
    getBalance() { return balance; },
  };
}
const acc = createBankAccount(100);
acc.deposit(50);
console.log(acc.getBalance());
console.log(acc.balance);
```$s$, $s$Output:
```
150
undefined
```

**Giải thích:**
- `balance` là biến cục bộ trong `createBankAccount`. Các method `deposit`/`getBalance` là **closure** — chúng "nhớ" và truy cập được `balance` ở lexical scope nơi định nghĩa, ngay cả sau khi `createBankAccount` đã return.
- `acc.deposit(50)` cộng dồn → `balance = 150`; `getBalance()` đọc đúng `150`.
- `acc.balance` là `undefined` vì object trả về **không có** property tên `balance` — biến `balance` là **private** (chỉ truy cập gián tiếp qua closure). Đây chính là **module pattern / data privacy** — cách tạo biến private cổ điển trong JS (trước khi có `#private fields`).

Điểm cần nhớ: closure giữ tham chiếu tới biến (không phải bản copy giá trị), nên state được duy trì và cô lập giữa các instance khác nhau của `createBankAccount`.$s$, $s$function createBankAccount(initial) {
  let balance = initial;
  return {
    deposit(x) { balance += x; return balance; },
    getBalance() { return balance; },
  };
}
const acc = createBankAccount(100);
acc.deposit(50);
console.log(acc.getBalance());
console.log(acc.balance);$s$, $s$js$s$, null, null, null),
  ($s$quiz-tdz-truy-cap-bien-let-som$s$, (select id from public.topics where slug = $s$js-scope-closure$s$), 'quiz', 'mid', 3, 4, $s$Đoạn code sau in ra gì?

```js
function run() {
  console.log(count);
  let count = 5;
}
run();
```$s$, $s$Đáp án: **Ném `ReferenceError: Cannot access 'count' before initialization`**.

`let count` **được hoisting** lên đầu hàm nhưng KHÔNG được khởi tạo — nó nằm trong **TDZ (Temporal Dead Zone)** từ đầu block đến dòng `let count = 5`. Truy cập `count` trong vùng này → ném `ReferenceError`.

Nếu đổi thành `var count` thì kết quả là `undefined` (var được khởi tạo sẵn là `undefined`), không ném lỗi. Đây là điểm khác biệt cốt lõi giữa `let/const` và `var`.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"undefined","explanation":"Sai. Đó là hành vi của var; let không khởi tạo sẵn undefined."},{"key":"b","text":"5","explanation":"Sai. Dòng log chạy TRƯỚC khi count được gán 5."},{"key":"c","text":"Ném ReferenceError: Cannot access 'count' before initialization","explanation":"Đúng. let bị hoisting nhưng nằm trong TDZ, truy cập trước khai báo → ReferenceError."},{"key":"d","text":"null","explanation":"Sai. JS không bao giờ tự gán null; TDZ ném lỗi thay vì trả giá trị."}]$s$::jsonb, array['c']::text[]),
  ($s$call-apply-bind-khac-nhau-the-nao$s$, (select id from public.topics where slug = $s$js-this-prototype$s$), 'theory', 'mid', 3, 5, $s$Phân biệt `call`, `apply`, `bind`. Khi nào dùng cái nào?$s$, $s$Cả ba đều dùng để **set `this` thủ công** cho hàm.

- **`call(thisArg, arg1, arg2, ...)`**: gọi hàm **ngay lập tức**, truyền các đối số **rời nhau**.
- **`apply(thisArg, [argsArray])`**: gọi hàm **ngay lập tức**, truyền đối số dưới dạng **mảng**.
- **`bind(thisArg, ...args)`**: **KHÔNG** gọi ngay, mà trả về một **hàm mới** đã gắn cố định `this` (và có thể partial application một số args). Gọi sau này.

Mẹo nhớ: **A**pply = **A**rray, **C**all = **C**omma. `bind` = tạo hàm để dùng lại về sau.

```js
function greet(greeting, mark) {
  return `${greeting}, ${this.name}${mark}`;
}
const user = { name: 'An' };

greet.call(user, 'Hi', '!');        // "Hi, An!"
greet.apply(user, ['Hello', '?']);  // "Hello, An?"
const bound = greet.bind(user, 'Hey');
bound('.');                          // "Hey, An."
```

Ứng dụng thực tế: `apply` để "trải" mảng làm đối số (`Math.max.apply(null, arr)` — nay có spread thay thế); `bind` để giữ đúng `this` khi truyền method làm callback (event handler, `setTimeout`).

Lưu ý: arrow function không có `this` riêng nên `call/apply/bind` **không đổi được** `this` của nó.$s$, null, null, null, null, null),
  ($s$prototype-chain-va-prototypal-inheritance$s$, (select id from public.topics where slug = $s$js-this-prototype$s$), 'theory', 'senior', 4, 4, $s$Giải thích **prototype chain** và **prototypal inheritance**. Phân biệt `prototype` và `__proto__`.$s$, $s$**Prototype chain**: mỗi object có một liên kết nội bộ `[[Prototype]]` trỏ tới object khác (prototype của nó). Khi truy cập một property mà object không có, engine đi **ngược lên chuỗi prototype** cho tới khi tìm thấy hoặc gặp `null`. Đó là cách JS kế thừa (**prototypal inheritance**) — không cần class như ngôn ngữ classical.

**Phân biệt hai khái niệm hay nhầm:**
- **`prototype`**: là property CHỈ có trên **function/constructor**. Nó là object sẽ trở thành `[[Prototype]]` của mọi instance tạo bằng `new`.
- **`__proto__`** (hay `Object.getPrototypeOf(obj)`): là **liên kết thực tế** của MỘT object tới prototype của nó.

Quan hệ: `instance.__proto__ === Constructor.prototype`.

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + ' makes a sound'; };

const dog = new Animal('Rex');
dog.speak();                              // tìm thấy trên Animal.prototype
dog.__proto__ === Animal.prototype;       // true
Animal.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__;               // null (đỉnh chuỗi)
```

Chuỗi ví dụ với array: `arr → Array.prototype → Object.prototype → null`.

ES6 `class` chỉ là **syntactic sugar** trên cơ chế prototype này. Dùng `Object.getPrototypeOf`/`Object.create` thay cho `__proto__` (chuẩn hơn, `__proto__` là legacy).$s$, null, null, null, null, null),
  ($s$doan-output-async-await-va-settimeout$s$, (select id from public.topics where slug = $s$js-async-eventloop$s$), 'coding', 'senior', 5, 5, $s$Đoán chính xác thứ tự output:

```js
console.log('start');
setTimeout(() => console.log('timeout'), 0);
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}
async1();
Promise.resolve().then(() => console.log('promise'));
console.log('end');
```$s$, $s$Output:
```
start
async1 start
async2
end
async1 end
promise
timeout
```

**Giải thích theo event loop:**
1. `'start'` — code đồng bộ.
2. `setTimeout` → callback đưa vào **macrotask queue** (chạy sau cùng).
3. Gọi `async1()`: in `'async1 start'`, rồi gọi `async2()` in `'async2'`. `async2` resolve ngay. Gặp `await` → **tạm dừng** `async1`, phần sau `await` (`'async1 end'`) được đưa vào **microtask queue**.
4. `Promise.resolve().then(...)` → `'promise'` đưa vào microtask queue **sau** continuation của `async1`.
5. `'end'` — code đồng bộ cuối cùng.
6. Call stack rỗng → xử lý **hết microtask queue** theo thứ tự: `'async1 end'` rồi `'promise'`.
7. Sang **macrotask**: `'timeout'`.

Mấu chốt: `await` chia hàm async thành các microtask; microtask luôn chạy hết TRƯỚC macrotask (`setTimeout`); thứ tự trong microtask queue theo thứ tự được đưa vào.$s$, $s$console.log('start');
setTimeout(() => console.log('timeout'), 0);
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}
async1();
Promise.resolve().then(() => console.log('promise'));
console.log('end');$s$, $s$js$s$, null, null, null),
  ($s$quiz-thu-tu-microtask-va-macrotask$s$, (select id from public.topics where slug = $s$js-async-eventloop$s$), 'quiz', 'mid', 3, 5, $s$Thứ tự in ra của đoạn code sau là gì?

```js
setTimeout(() => console.log(1), 0);
Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3));
console.log(4);
```$s$, $s$Đáp án: **`4, 2, 3, 1`**.

- `4`: code đồng bộ chạy trước tiên.
- `2`: `.then` đầu tiên là **microtask**, chạy ngay khi call stack rỗng.
- `3`: `.then` thứ hai chỉ được đưa vào microtask queue **sau khi** `.then` đầu hoàn thành → chạy tiếp sau `2` (vẫn trong cùng đợt xả microtask).
- `1`: `setTimeout` là **macrotask**, chỉ chạy sau khi microtask queue rỗng hoàn toàn.

Quy tắc vàng: sau mỗi macrotask (hoặc script đồng bộ), engine **xả sạch toàn bộ microtask queue** rồi mới sang macrotask kế tiếp.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"4, 2, 3, 1","explanation":"Đúng. Sync (4) → microtask chuỗi then (2, 3) → macrotask setTimeout (1)."},{"key":"b","text":"1, 4, 2, 3","explanation":"Sai. setTimeout là macrotask, luôn chạy sau microtask, không thể trước 4."},{"key":"c","text":"4, 1, 2, 3","explanation":"Sai. Microtask (then) phải chạy hết trước macrotask (setTimeout)."},{"key":"d","text":"1, 2, 3, 4","explanation":"Sai. Code đồng bộ (4) luôn chạy trước mọi callback bất đồng bộ."}]$s$::jsonb, array['a']::text[]),
  ($s$promise-all-race-allsettled-any-khac-nhau$s$, (select id from public.topics where slug = $s$js-async-eventloop$s$), 'theory', 'mid', 3, 4, $s$Phân biệt `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`. Mỗi cái dùng khi nào?$s$, $s$Cả bốn nhận vào một iterable các promise:

- **`Promise.all([...])`**: resolve khi **TẤT CẢ** fulfilled → trả mảng kết quả (đúng thứ tự input). **Reject ngay** khi bất kỳ promise nào reject (**fail-fast**). Dùng khi cần tất cả kết quả và một cái fail là hỏng toàn bộ (vd gọi song song nhiều API bắt buộc).

- **`Promise.allSettled([...])`**: đợi **TẤT CẢ** settle (dù fulfilled hay rejected), **không bao giờ reject**. Trả mảng `{status: 'fulfilled', value}` hoặc `{status: 'rejected', reason}`. Dùng khi muốn biết kết quả của mọi cái, kể cả có cái fail (vd gửi nhiều request độc lập, báo cáo cái nào lỗi).

- **`Promise.race([...])`**: settle theo **cái ĐẦU TIÊN settle** (resolve HOẶC reject). Dùng cho timeout: race giữa fetch và một promise reject sau N giây.

- **`Promise.any([...])`**: resolve theo **cái ĐẦU TIÊN fulfilled**; bỏ qua các reject. Chỉ reject bằng `AggregateError` khi **TẤT CẢ** reject. Dùng khi cần "cái nhanh nhất thành công" (vd query nhiều mirror server, lấy cái phản hồi trước).

```js
await Promise.all([p1, p2]);        // cần cả hai
await Promise.allSettled([p1, p2]); // muốn cả hai kết quả dù fail
await Promise.race([fetchData, timeout(5000)]);
await Promise.any([mirror1, mirror2]); // cái đầu tiên OK
```$s$, null, null, null, null, null),
  ($s$implement-debounce-tu-dau$s$, (select id from public.topics where slug = $s$js-patterns-memory$s$), 'coding', 'senior', 4, 5, $s$Tự viết hàm `debounce(fn, delay)`. Giải thích cơ chế và cho biết nó khác **throttle** thế nào.$s$, $s$```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

**Cơ chế:**
- `timer` được giữ nhờ **closure** giữa các lần gọi.
- Mỗi lần hàm được gọi lại, `clearTimeout(timer)` **hủy** lịch chạy trước đó và đặt lại timer mới → `fn` chỉ chạy khi ngừng gọi liên tục trong `delay` ms.
- Dùng `fn.apply(this, args)` để giữ đúng `this` và truyền lại tham số gốc.

**Debounce vs Throttle:**
- **Debounce**: gộp một chuỗi sự kiện, chỉ chạy **1 lần sau khi ngừng** kích hoạt `delay` ms. Dùng cho: search input (đợi user gõ xong), validate form, resize kết thúc.
- **Throttle**: đảm bảo `fn` chạy **tối đa 1 lần mỗi khoảng thời gian**, kể cả khi sự kiện bắn liên tục. Dùng cho: scroll, mousemove, tracking — cần cập nhật đều đặn.

Lưu ý về memory: `setTimeout` giữ closure sống; trong React/component nên `clearTimeout` khi unmount để tránh callback chạy trên component đã hủy (và tránh memory leak).$s$, $s$// Yêu cầu: viết debounce sao cho chỉ chạy fn sau khi ngừng gọi `delay` ms
function debounce(fn, delay) {
  // TODO
}

// Ví dụ dùng:
const onSearch = debounce((q) => console.log('search:', q), 300);
onSearch('a'); onSearch('ab'); onSearch('abc'); // chỉ log 'search: abc'$s$, $s$js$s$, null, null, null),
  ($s$currying-la-gi-va-tu-implement-curry$s$, (select id from public.topics where slug = $s$js-patterns-memory$s$), 'coding', 'mid', 3, 3, $s$**Currying** là gì? Viết hàm `curry(fn)` sao cho `curry(sum)(1)(2)(3)` và `curry(sum)(1, 2)(3)` đều trả về `6` với `sum = (a, b, c) => a + b + c`.$s$, $s$**Currying** là kỹ thuật biến đổi hàm nhiều tham số `f(a, b, c)` thành chuỗi hàm mỗi cái nhận một phần đối số: `f(a)(b)(c)`. Nó cho phép **partial application** (gọi trước một phần đối số, giữ lại hàm chờ phần còn lại).

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);          // đủ đối số → gọi thật
    }
    return (...next) => curried.apply(this, [...args, ...next]); // gom thêm
  };
}

const sum = (a, b, c) => a + b + c;
const cs = curry(sum);
cs(1)(2)(3); // 6
cs(1, 2)(3); // 6
cs(1)(2, 3); // 6
```

**Cơ chế:** `fn.length` là **arity** (số tham số khai báo). Mỗi lần gọi, nếu số đối số đã gom đủ `fn.length` thì chạy `fn`; chưa đủ thì trả về hàm mới (dùng **closure** để nhớ các đối số đã có) chờ nhận thêm.

**Ứng dụng thực tế:** tạo các hàm chuyên biệt từ hàm tổng quát (`const add10 = curry(add)(10)`), viết code point-free, cấu hình sẵn tham số trong functional programming (hợp với `compose`/`pipe`).$s$, $s$const sum = (a, b, c) => a + b + c;

function curry(fn) {
  // TODO: hỗ trợ cả curry(sum)(1)(2)(3) lẫn curry(sum)(1, 2)(3)
}

const cs = curry(sum);
console.log(cs(1)(2)(3)); // 6
console.log(cs(1, 2)(3)); // 6$s$, $s$js$s$, null, null, null),
  ($s$nguyen-nhan-memory-leak-va-garbage-collection$s$, (select id from public.topics where slug = $s$js-patterns-memory$s$), 'theory', 'senior', 4, 3, $s$**Garbage collection** trong JS hoạt động thế nào? Kể các **nguyên nhân memory leak** thường gặp và cách phòng tránh.$s$, $s$**Garbage collection (GC):** JS quản lý bộ nhớ **tự động**. Thuật toán chính là **mark-and-sweep**: bắt đầu từ các **roots** (global object, các biến trên call stack), engine "mark" mọi object **reachable** (còn được tham chiếu tới); những object **không reachable** sẽ bị "sweep" (thu hồi). Nhờ vậy nó xử lý được cả **circular reference** — điều mà reference counting đơn thuần không làm được.

=> Một object bị leak khi nó **vẫn còn reachable** dù logic không còn cần nữa, nên GC không thu hồi.

**Các nguyên nhân memory leak phổ biến:**
1. **Biến global vô tình**: quên `let`/`const` (`x = ...` tạo biến global), hoặc gán vào `window` → sống suốt đời trang.
2. **Timer/interval không clear**: `setInterval` giữ closure (và mọi biến nó tham chiếu) sống mãi. Luôn `clearInterval`/`clearTimeout` khi không dùng.
3. **Event listener không gỡ**: `addEventListener` mà không `removeEventListener` → giữ luôn cả handler và scope liên quan.
4. **Detached DOM nodes**: xóa node khỏi DOM nhưng JS vẫn giữ tham chiếu tới nó (vd trong một biến/array) → không được thu hồi.
5. **Closure giữ object lớn** ngoài ý muốn, hoặc **cache/Map** phình mãi không dọn.

**Cách phòng tránh:** dọn timer/listener khi unmount; dùng **`WeakMap`/`WeakSet`** cho cache key bằng object (entry tự biến mất khi key không còn reachable); tránh biến global; dùng DevTools > Memory (heap snapshot, allocation timeline) để phát hiện leak.

(Trong React: cleanup trong `useEffect` return chính là để chống các leak nhóm 2, 3.)$s$, null, null, null, null, null),
  ($s$ts-phan-biet-type-alias-va-interface$s$, (select id from public.topics where slug = $s$ts-types-vs-interface$s$), 'theory', 'junior', 2, 5, $s$Phân biệt `type` (type alias) và `interface` trong TypeScript. Khi nào nên dùng cái nào?$s$, $s$Cả `interface` và `type` đều mô tả được shape của object, nhưng khác nhau:

- **`interface`**: chuyên mô tả shape của object/class. Hỗ trợ **declaration merging** (khai báo trùng tên sẽ tự động gộp lại). Mở rộng bằng `extends`. Có thể được class `implements`.
- **`type` (type alias)**: linh hoạt hơn — có thể alias cho **bất kỳ** kiểu nào: `union`, `intersection`, primitive, tuple, `mapped type`, `conditional type`... KHÔNG hỗ trợ declaration merging. Mở rộng bằng `&` (intersection).

**Khi nào dùng gì?**
- Dùng `interface` cho public API / shape của object có thể được mở rộng (model, thư viện) — vì dễ merge và extends.
- Dùng `type` khi cần `union`, tuple, hoặc các phép biến đổi type nâng cao (`keyof`, mapped, conditional) mà interface không làm được.

Với object đơn giản, hai cái gần như tương đương — chọn theo convention của team.$s$, null, null, null, null, null),
  ($s$ts-quiz-declaration-merging-interface$s$, (select id from public.topics where slug = $s$ts-types-vs-interface$s$), 'quiz', 'mid', 3, 3, $s$Đoạn code sau biên dịch ra sao? (chú ý hai `interface` cùng tên)$s$, $s$Đáp án: **b**.

`interface` hỗ trợ **declaration merging**: hai (hoặc nhiều) khai báo cùng tên trong cùng scope sẽ được **gộp** thành một interface duy nhất. Ở đây `Box` trở thành `{ width: number; height: number }`, nên object `{ width: 10, height: 20 }` hợp lệ.

- (a) sai: chỉ `type` (type alias) hoặc biến `const`/`class` trùng tên mới báo `Duplicate identifier`; `interface` thì được phép và sẽ merge.
- (c) sai: không có chuyện ghi đè — các member được **cộng dồn**, không thay thế.
- (d) sai: declaration merging tự động, không cần `extends`.$s$, $s$interface Box { width: number; }
interface Box { height: number; }

const b: Box = { width: 10, height: 20 };$s$, $s$ts$s$, 'single_choice', $s$[{"key":"a","text":"Lỗi compile: `Duplicate identifier 'Box'`.","explanation":"Sai: interface được phép trùng tên và sẽ merge, không báo duplicate."},{"key":"b","text":"Hai khai báo được **gộp** (declaration merging) thành `{ width: number; height: number }` → hợp lệ.","explanation":"Đúng: đây là declaration merging của interface."},{"key":"c","text":"`interface Box` thứ hai ghi đè cái đầu, `Box` chỉ còn `{ height: number }`.","explanation":"Sai: các member được cộng dồn chứ không ghi đè."},{"key":"d","text":"Phải dùng `extends` thì hai interface mới gộp được.","explanation":"Sai: merge diễn ra tự động khi trùng tên, không cần extends."}]$s$::jsonb, array['b']::text[]),
  ($s$ts-generics-la-gi-vi-sao-hon-any$s$, (select id from public.topics where slug = $s$ts-generics$s$), 'theory', 'mid', 3, 5, $s$Generics trong TypeScript là gì? Vì sao nên dùng generics thay vì `any`?$s$, $s$**Generics** cho phép viết function / class / type hoạt động với **nhiều kiểu khác nhau** nhưng vẫn **giữ được thông tin kiểu** (type-safe). Ta khai báo một **type parameter** (vd `<T>`); TypeScript sẽ **suy ra (inference)** T lúc gọi, hoặc ta truyền tường minh.

Khác `any`:
- `any` **tắt** type checking → mất hết an toàn kiểu, không có gợi ý/không cảnh báo lỗi.
- Generics **bảo toàn quan hệ** giữa input và output. Vd `identity<T>(x: T): T` trả về đúng kiểu đầu vào, IDE vẫn autocomplete được.

Generics đặc biệt hữu ích cho các cấu trúc container/tiện ích: `Array<T>`, `Promise<T>`, `Map<K, V>`...$s$, $s$function identity<T>(value: T): T {
  return value;
}

const a = identity('hi'); // a: string (T được suy ra là string)
const n = identity(42);   // n: number
// Với any: const a2: any = 'hi' -> mất type, a2.foo.bar không báo lỗi$s$, $s$ts$s$, null, null, null),
  ($s$ts-viet-getproperty-generic-constraint$s$, (select id from public.topics where slug = $s$ts-generics$s$), 'coding', 'mid', 3, 4, $s$Hàm dưới đây chưa an toàn: `key` là `string` bất kỳ và trả về `any`. Hãy viết lại `getProperty` để trả về **đúng kiểu của property**, và **báo lỗi compile** nếu `key` không phải key hợp lệ của `obj`.$s$, $s$Dùng **generic constraint** `K extends keyof T`:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: 'An' };
getProperty(user, 'name'); // kiểu: string
getProperty(user, 'id');   // kiểu: number
getProperty(user, 'age');  // ❌ compile error: 'age' không phải keyof user
```

Giải thích:
- `keyof T` = union các key của T (`'id' | 'name'`).
- `K extends keyof T` ép `key` phải là một trong các key hợp lệ đó → gõ sai tên key sẽ báo lỗi ngay.
- Return type `T[K]` là **indexed access type** = kiểu của property tại key K → chính xác từng field, không còn `any`.$s$, $s$// Chưa an toàn: key là string bất kỳ, trả về any
function getProperty(obj: object, key: string) {
  return (obj as any)[key];
}$s$, $s$ts$s$, null, null, null),
  ($s$ts-quiz-generic-inference-widening$s$, (select id from public.topics where slug = $s$ts-generics$s$), 'quiz', 'senior', 4, 3, $s$Kiểu của `r` được TypeScript suy ra là gì?$s$, $s$Đáp án: **a — `string[]`**.

Khi gọi `wrap('hello')`, TypeScript suy ra `T` từ đối số. Vì tham số chỉ có kiểu `T` (không phải context `const`, không có `as const`), literal `'hello'` bị **widening** thành kiểu rộng hơn là `string`. Do đó return type `T[]` = `string[]`.

- (b) sai: literal type `'hello'` chỉ được giữ khi có `as const`, gán vào `const` với kiểu literal, hoặc dùng const type parameter (`<const T>`).
- (c)/(d) sai: T vẫn được suy ra bình thường từ đối số, không phải `any` hay `unknown`.$s$, $s$function wrap<T>(value: T): T[] {
  return [value];
}

const r = wrap('hello');$s$, $s$ts$s$, 'single_choice', $s$[{"key":"a","text":"`string[]` — T được suy ra rồi **widening** thành `string`.","explanation":"Đúng: literal bị widening vì không có const context."},{"key":"b","text":"`'hello'[]` — T giữ nguyên literal type `'hello'`.","explanation":"Sai: chỉ giữ literal khi có as const / const type parameter."},{"key":"c","text":"`any[]`.","explanation":"Sai: T được inference từ đối số, không phải any."},{"key":"d","text":"`unknown[]`.","explanation":"Sai: không có lý do để T rơi về unknown khi có đối số cụ thể."}]$s$::jsonb, array['a']::text[]),
  ($s$ts-giai-thich-partial-pick-omit-record$s$, (select id from public.topics where slug = $s$ts-utility-types$s$), 'theory', 'mid', 2, 5, $s$Giải thích các utility types thường gặp: `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`.$s$, $s$Đây đều là **mapped type** dựng sẵn giúp biến đổi type mà không phải khai báo lại thủ công:

- **`Partial<T>`**: biến **tất cả** property của T thành optional (`?`). Hữu ích cho hàm update/patch.
- **`Required<T>`**: ngược lại — biến tất cả property thành **bắt buộc** (bỏ `?`).
- **`Pick<T, K>`**: tạo type chỉ gồm **các key K** được chọn từ T.
- **`Omit<T, K>`**: tạo type gồm mọi property của T **trừ** các key K.
- **`Record<K, V>`**: tạo object type với **key kiểu K** và **value kiểu V**. Vd `Record<string, number>` = map string → number.$s$, $s$interface User { id: number; name: string; email: string }

type UserPatch   = Partial<User>;            // mọi field optional
type UserPreview = Pick<User, 'id' | 'name'>; // { id: number; name: string }
type UserNoId    = Omit<User, 'id'>;          // { name, email }
type UserMap     = Record<string, User>;      // { [k: string]: User }$s$, $s$ts$s$, null, null, null),
  ($s$ts-viet-kieu-changes-partial-omit$s$, (select id from public.topics where slug = $s$ts-utility-types$s$), 'coding', 'mid', 3, 4, $s$Cho `interface User { id: string; name: string; age: number }`. Viết kiểu cho tham số `changes` của hàm `updateUser` sao cho `changes` chỉ chứa các field của `User` **trừ `id`**, và tất cả đều **optional**.$s$, $s$Kết hợp `Omit` và `Partial`:

```ts
function updateUser(id: string, changes: Partial<Omit<User, 'id'>>) {
  // changes có kiểu: { name?: string; age?: number }
}

updateUser('u1', { name: 'An' }); // ✅
updateUser('u1', { age: 30 });    // ✅
updateUser('u1', {});             // ✅ (tất cả optional)
updateUser('u1', { id: 'x' });    // ❌ 'id' đã bị Omit loại bỏ
```

Đọc từ trong ra ngoài:
- `Omit<User, 'id'>` → `{ name: string; age: number }`.
- `Partial<...>` → biến tất cả thành optional → `{ name?: string; age?: number }`.

Thứ tự lồng quan trọng: cần loại `id` **trước** rồi mới `Partial`.$s$, $s$interface User { id: string; name: string; age: number }

function updateUser(id: string, changes: /* ??? */) {
  // ...
}$s$, $s$ts$s$, null, null, null),
  ($s$ts-quiz-ket-qua-omit-password$s$, (select id from public.topics where slug = $s$ts-utility-types$s$), 'quiz', 'mid', 2, 4, $s$`PublicUser` có shape như thế nào?$s$, $s$Đáp án: **b — `{ id: number; name: string }`**.

`Omit<T, K>` tạo type gồm mọi property của T **trừ** các key trong K. Ở đây loại bỏ `'password'`, còn lại `id` và `name`.

- (a) sai: `password` đã bị loại bỏ hoàn toàn.
- (c) sai: đó là kết quả của `Pick<User, 'password'>`.
- (d) sai: `Omit` **xoá hẳn** key chứ không biến nó thành optional (biến thành optional là việc của `Partial`).$s$, $s$type User = { id: number; name: string; password: string };
type PublicUser = Omit<User, 'password'>;$s$, $s$ts$s$, 'single_choice', $s$[{"key":"a","text":"`{ id: number; name: string; password: string }`","explanation":"Sai: password đã bị Omit loại bỏ."},{"key":"b","text":"`{ id: number; name: string }`","explanation":"Đúng: Omit xoá key 'password', còn lại id và name."},{"key":"c","text":"`{ password: string }`","explanation":"Sai: đó là kết quả của Pick<User, 'password'>."},{"key":"d","text":"`{ id: number; name: string; password?: string }`","explanation":"Sai: Omit xoá hẳn key, không biến thành optional (đó là Partial)."}]$s$::jsonb, array['b']::text[]),
  ($s$ts-phan-biet-unknown-va-any$s$, (select id from public.topics where slug = $s$ts-narrowing-guards$s$), 'theory', 'junior', 2, 5, $s$Phân biệt `unknown` và `any`. Vì sao nên ưu tiên `unknown`?$s$, $s$Cả hai đều nhận **mọi** giá trị, nhưng mức an toàn khác nhau:

- **`any`**: **tắt hoàn toàn** type checking. Gán đi/lại tự do, truy cập property hay gọi method bất kỳ mà compiler không cảnh báo → dễ gây bug runtime và "lây lan" mất type safety.
- **`unknown`**: là **top type an toàn**. Nhận mọi giá trị NHƯNG **không cho phép dùng trực tiếp** (không truy cập property, không gọi, không gán sang kiểu khác) cho tới khi bạn **narrowing** (bằng `typeof`, `instanceof`, type guard) hoặc type assertion.

```ts
function handle(x: unknown) {
  // x.toUpperCase();      // ❌ lỗi: chưa biết x là gì
  if (typeof x === 'string') {
    x.toUpperCase();       // ✅ đã narrow thành string
  }
}
```

**Ưu tiên `unknown`** cho giá trị chưa rõ kiểu (`JSON.parse`, response API, biến trong `catch`) để **buộc kiểm tra** trước khi dùng, giữ được type safety.$s$, null, null, null, null, null),
  ($s$ts-viet-user-defined-type-guard-is$s$, (select id from public.topics where slug = $s$ts-narrowing-guards$s$), 'coding', 'mid', 3, 4, $s$Type guard predicate `x is Type` dùng để làm gì? Hãy viết một user-defined type guard `isString` và cho ví dụ narrowing.$s$, $s$**User-defined type guard** là hàm trả về `boolean` nhưng có return type đặc biệt dạng **`param is Type`** (type predicate). Nó báo cho compiler: nếu hàm trả `true` thì tham số **được narrow** về `Type` trong nhánh đó.

```ts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

function print(val: unknown) {
  if (isString(val)) {
    val.toUpperCase(); // ✅ val được narrow thành string
  }
}
```

Nếu KHÔNG có `: x is string` (chỉ để return `boolean`), compiler sẽ **không narrow** `val` bên trong `if` — `val` vẫn là `unknown`. Type guard đặc biệt hữu ích khi logic kiểm tra phức tạp (kiểm tra nhiều field của object) mà một mình `typeof`/`instanceof` không diễn tả được.$s$, $s$function isString(x: unknown) {
  return typeof x === 'string';
}
// Mong muốn: sau if (isString(val)) thì val được coi là string$s$, $s$ts$s$, null, null, null),
  ($s$ts-quiz-narrowing-union-typeof$s$, (select id from public.topics where slug = $s$ts-narrowing-guards$s$), 'quiz', 'mid', 2, 4, $s$Đoạn code sau biên dịch và narrow như thế nào?$s$, $s$Đáp án: **b**.

TypeScript dùng **control flow analysis** để narrow union:
- Trong nhánh `if (typeof x === 'string')`, `x` được thu hẹp thành `string` → `x.length` hợp lệ.
- Sau `if` (nhánh còn lại), TypeScript loại `string` khỏi union `string | number`, nên `x` là `number` → `x.toFixed(2)` hợp lệ.

- (a)/(c) sai: nhờ narrowing, không cần assertion và không có lỗi.
- (d) sai: `typeof` guard là một trong những cách narrowing phổ biến nhất.$s$, $s$function fn(x: string | number) {
  if (typeof x === 'string') {
    return x.length;
  }
  return x.toFixed(2);
}$s$, $s$ts$s$, 'single_choice', $s$[{"key":"a","text":"Lỗi: `toFixed` không tồn tại trên `string | number`.","explanation":"Sai: sau if, x đã được narrow thành number."},{"key":"b","text":"Trong `if`, `x` được narrow thành `string`; sau `if`, `x` chỉ còn `number` → cả hai nhánh hợp lệ.","explanation":"Đúng: control flow analysis narrow union theo từng nhánh."},{"key":"c","text":"Cần `(x as number).toFixed(2)` thì mới biên dịch được.","explanation":"Sai: không cần assertion vì đã narrow tự động."},{"key":"d","text":"`typeof x === 'string'` không narrow được union type.","explanation":"Sai: typeof là cách narrowing chuẩn cho primitive."}]$s$::jsonb, array['b']::text[]),
  ($s$ts-keyof-typeof-mapped-type$s$, (select id from public.topics where slug = $s$ts-advanced-operators$s$), 'theory', 'senior', 4, 4, $s$Giải thích `keyof`, type query `typeof`, và **mapped type**. Cho một ví dụ dùng chung cả ba.$s$, $s$- **`keyof T`**: lấy **union các key** của type T dưới dạng literal. Vd `keyof { a: number; b: number }` = `'a' | 'b'`.
- **`typeof value`** (trong ngữ cảnh type): lấy **type từ một biến/giá trị runtime**. Vd `const p = { x: 1 }; type P = typeof p` → `{ x: number }`. (Khác với `typeof` runtime trả về string.)
- **Mapped type**: sinh type mới bằng cách **lặp qua các key**: `{ [K in Keys]: ... }`.

Kết hợp cả ba:

```ts
const config = { host: 'localhost', port: 8080 };
type Config = typeof config;              // { host: string; port: number }
type Keys   = keyof Config;               // 'host' | 'port'

// Mapped type: biến mọi field thành readonly
type ReadonlyConfig = { readonly [K in keyof Config]: Config[K] };
```

Nhiều utility type (`Partial`, `Pick`, `Readonly`, `Record`...) thực chất là **mapped type** kết hợp với `keyof`.$s$, null, null, null, null, null),
  ($s$ts-enum-vs-const-as-const$s$, (select id from public.topics where slug = $s$ts-advanced-operators$s$), 'coding', 'senior', 4, 3, $s$So sánh `enum` với cách dùng object `as const` (hoặc union of string literals) để định nghĩa một tập hằng. Đánh đổi (trade-off) là gì? Khi nào nên chọn cái nào?$s$, $s$**`enum`**:
- **Sinh code runtime** — sau khi biên dịch tạo ra một object JS thực sự → tốn bundle size, khó tree-shake.
- Numeric enum có reverse mapping và kiểu khá "lỏng" trong một số trường hợp.
- Tiện khi cần cả giá trị runtime lẫn kiểu; cú pháp quen thuộc với dev đến từ ngôn ngữ khác.

**`const` object + `as const`** (hoặc **union of string literals**):
- `as const` giữ literal type + `readonly`, cho phép suy ra union `'red' | 'green' | 'blue'`.
- Union literal thuần (`type Color = 'red' | 'green' | 'blue'`) thì **không sinh gì ở runtime**; `as const` object chỉ giữ đúng object bạn khai báo → dễ tree-shake, an toàn kiểu hơn.

**`const enum`**: được **inline** lúc biên dịch (không sinh object) nên nhẹ hơn enum thường, nhưng có hạn chế (không hợp với `isolatedModules`/một số bundler như esbuild ở chế độ mặc định).

**Khuyến nghị hiện đại**: ưu tiên **union of string literals** hoặc **`as const` object** thay cho `enum` để tránh runtime overhead và tăng type safety; chỉ dùng `enum` khi thực sự cần một entity vừa là kiểu vừa là giá trị runtime.$s$, $s$// Cách 1: enum -> sinh object runtime
enum Color { Red, Green, Blue }

// Cách 2: const object + as const -> union literal, gần như không tốn runtime
const Color2 = { Red: 'red', Green: 'green', Blue: 'blue' } as const;
type Color2 = typeof Color2[keyof typeof Color2]; // 'red' | 'green' | 'blue'

// Cách 3: union of string literals -> không có gì ở runtime
type Color3 = 'red' | 'green' | 'blue';$s$, $s$ts$s$, null, null, null),
  ($s$jsx-la-gi-va-bien-dich-thanh-gi$s$, (select id from public.topics where slug = $s$react-jsx-rendering$s$), 'theory', 'junior', 2, 5, $s$JSX là gì? Trình duyệt có hiểu JSX trực tiếp không? Nó được biên dịch (compile) thành gì?$s$, $s$**JSX** là một *syntax extension* của JavaScript, cho phép viết cấu trúc UI trông giống HTML ngay trong file JS. Nó **không phải HTML** và cũng **không phải string** — chỉ là cú pháp thuận tiện (syntactic sugar).

- Trình duyệt **KHÔNG** hiểu JSX trực tiếp. Cần một transpiler (Babel, SWC hoặc TypeScript) biên dịch JSX thành lời gọi hàm JavaScript thuần.
- **Trước React 17** (classic transform): `<div className="a">Hi</div>` → `React.createElement('div', { className: 'a' }, 'Hi')`. Vì vậy ngày trước bắt buộc `import React` khi dùng JSX.
- **Từ React 17+** (new JSX transform): biên dịch thành `_jsx(...)` được import tự động từ `react/jsx-runtime`, nên **không cần** `import React` chỉ để dùng JSX.

Kết quả mỗi lời gọi là một **React element** — một plain object mô tả UI (kiểu, props, children), *chưa* phải DOM node thật. React dùng object này để dựng và cập nhật DOM.$s$, $s$// Bạn viết (JSX):
const el = <h1 className="title">Hello {name}</h1>;

// Babel biên dịch (classic transform) thành:
const el = React.createElement(
  "h1",
  { className: "title" },
  "Hello ",
  name
);$s$, $s$jsx$s$, null, null, null),
  ($s$quiz-dung-index-lam-key-trong-list$s$, (select id from public.topics where slug = $s$react-jsx-rendering$s$), 'quiz', 'mid', 3, 5, $s$Khi render một danh sách mà các phần tử có thể được **thêm/xóa/sắp xếp lại ở giữa**, việc dùng `index` của mảng làm `key` gây ra vấn đề gì?$s$, $s$Đáp án đúng: **b**.

`key` giúp React nhận diện phần tử nào được giữ lại/thêm/xóa trong quá trình **reconciliation**. Khi dùng `index` làm key và danh sách thay đổi thứ tự, cùng một `key` (vd `0`, `1`, `2`) lại trỏ vào item khác → React tưởng đó vẫn là component cũ và **giữ nguyên state/DOM cũ**, gây bug điển hình như input hiển thị giá trị của item khác, hoặc animation/focus sai.

- **a sai**: React *không* khuyến khích index làm key khi list có thể thay đổi; chỉ chấp nhận khi list tĩnh, không sắp xếp lại.
- **c sai**: key không bắt buộc là string (number cũng được) và thiếu/sai key không gây crash, chỉ cảnh báo + bug logic.
- **d sai**: React vẫn render danh sách, vấn đề là map state sai chứ không bỏ qua.

Giải pháp: dùng một **id ổn định, duy nhất** từ dữ liệu làm key.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Không có vấn đề gì, React khuyến khích dùng index làm key.","explanation":"Sai — index chỉ an toàn với list tĩnh, không sắp xếp/chèn/xóa giữa chừng."},{"key":"b","text":"React map sai state/DOM giữa các item khi danh sách đổi thứ tự, gây bug (vd input giữ giá trị của item khác) và re-render kém hiệu quả.","explanation":"Đúng — cùng key trỏ vào item khác khiến React tái sử dụng nhầm instance cũ."},{"key":"c","text":"Ứng dụng crash ngay lập tức vì key bắt buộc phải là string.","explanation":"Sai — key có thể là number; sai key không crash, chỉ gây bug/cảnh báo."},{"key":"d","text":"React bỏ qua toàn bộ danh sách và không render gì cả.","explanation":"Sai — list vẫn render bình thường."}]$s$::jsonb, array['b']::text[]),
  ($s$quiz-doan-nao-vi-pham-rules-of-hooks$s$, (select id from public.topics where slug = $s$react-hooks-core$s$), 'quiz', 'junior', 2, 5, $s$Đoạn code nào dưới đây **VI PHẠM** Rules of Hooks?$s$, $s$Đáp án đúng: **b**.

**Rules of Hooks** yêu cầu:
1. Chỉ gọi hooks ở **top level** — không gọi trong điều kiện (`if`), vòng lặp (`for`), hay hàm lồng nhau.
2. Chỉ gọi hooks trong **React function component** hoặc **custom hook**.

React map state với hook dựa vào **THỨ TỰ gọi** giữa các lần render. Nếu gọi `useEffect` bên trong `if (isReady)` (đáp án **b**), số lượng/thứ tự hooks có thể thay đổi giữa các render → React map state lệch → bug khó lường.

- **a đúng chuẩn**: gọi `useState` ở top level.
- **c đúng chuẩn**: gọi custom hook (tên bắt đầu bằng `use`) ở top level.
- **d đúng chuẩn**: được phép gọi hook bên trong custom hook.

ESLint plugin `eslint-plugin-react-hooks` sẽ tự bắt lỗi kiểu **b**.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Gọi `useState(0)` ở top level của một function component.","explanation":"Hợp lệ — đúng chuẩn Rules of Hooks."},{"key":"b","text":"Gọi `useEffect(...)` bên trong khối `if (isReady) { ... }`.","explanation":"Vi phạm — gọi hook có điều kiện làm thay đổi thứ tự hooks giữa các render."},{"key":"c","text":"Gọi custom hook `useAuth()` ở top level của component.","explanation":"Hợp lệ — custom hook được gọi như hook bình thường."},{"key":"d","text":"Gọi `useState(...)` bên trong một custom hook.","explanation":"Hợp lệ — custom hook được phép gọi các hook khác."}]$s$::jsonb, array['b']::text[]),
  ($s$coding-usestate-cap-nhat-lien-tiep-functional-update$s$, (select id from public.topics where slug = $s$react-hooks-core$s$), 'coding', 'mid', 3, 5, $s$Đoán output: sau khi click 1 lần, `count` bằng bao nhiêu? Giải thích và sửa để nó tăng đúng 3.$s$, $s$Sau **1 click, `count` chỉ tăng lên `1`** (không phải `3`).

Trong một lần render, biến `count` là một hằng số bị "đóng băng" bởi **closure** (ở đây `count = 0`). Cả ba lời gọi `setCount(count + 1)` đều tính `0 + 1 = 1`, tức là *set về 1* ba lần. React còn **batch** (gộp) các setState trong cùng một event handler thành một lần re-render, nên kết quả cuối vẫn là `1`.

**Cách sửa:** dùng **functional update** — truyền một hàm nhận state mới nhất thay vì đọc `count` từ closure:

```jsx
function handleClick() {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
}
```

Mỗi updater nhận giá trị đã được cập nhật từ updater trước (`0→1→2→3`), nên `count` tăng đúng **3**. Quy tắc: khi state mới **phụ thuộc state cũ**, luôn dùng dạng hàm.$s$, $s$function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={handleClick}>{count}</button>;
}$s$, $s$jsx$s$, null, null, null),
  ($s$useref-khac-usestate-nhu-the-nao$s$, (select id from public.topics where slug = $s$react-hooks-core$s$), 'theory', 'mid', 3, 4, $s$`useRef` khác `useState` như thế nào? Khi nào nên dùng `useRef`?$s$, $s$| | `useState` | `useRef` |
|---|---|---|
| Thay đổi giá trị | Qua `setState` → **trigger re-render** | Gán `ref.current = x` → **KHÔNG** re-render |
| Giá trị trả về | `[value, setValue]` | Object ổn định `{ current }` (mutable) |
| Tồn tại qua render | Có | Có (cùng một object suốt vòng đời) |

**Điểm mấu chốt:** thay đổi `ref.current` không làm component render lại, còn `setState` thì có.

**Dùng `useRef` khi:**
1. **Truy cập DOM node**: `<input ref={inputRef} />` rồi `inputRef.current.focus()`.
2. **Lưu giá trị mutable không cần hiển thị**: id của `setInterval`/`setTimeout`, giá trị previous, một instance nào đó — cần giữ qua các render nhưng **không muốn** re-render khi nó đổi.

**Lưu ý:** không nên đọc/ghi `ref.current` *trong lúc render* (đó là side effect, có thể gây kết quả không nhất quán) — hãy dùng trong event handler hoặc trong `useEffect`.$s$, $s$function Timer() {
  const [seconds, setSeconds] = useState(0); // hiển thị → cần state
  const idRef = useRef(null);                // id timer → dùng ref

  useEffect(() => {
    idRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(idRef.current);
  }, []);

  return <p>{seconds}s</p>;
}$s$, $s$jsx$s$, null, null, null),
  ($s$coding-useeffect-gay-vong-lap-vo-han$s$, (select id from public.topics where slug = $s$react-hooks-core$s$), 'coding', 'mid', 3, 4, $s$Vì sao `useEffect` dưới đây gây **vòng lặp vô hạn** (spam request)? Sửa thế nào?$s$, $s$Effect này **thiếu dependency array**, nên nó chạy lại sau **MỌI** lần render. Luồng gây loop:

`render` → `effect chạy` → `fetchUser().then(setUser)` → `setUser` cập nhật state → **re-render** → `effect lại chạy` → ... **lặp vô hạn** và bắn liên tục request.

**Cách sửa:** khai báo dependency array để effect chỉ chạy khi thật sự cần — ở đây là khi `userId` đổi:

```jsx
useEffect(() => {
  let ignore = false;
  fetchUser(userId).then(u => { if (!ignore) setUser(u); });
  return () => { ignore = true; }; // tránh race condition khi userId đổi nhanh
}, [userId]);
```

- `[]`: chỉ chạy 1 lần sau mount.
- `[userId]`: chạy sau mount và mỗi khi `userId` thay đổi.
- Cờ `ignore` (cleanup) tránh set state từ response cũ khi `userId` đổi liên tục.$s$, $s$function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // <-- thiếu dependency array

  return <div>{user?.name}</div>;
}$s$, $s$jsx$s$, null, null, null),
  ($s$phan-biet-usememo-va-usecallback$s$, (select id from public.topics where slug = $s$react-performance$s$), 'theory', 'senior', 4, 5, $s$Phân biệt `useMemo` và `useCallback`. `useCallback(fn, deps)` tương đương với `useMemo` viết như thế nào? Mục đích chính của chúng là gì?$s$, $s$- **`useMemo(factory, deps)`**: cache **GIÁ TRỊ** mà `factory` trả về; chỉ tính lại khi `deps` đổi. Dùng cho: tính toán nặng, hoặc giữ **referential equality** cho object/array truyền xuống child.
- **`useCallback(fn, deps)`**: cache chính **THAM CHIẾU của function**; trả về cùng một function instance giữa các render đến khi `deps` đổi.

**Tương đương:**
```js
useCallback(fn, deps)  ===  useMemo(() => fn, deps)
```
(useCallback chỉ là trường hợp đặc biệt của useMemo dành cho function.)

**Mục đích chính** — giữ *referential equality* (tham chiếu ổn định) để:
1. Child bọc `React.memo` không bị re-render thừa vì props "đổi tham chiếu".
2. Function/value ổn định làm **dependency** của `useEffect`/`useMemo` khác (tránh chạy lại ngoài ý muốn).

**Không nên lạm dụng:** bản thân memoization có chi phí (so sánh deps + giữ cache trong bộ nhớ). Chỉ dùng khi đo được vấn đề performance thật sự, hoặc khi cần tham chiếu ổn định về mặt logic.$s$, null, null, null, null, null),
  ($s$coding-react-memo-bi-vo-hieu-do-inline-props$s$, (select id from public.topics where slug = $s$react-performance$s$), 'coding', 'senior', 4, 4, $s$`Child` đã được bọc `React.memo` nhưng vẫn re-render mỗi khi bấm nút tăng `n` ở `Parent`. Vì sao? Sửa thế nào?$s$, $s$`React.memo` chỉ **shallow-compare** props. Mỗi lần `Parent` render (khi `n` đổi), nó tạo **MỚI**:
- `onClick={() => doSomething()}` → một arrow function mới (tham chiếu khác).
- `style={{ color: 'red' }}` → một object literal mới (tham chiếu khác).

Dù giá trị logic không đổi, **tham chiếu** khác nhau nên `memo` coi như props đã đổi → `Child` vẫn re-render.

**Cách sửa:** ổn định tham chiếu bằng `useCallback` (cho function) và `useMemo` hoặc hằng ngoài component (cho object):

```jsx
const STYLE = { color: 'red' }; // hằng, tạo 1 lần

function Parent() {
  const [n, setN] = useState(0);
  const handleClick = useCallback(() => doSomething(), []);
  return (
    <>
      <button onClick={() => setN(n + 1)}>{n}</button>
      <Child onClick={handleClick} style={STYLE} />
    </>
  );
}
```
Giờ `handleClick` và `STYLE` giữ nguyên tham chiếu qua các render → `memo` shallow-compare thấy props không đổi → `Child` bỏ qua re-render.$s$, $s$const Child = React.memo(({ onClick, style }) => {
  console.log('render Child');
  return <button onClick={onClick} style={style}>Click</button>;
});

function Parent() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n + 1)}>{n}</button>
      <Child onClick={() => doSomething()} style={{ color: 'red' }} />
    </>
  );
}$s$, $s$jsx$s$, null, null, null),
  ($s$quiz-usememo-co-dam-bao-cache-vinh-vien-khong$s$, (select id from public.topics where slug = $s$react-performance$s$), 'quiz', 'senior', 4, 3, $s$Phát biểu nào **ĐÚNG** về `useMemo`?$s$, $s$Đáp án đúng: **b**.

Theo React docs, `useMemo` là một **performance optimization**, *không phải* một *semantic guarantee*. React có quyền **loại bỏ cache** (vd để giải phóng bộ nhớ, hoặc trong tương lai với các tính năng như offscreen) và **tính lại** factory. Vì vậy code phải chạy đúng *ngay cả khi useMemo tính lại* — **không đặt side effect** hay logic bắt buộc bên trong nó.

- **a sai**: không có bảo đảm cache "vĩnh viễn"; React có thể quên giá trị đã memo.
- **c sai**: factory của `useMemo` chạy **trong lúc render** (đồng bộ), khác hẳn `useEffect` (chạy sau khi commit/paint).
- **d sai**: ngược lại — `useMemo` cache **giá trị**, `useCallback` cache **function**.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"useMemo đảm bảo giá trị được cache VĨNH VIỄN, không bao giờ tính lại nếu deps không đổi.","explanation":"Sai — React có thể discard cache và tính lại."},{"key":"b","text":"useMemo chỉ là gợi ý tối ưu; React có thể loại bỏ cache và tính lại, nên không được dùng như một bảo đảm ngữ nghĩa (đừng đặt side effect trong đó).","explanation":"Đúng — đây chính là điều React docs nhấn mạnh."},{"key":"c","text":"Factory của useMemo chạy sau khi component mount, giống useEffect.","explanation":"Sai — nó chạy đồng bộ trong lúc render."},{"key":"d","text":"useMemo dùng để cache function, còn useCallback dùng để cache giá trị.","explanation":"Sai — ngược lại."}]$s$::jsonb, array['b']::text[]),
  ($s$phan-biet-controlled-va-uncontrolled-component$s$, (select id from public.topics where slug = $s$react-forms-state$s$), 'theory', 'mid', 3, 5, $s$Phân biệt **controlled component** và **uncontrolled component** (form input) trong React. Khi nào dùng cái nào?$s$, $s$- **Controlled component**: giá trị input do **React state** điều khiển — `value={state}` kèm `onChange` cập nhật state. React là **single source of truth**. Ưu điểm: dễ validate real-time, format, disable nút submit, đồng bộ nhiều field, reset dễ dàng.

```jsx
const [name, setName] = useState('');
<input value={name} onChange={e => setName(e.target.value)} />
```

- **Uncontrolled component**: DOM tự giữ giá trị; đọc khi cần qua **ref** (`ref.current.value`) và đặt giá trị khởi tạo bằng `defaultValue`. Ưu điểm: ít code hơn, gần với form HTML truyền thống, hợp cho form đơn giản.

```jsx
const inputRef = useRef(null);
<input defaultValue="John" ref={inputRef} />
// đọc: inputRef.current.value
```

**Lưu ý quan trọng:**
- `<input type="file">` **luôn** uncontrolled (giá trị chỉ set được bởi người dùng).
- Truyền `value` mà **thiếu** `onChange` → input read-only, React sẽ cảnh báo.
- **Không** được chuyển qua lại controlled ⇄ uncontrolled trong vòng đời (vd `value` từ `undefined` sang có giá trị) → React cảnh báo.

**Khuyến nghị:** ưu tiên **controlled** cho hầu hết trường hợp cần validate/đồng bộ; dùng uncontrolled cho form đơn giản hoặc khi tích hợp thư viện ngoài.$s$, null, null, null, null, null),
  ($s$coding-input-controlled-khong-go-duoc$s$, (select id from public.topics where slug = $s$react-forms-state$s$), 'coding', 'junior', 2, 4, $s$Vì sao `<input>` dưới đây **không gõ được** (giá trị không thay đổi khi người dùng nhập)? Sửa thế nào?$s$, $s$Vì `value={name}` biến input thành **controlled** — giá trị bị khóa theo state `name`. Nhưng component **thiếu `onChange`**, nên khi người dùng gõ, state `name` không bao giờ cập nhật → React ép input về lại `''` sau mỗi lần render → input như bị **đóng băng** (read-only). React cũng in cảnh báo về việc này.

**Cách sửa 1 — controlled (khuyến nghị):** thêm `onChange` để cập nhật state.

```jsx
function NameField() {
  const [name, setName] = useState('');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

**Cách sửa 2 — uncontrolled:** nếu không cần React quản lý, dùng `defaultValue` thay cho `value`.

```jsx
<input defaultValue="" />
```$s$, $s$function NameField() {
  const [name, setName] = useState('');
  return <input value={name} />;
}$s$, $s$jsx$s$, null, null, null),
  ($s$error-boundary-bat-va-khong-bat-loi-gi$s$, (select id from public.topics where slug = $s$react-patterns$s$), 'theory', 'senior', 4, 4, $s$**Error Boundary** là gì? Nó **bắt được** và **KHÔNG bắt được** những loại lỗi nào?$s$, $s$**Error Boundary** là một component (hiện phải là **class component**, dùng `static getDerivedStateFromError` và/hoặc `componentDidCatch`) dùng để **bắt lỗi JavaScript trong quá trình render/lifecycle của cây con** và hiển thị **fallback UI** thay vì làm sập (unmount) toàn bộ app.

**BẮT được lỗi trong:**
- Quá trình **render**.
- Các **lifecycle methods**.
- **Constructor** của các component con nằm bên dưới nó.

**KHÔNG bắt được:**
1. **Event handlers** (vd `onClick`) — dùng `try/catch` thông thường.
2. **Code bất đồng bộ** (`setTimeout`, `Promise`, `async/await`, `requestAnimationFrame`).
3. **Server-Side Rendering (SSR)**.
4. Lỗi ném ra từ **chính error boundary đó** (chỉ bắt lỗi của cây con, không bắt lỗi của bản thân).

**Lưu ý:** React chưa có Hook chính thức để tạo error boundary trong function component, nên thực tế thường dùng thư viện `react-error-boundary` (bọc lại class boundary) cho tiện.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info); }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```$s$, null, null, null, null, null),
  ($s$custom-hook-chia-se-logic-khong-chia-se-state$s$, (select id from public.topics where slug = $s$react-patterns$s$), 'theory', 'mid', 3, 4, $s$**Custom hook** là gì? Hai component cùng dùng một custom hook có **chia sẻ state** với nhau không?$s$, $s$**Custom hook** là một function có tên bắt đầu bằng `use` và gọi các hook khác (`useState`, `useEffect`...) bên trong, nhằm **tái sử dụng LOGIC có state** giữa các component.

**Điểm mấu chốt — chia sẻ *logic*, KHÔNG chia sẻ *state*:** mỗi lần gọi custom hook tạo ra một **state độc lập**. Hai component cùng dùng `useCounter()` sẽ có counter **riêng biệt**, thay đổi cái này không ảnh hưởng cái kia. (Muốn *chia sẻ state thật* giữa nhiều component → dùng **Context** hoặc một state manager như Zustand/Redux.)

**Quy tắc:**
- Tên **bắt buộc** bắt đầu bằng `use` để React/ESLint nhận diện và áp dụng Rules of Hooks.
- Vẫn tuân thủ Rules of Hooks (gọi ở top level).
- Giá trị trả về tùy ý (array như `useState`, hoặc object).

```jsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const inc = useCallback(() => setCount(c => c + 1), []);
  return { count, inc };
}

// A và B có state riêng, độc lập hoàn toàn:
function A() { const { count, inc } = useCounter(); /* ... */ }
function B() { const { count, inc } = useCounter(); /* ... */ }
```$s$, null, null, null, null, null),
  ($s$nextjs-file-conventions-app-router$s$, (select id from public.topics where slug = $s$nextjs-app-router$s$), 'theory', 'junior', 2, 5, $s$Trong App Router (thu muc `app/`), neu vai tro cua cac file quy uoc dac biet: `page`, `layout`, `template`, `loading`, `error`, `not-found`, `route`.$s$, $s$Cac file co ten quy uoc trong moi route segment:

- **`page.tsx`**: UI cua route segment va lam segment do truy cap duoc (public). Khong co `page` thi folder chi la mot phan cua URL, khong render trang.
- **`layout.tsx`**: UI dung chung bao quanh cac page con. Layout GIU NGUYEN state va khong re-mount khi dieu huong giua cac route con. Root layout `app/layout.tsx` la bat buoc va phai chua the `<html>` va `<body>`.
- **`template.tsx`**: giong layout nhung TAO MOI instance moi lan dieu huong (re-mount, reset state) - dung khi can chay lai effect/animation moi lan vao route.
- **`loading.tsx`**: fallback UI, Next tu dong boc page trong `<Suspense>`; hien khi segment dang tai/stream.
- **`error.tsx`**: Error Boundary cho segment (phai la Client Component), bat loi runtime luc render.
- **`not-found.tsx`**: UI khi goi `notFound()` hoac khong khop route.
- **`route.ts`**: dinh nghia API endpoint (Route Handler) voi cac method `GET`, `POST`... KHONG the cung ton tai voi `page.tsx` trong cung mot segment.

Ngoai ra co file-based metadata (`favicon`, `opengraph-image`, `sitemap`, `robots`) va `default.tsx` (cho parallel routes).$s$, null, null, null, null, null),
  ($s$nextjs-cu-phap-thu-muc-routing$s$, (select id from public.topics where slug = $s$nextjs-app-router$s$), 'quiz', 'junior', 2, 4, $s$Trong App Router, cu phap ten thu muc nao tao mot **catch-all route** khop nhieu doan path (vi du `/docs/a/b/c`)?$s$, $s$Dap an dung: **b) `[...slug]`**.

- **`[...slug]`** la catch-all: khop `/docs/a`, `/docs/a/b`, `/docs/a/b/c`... `params.slug` la mot **mang** `['a','b','c']`.
- **`[slug]`** (a) SAI: dynamic segment chi khop DUNG MOT doan (`/docs/a`), `params.slug` la string.
- **`[[...slug]]`** (c) la **optional catch-all**: giong catch-all nhung khop CA route goc `/docs` (khi khong co tham so). Chi dung khi can khop ca path rong.
- **`(slug)`** (d) SAI: do la **route group** - dung de nhom route/chia layout ma KHONG them doan nao vao URL.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"[slug]","explanation":"Dynamic segment chi khop dung mot doan path, khong phai catch-all."},{"key":"b","text":"[...slug]","explanation":"Dung: catch-all, params.slug la mang cac doan path."},{"key":"c","text":"[[...slug]]","explanation":"La optional catch-all (khop ca route goc khi khong co tham so), khong phai catch-all co ban."},{"key":"d","text":"(slug)","explanation":"La route group, dung de to chuc/chia layout, khong them vao URL."}]$s$::jsonb, array['b']::text[]),
  ($s$nextjs-server-vs-client-components$s$, (select id from public.topics where slug = $s$nextjs-rsc$s$), 'theory', 'mid', 3, 5, $s$Phan biet **Server Components (RSC)** va **Client Components** trong Next.js App Router. Moi loai lam duoc / khong lam duoc gi?$s$, $s$Mac dinh MOI component trong `app/` la **Server Component (RSC)**.

**Server Components:**
- Chay TREN SERVER, khong gui JS xuong client -> giam bundle, cai thien FCP.
- Co the la ham `async`, fetch truc tiep DB/API gan nguon, dung secret (API key) an toan vi khong lo ra client.
- KHONG dung duoc: state/lifecycle hook (`useState`, `useEffect`), event handler (`onClick`, `onChange`), browser API (`window`, `localStorage`), React context.

**Client Components** (khai bao `"use client"` o dau file):
- Duoc prerender thanh HTML o server (SSR) roi **hydrate** o client de co tuong tac.
- Dung duoc state, event handler, effect, browser API, context, custom hooks.
- Bi tinh vao JS bundle gui xuong client.

**Nguyen tac composition:** giu Server Component lam mac dinh, chi day phan can tuong tac xuong Client Component (dat `"use client"` cang sau/nho cang tot). Truyen data tu Server -> Client qua **props** (phai serializable), va co the long Server Component vao Client Component qua `children`/prop (Server Component duoc render o server roi truyen output xuong).$s$, null, null, null, null, null),
  ($s$nextjs-use-client-boundary-rules$s$, (select id from public.topics where slug = $s$nextjs-rsc$s$), 'quiz', 'mid', 3, 4, $s$Phat bieu nao DUNG ve directive `"use client"` va ranh gioi Server/Client trong Next.js?$s$, $s$Dap an dung: **b**.

- **(b) DUNG**: `"use client"` danh dau mot RANH GIOI (boundary). Mot khi file co directive nay, tat ca module no import va component no render truc tiep deu duoc dua vao client bundle - khong can lap lai directive o tung file con.
- **(a) SAI**: chi can dat `"use client"` o entry point cua ranh gioi; cac component con duoc import tu dong tro thanh client.
- **(c) SAI**: van co the long Server Component vao cay cua Client Component bang cach truyen qua `children`/prop. Server Component do duoc render o server, roi output duoc truyen xuong Client Component.
- **(d) SAI**: Client Component VAN duoc prerender thanh HTML o server cho lan load dau (SSR), sau do moi hydrate o client. `"use client"` khong co nghia la 'chi chay o client'.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Phai them \"use client\" vao MOI component muon chay o client, ke ca component con duoc import.","explanation":"Sai: chi can o entry point cua boundary, con import tu dong thanh client."},{"key":"b","text":"Khi mot file co \"use client\", tat ca module no import va component no render truc tiep deu nam trong client bundle.","explanation":"Dung: directive danh dau boundary, moi thu ben trong boundary thanh client."},{"key":"c","text":"Khong the render mot Server Component ben trong cay cua Client Component bang bat ky cach nao.","explanation":"Sai: co the long qua children/prop, Server Component render o server roi truyen output."},{"key":"d","text":"\"use client\" khien component chi chay o client va KHONG duoc render HTML o server.","explanation":"Sai: Client Component van duoc prerender thanh HTML o server (SSR) roi hydrate."}]$s$::jsonb, array['b']::text[]),
  ($s$nextjs-loi-usestate-server-component$s$, (select id from public.topics where slug = $s$nextjs-rsc$s$), 'coding', 'mid', 3, 4, $s$Doan code sau bao loi khi build/run. Vi sao va sua the nao?$s$, $s$**Nguyen nhan:** file trong `app/` mac dinh la **Server Component**, nhung `useState` va `onClick` chi dung duoc trong **Client Component**. Server Component khong co state / event handler nen Next.js bao loi kieu: *"You're importing a component that needs `useState`. This React hook only works in a Client Component. To fix, mark the file with the `"use client"` directive."*

**Cach sua:** them directive `"use client"` o dau file:

```tsx
'use client'
import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**Tot hon** (giu bundle nho): tach phan tuong tac ra mot Client Component rieng (`Counter`) va import vao Page (van la Server Component), thay vi bien ca trang thanh client.$s$, $s$// app/counter/page.tsx
import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}$s$, $s$tsx$s$, null, null, null),
  ($s$nextjs-ssr-ssg-isr-csr$s$, (select id from public.topics where slug = $s$nextjs-rendering$s$), 'theory', 'senior', 3, 5, $s$So sanh 4 chien luoc render trong Next.js: **SSG (Static)**, **SSR (Dynamic/request-time)**, **ISR**, va **CSR**. Khi nao dung loai nao?$s$, $s$- **SSG / Static Rendering** (mac dinh cua App Router): HTML duoc prerender luc BUILD (hoac lam moi nen), tai su dung cho moi request -> nhanh nhat, cache CDN tot. Dung cho noi dung it doi: landing, blog, docs.
- **SSR / Dynamic Rendering**: HTML render lai O MOI REQUEST tren server. Tu kich hoat khi component dung **runtime API** (`cookies()`, `headers()`, `searchParams`) hoac du lieu khong duoc cache. Dung cho noi dung phu thuoc user/request: dashboard, gia real-time.
- **ISR (Incremental Static Regeneration)**: trang static nhung tu lam moi theo thoi gian (`cacheLife` / `next.revalidate`) hoac on-demand (`revalidateTag` / `revalidatePath`). Ket hop toc do cua static voi du lieu tuong doi moi, khong can build lai toan site.
- **CSR (Client-Side Rendering)**: render/fetch o client (trong Client Component voi `useEffect` hoac SWR/React Query). Dung cho phan rat dong, phu thuoc trang thai client, hoac khong can SEO.

**Next.js 16** con co **PPR (Partial Prerendering)** - mac dinh khi bat Cache Components: mot route vua co **static shell** (prerender) vua co cac **hole** dong duoc stream luc request, ket hop uu diem static + dynamic trong CUNG mot trang.$s$, null, null, null, null, null),
  ($s$nextjs-async-params-cookies-await$s$, (select id from public.topics where slug = $s$nextjs-rendering$s$), 'coding', 'senior', 4, 4, $s$Doan code sau (Next.js 15/16) khong chay dung. Chi ra van de va sua lai. Viec doc `cookies()` anh huong the nao toi rendering cua route?$s$, $s$**Van de:** tu Next.js 15 tro di, cac **runtime API** nhu `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` deu la **bat dong bo** - tra ve Promise va phai `await`. Truy cap truc tiep (`params.slug`, `cookies().get(...)`) se sai type va khong lay duoc gia tri. Component cung phai la `async`.

**Sua:**

```tsx
import { cookies } from 'next/headers'

export default async function Page({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const theme = (await cookies()).get('theme')?.value
  return <h1>{slug} - {theme}</h1>
}
```

**Ve rendering:** doc `cookies()` (mot runtime API) khien phan do KHONG the prerender tinh -> route chuyen sang **dynamic rendering** (render luc request). Voi **Cache Components** (Next 16), ban phai boc phan doc cookie trong `<Suspense>` de no stream luc request, trong khi phan con lai van nam trong static shell (PPR); neu khong se gap loi *"Uncached data was accessed outside of <Suspense>"*.$s$, $s$// app/blog/[slug]/page.tsx
import { cookies } from 'next/headers'

export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const theme = cookies().get('theme')?.value
  return <h1>{slug} - {theme}</h1>
}$s$, $s$tsx$s$, null, null, null),
  ($s$nextjs-fetch-cache-mac-dinh$s$, (select id from public.topics where slug = $s$nextjs-data-caching$s$), 'coding', 'mid', 3, 4, $s$Trong Next.js App Router (khong bat Cache Components), hai loi goi `fetch` sau co duoc cache khong? Muon cache thi lam sao?$s$, $s$- **`a`**: **KHONG duoc cache**. Tu Next.js 15, mac dinh `fetch` khong con duoc cache nua (truoc do Next 13/14 mac dinh cache = `force-cache`). Moi request se goi lai API.
- **`b`**: **duoc cache** vi set `cache: 'force-cache'` -> luu vao Data Cache va tai su dung.

**Cac tuy chon lien quan:**
- `{ cache: 'no-store' }`: khong cache (chinh la mac dinh hien tai).
- `{ cache: 'force-cache' }`: cache lau dai (den khi revalidate).
- `{ next: { revalidate: 60 } }`: cache va tu lam moi sau 60s (ISR o muc fetch).
- `{ next: { tags: ['posts'] } }`: gan tag de revalidate on-demand bang `revalidateTag('posts')`.

Voi ham KHONG dung `fetch` (query DB truc tiep), dung `unstable_cache` (mo hinh cu) hoac directive `"use cache"` + `cacheLife`/`cacheTag` (Cache Components, Next 16).$s$, $s$// app/page.tsx (Server Component)
const a = await fetch('https://api.example.com/posts')
const b = await fetch('https://api.example.com/config', { cache: 'force-cache' })$s$, $s$ts$s$, null, null, null),
  ($s$nextjs-revalidatetag-vs-updatetag$s$, (select id from public.topics where slug = $s$nextjs-data-caching$s$), 'quiz', 'senior', 4, 3, $s$Sau khi user submit form tao bai viet bang **Server Action** va ban muon ho THAY NGAY thay doi cua chinh minh (read-your-own-writes), API nao phu hop nhat de lam moi cache da gan tag?$s$, $s$Dap an dung: **b) `updateTag('posts')`**.

- **(b) `updateTag`** DUNG: no **het han cache NGAY LAP TUC** (immediate expiration), hop voi kich ban read-your-own-writes de user thay dung du lieu vua ghi. Chi dung duoc trong **Server Action**.
- **(a) `revalidateTag`** dung co che **stale-while-revalidate** - co the van tra noi dung CU trong khi lam moi o nen, nen user co the chua thay ngay thay doi cua minh. Hop cho lam moi nen (blog, catalog) va dung duoc ca trong Route Handler.
- **(c) `revalidatePath`** lam moi theo path, kem chinh xac hon (de invalidate thua) va cung khong dam bao 'thay ngay' nhu `updateTag`. Nen uu tien tag khi da biet tag.
- **(d) `router.refresh()`** la API phia CLIENT (`useRouter` tu `next/navigation`), khong the goi ben trong Server Action (chay o server).$s$, null, null, 'single_choice', $s$[{"key":"a","text":"revalidateTag('posts')","explanation":"Dung stale-while-revalidate - co the tra noi dung cu, khong dam bao thay ngay."},{"key":"b","text":"updateTag('posts')","explanation":"Dung: het han cache ngay lap tuc, hop read-your-own-writes, chi dung trong Server Action."},{"key":"c","text":"revalidatePath('/posts')","explanation":"Lam moi theo path, kem chinh xac va khong dam bao thay ngay bang updateTag."},{"key":"d","text":"router.refresh() trong Server Action","explanation":"router.refresh la API client (next/navigation), khong goi duoc trong Server Action."}]$s$::jsonb, array['b']::text[]),
  ($s$nextjs-server-actions-use-server$s$, (select id from public.topics where slug = $s$nextjs-data-caching$s$), 'theory', 'mid', 3, 4, $s$**Server Action** la gi? Cach khai bao, cach goi, va can luu y gi ve bao mat?$s$, $s$**Server Action** (mot dang React Server Function) la ham `async` chay TREN SERVER, co the goi tu client qua network. Khai bao bang directive `"use server"`:

- Dat `"use server"` o dau THAN mot ham async (inline trong Server Component), hoac o dau FILE de danh dau MOI export cua file la Server Action (de import vao Client Component).
- **Cach goi** pho bien: qua `<form action={createPost}>` hoac prop `formAction` cua button; khi do Next tu boc trong `startTransition`. Cung co the goi nhu ham thuong tu Client Component.
- Chay bang HTTP **`POST`**; tra ve UI moi + data trong MOT server roundtrip.
- Uu diem: ho tro **progressive enhancement** - form van submit duoc ngay ca khi JS chua load / bi tat.

**Bao mat QUAN TRONG:** Server Action la mot endpoint POST cong khai, co the bi goi truc tiep KHONG qua UI cua ban. Vi vay PHAI tu kiem tra **authentication/authorization** va **validate input** BEN TRONG moi action - khong tin du lieu tu client. Thuong ket hop `revalidateTag`/`updateTag`/`revalidatePath` de lam moi cache va `redirect()` sau khi mutate xong.$s$, null, null, null, null, null),
  ($s$nextjs-image-optimization-cls$s$, (select id from public.topics where slug = $s$nextjs-optimization$s$), 'theory', 'mid', 2, 4, $s$Component `next/image` (`<Image>`) mang lai loi ich gi so voi the `<img>` thuong? Vi sao thuong phai cung cap `width`/`height`, va can cau hinh gi de dung anh remote?$s$, $s$`<Image>` (tu `next/image`) mo rong `<img>` voi:

- **Size optimization**: tu resize dung kich thuoc theo thiet bi va phuc vu dinh dang hien dai (WebP/AVIF).
- **Visual stability**: tu dong chong **layout shift (CLS)** khi anh dang tai.
- **Lazy loading** goc cua trinh duyet (chi tai khi anh vao viewport) + tuy chon `placeholder="blur"` (blur-up).
- Toi uu/resize anh on-demand, ke ca anh tu server remote.

**Vi sao can `width`/`height`:** de Next biet **ti le khung hinh (aspect ratio)** va chua san cho, tranh CLS. Voi **anh import tinh** (`import pic from './pic.png'`), Next tu suy ra width/height va `blurDataURL` nen co the bo qua. Voi anh **remote** (src la URL string) phai cung cap `width`/`height` thu cong, HOAC dung prop `fill` de anh lap day phan tu cha (cha can `position: relative`).

**Anh remote:** phai khai bao `images.remotePatterns` trong `next.config.ts` (protocol/hostname/pathname...) de cho phep domain do - la bien phap bao mat tranh lam dung. Nen dung prop `priority` cho anh above-the-fold (LCP) de tat lazy-load va preload som.$s$, null, null, null, null, null),
  ($s$nextjs-proxy-thay-middleware$s$, (select id from public.topics where slug = $s$nextjs-optimization$s$), 'quiz', 'mid', 3, 3, $s$Trong Next.js 16, phat bieu nao DUNG ve **Proxy** (truoc day goi la Middleware)?$s$, $s$Dap an dung: **a**.

- **(a) DUNG**: tu Next.js 16, Middleware duoc doi ten thanh **Proxy** (chuc nang giu nguyen). Dung MOT file `proxy.ts`/`.js` o goc du an (hoac trong `src`, ngang cap `app`/`pages`), export ham `proxy` (hoac default export). No chay code TRUOC khi request hoan tat, co `matcher` de loc path, va dung `NextResponse` de rewrite/redirect/set header.
- **(b) SAI**: chi ho tro MOT file proxy cho toan du an. Muon tach logic thi import cac module vao file `proxy.ts` chinh.
- **(c) SAI**: docs khuyen cao Proxy KHONG danh cho fetch du lieu cham va KHONG nen dung lam giai phap session management / authorization day du - chi nen lam optimistic check.
- **(d) SAI**: dung `options.cache`, `options.next.revalidate` hay `options.next.tags` trong Proxy KHONG co tac dung.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"File dat ten proxy.ts o goc du an (ngang cap app/pages), chay code TRUOC khi request hoan tat; co the rewrite/redirect/doi header.","explanation":"Dung: mo ta chinh xac Proxy trong Next 16."},{"key":"b","text":"Ban co the tao nhieu file proxy.ts o moi thu muc route de ap dung rieng.","explanation":"Sai: chi ho tro mot file proxy cho toan du an; tach logic bang cach import module."},{"key":"c","text":"Proxy phu hop de fetch du lieu cham va lam session management/authorization day du.","explanation":"Sai: docs khuyen cao khong dung Proxy cho fetch cham hay auth day du."},{"key":"d","text":"Trong Proxy, dat fetch(..., { next: { revalidate } }) se ap dung cache nhu trong Server Component.","explanation":"Sai: cac option cache/revalidate/tags cua fetch khong co tac dung trong Proxy."}]$s$::jsonb, array['a']::text[]),
  ($s$nextjs-metadata-static-vs-generatemetadata$s$, (select id from public.topics where slug = $s$nextjs-optimization$s$), 'theory', 'mid', 2, 4, $s$Trong App Router co may cach khai bao metadata (SEO)? Phan biet `metadata` object va ham `generateMetadata`. Chung chay o dau?$s$, $s$Co 3 cach bo sung the `<head>` cho SEO / social share:

1. **Static `metadata` object**: `export const metadata: Metadata = { title, description, ... }` trong `layout.tsx`/`page.tsx` - dung khi metadata CO DINH, biet truoc luc build.
2. **Dynamic `generateMetadata` function**: `export async function generateMetadata({ params }) {...}` tra ve `Metadata` - dung khi metadata PHU THUOC DU LIEU (vi du title theo bai viet fetch bang slug). Co the `await params` va fetch ben trong.
3. **File-based metadata**: cac file quy uoc nhu `favicon.ico`, `icon.png`, `opengraph-image.(png|tsx)`, `robots.ts`, `sitemap.ts` - Next tu sinh tag/route tuong ung; `opengraph-image.tsx` co the tao OG image dong bang `ImageResponse`.

**Luu y:** ca `metadata` va `generateMetadata` CHI ho tro trong **Server Components** (khong dung trong file `"use client"`). KHONG dung dong thoi static object va `generateMetadata` trong cung mot file. Next tu **merge** metadata tu layout cha xuong page con (co the dung `title.template` cho title template).$s$, null, null, null, null, null),
  ($s$css-tinh-tong-width-content-box$s$, (select id from public.topics where slug = $s$css-box-model$s$), 'quiz', 'junior', 2, 5, $s$Cho CSS sau:

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  box-sizing: content-box;
}
```

Chiều rộng thực tế (từ mép border bên này sang mép border bên kia) của phần tử là bao nhiêu?$s$, $s$**Đáp án đúng: c) 250px.**

Với `box-sizing: content-box` (mặc định của CSS), `width` **chỉ tính phần content**; padding và border được **cộng thêm** vào kích thước hiển thị:

```
total = width + padding-left + padding-right + border-left + border-right
      = 200 + 20 + 20 + 5 + 5 = 250px
```

(margin không nằm trong kích thước hộp, chỉ tạo khoảng cách bên ngoài.)

- **a) 200px** — sai: đó chỉ là phần content, chưa cộng padding và border.
- **b) 240px** — sai: mới cộng padding hai bên (200 + 40), quên border.
- **c) 250px** — đúng: cộng đủ content + padding + border.
- **d) 245px** — sai: chỉ cộng border một bên (200 + 40 + 5).

Nếu đổi sang `box-sizing: border-box` thì `width: 200px` đã **bao gồm** padding và border, nên tổng bề rộng đúng bằng 200px — dễ kiểm soát layout hơn, đó là lý do nhiều dự án đặt `*, *::before, *::after { box-sizing: border-box; }`.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"200px","explanation":"Đây là phần content, chưa cộng padding và border."},{"key":"b","text":"240px","explanation":"Mới cộng padding hai bên (200 + 40), còn thiếu border."},{"key":"c","text":"250px","explanation":"Đúng: 200 (content) + 40 (padding) + 10 (border) = 250px."},{"key":"d","text":"245px","explanation":"Chỉ cộng border một bên (200 + 40 + 5)."}]$s$::jsonb, array['c']::text[]),
  ($s$css-margin-collapsing-la-gi$s$, (select id from public.topics where slug = $s$css-box-model$s$), 'theory', 'mid', 3, 3, $s$Margin collapsing (gộp margin) là gì? Xảy ra khi nào và làm sao để ngăn nó?$s$, $s$**Margin collapsing** là hiện tượng hai **margin theo chiều dọc** (top/bottom) gặp nhau sẽ **gộp lại thành một**, lấy giá trị **lớn hơn** (không cộng dồn) thay vì đứng cạnh nhau.

**Ba trường hợp gộp phổ biến:**
- **Anh em kề nhau (adjacent siblings):** `margin-bottom` của phần tử trên gộp với `margin-top` của phần tử dưới → khoảng cách = max(hai margin), không phải tổng.
- **Cha - con (parent/first-last child):** nếu giữa cha và con không có border/padding/content ngăn cách, `margin-top` của con "tràn" ra ngoài cha.
- **Khối rỗng (empty block):** margin-top và margin-bottom của chính nó gộp vào nhau.

**Lưu ý quan trọng:** chỉ xảy ra với **margin dọc theo block flow bình thường**. **KHÔNG** xảy ra với margin ngang, và **KHÔNG** xảy ra với flex item / grid item.

**Cách ngăn:**
- Thêm `padding` hoặc `border` cho phần tử cha (chặn gộp cha-con).
- Tạo **BFC (Block Formatting Context)** cho cha, ví dụ `overflow: hidden/auto`, `display: flow-root`.
- Dùng `display: flex`/`grid` cho container (item bên trong không bị collapse).
- Chỉ dùng margin một chiều nhất quán (ví dụ chỉ `margin-bottom`) để tránh nhầm lẫn.$s$, null, null, null, null, null),
  ($s$css-don-vi-rem-em-vh-khac-nhau$s$, (select id from public.topics where slug = $s$css-box-model$s$), 'theory', 'junior', 2, 4, $s$Phân biệt các đơn vị `px`, `em`, `rem`, `%`, `vh`/`vw`. Khi nào nên dùng `rem` thay vì `px`?$s$, $s$**Đơn vị tuyệt đối:**
- **`px`**: điểm ảnh cố định, không co giãn theo cài đặt font của người dùng.

**Đơn vị tương đối:**
- **`em`**: tương đối với `font-size` của **chính phần tử** (với `font-size` là của phần tử cha). Dễ bị **nhân dồn (compounding)** khi lồng nhau — ví dụ `em` trên nhiều cấp cha con sẽ tích lũy.
- **`rem`** (root em): tương đối với `font-size` của phần tử gốc `<html>`. **Không** bị nhân dồn → dễ dự đoán, là lựa chọn tốt cho spacing và typography nhất quán.
- **`%`**: tương đối với **kích thước tương ứng của phần tử cha** (width % theo width cha, font-size % theo font cha...).
- **`vh`/`vw`**: 1vh = 1% chiều cao viewport, 1vw = 1% chiều rộng viewport. Hữu ích cho layout full-screen (hero section, `min-height: 100vh`).

**Vì sao ưu tiên `rem` hơn `px`:** khi người dùng tăng cỡ chữ mặc định của trình duyệt (accessibility), các giá trị `rem` sẽ **co giãn theo**, còn `px` thì cứng nhắc. Cách phổ biến: giữ `html { font-size: 16px }` (hoặc để mặc định) rồi dùng `rem` cho font-size, padding, margin.

**Mẹo thực tế:** dùng `rem` cho typography/spacing tổng thể, `em` khi muốn giá trị **co theo cỡ chữ của chính component** (ví dụ padding của button theo font-size của button), `vh/vw` cho kích thước theo màn hình.$s$, null, null, null, null, null),
  ($s$css-flexbox-truc-chinh-va-phu$s$, (select id from public.topics where slug = $s$css-flexbox-layout$s$), 'quiz', 'junior', 2, 5, $s$Trong một flex container có `display: flex; flex-direction: row;`, thuộc tính nào dùng để căn các item theo **chiều DỌC** (cross axis)?$s$, $s$**Đáp án đúng: b) `align-items`.**

Với `flex-direction: row`, **main axis (trục chính)** nằm ngang, **cross axis (trục phụ)** nằm dọc:
- **`justify-content`** căn theo **main axis** → khi `row` là chiều **ngang**.
- **`align-items`** căn theo **cross axis** → khi `row` là chiều **dọc**. Đây là đáp án.

Giải thích các lựa chọn:
- **a) `justify-content`** — sai: căn theo trục chính (ngang khi `row`).
- **b) `align-items`** — đúng: căn theo trục phụ (dọc khi `row`).
- **c) `align-content`** — sai: chỉ có tác dụng khi flex **wrap thành nhiều dòng**, nó căn khoảng cách **giữa các dòng**, không căn từng item trong một dòng.
- **d) `justify-items`** — sai: thuộc tính này thuộc **Grid**, không áp dụng cho flex container.

**Lưu ý:** nếu đổi `flex-direction: column` thì trục đảo ngược — lúc đó `justify-content` căn dọc còn `align-items` căn ngang. Vì vậy nên nhớ theo **trục (main/cross)**, đừng nhớ cứng theo ngang/dọc.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"justify-content","explanation":"Căn theo main axis (ngang khi flex-direction: row)."},{"key":"b","text":"align-items","explanation":"Đúng: căn theo cross axis (dọc khi row)."},{"key":"c","text":"align-content","explanation":"Chỉ căn khoảng cách GIỮA CÁC DÒNG khi flex wrap nhiều dòng."},{"key":"d","text":"justify-items","explanation":"Thuộc CSS Grid, không có tác dụng trong flex container."}]$s$::jsonb, array['b']::text[]),
  ($s$css-doan-width-cac-flex-item$s$, (select id from public.topics where slug = $s$css-flexbox-layout$s$), 'coding', 'mid', 3, 4, $s$Đoán chiều rộng cuối cùng của mỗi item. Container rộng 600px, không có gap, padding hay margin:

```css
.container { display: flex; width: 600px; }
.a { flex: 1; }
.b { flex: 2; }
.c { flex: 1; }
```

```html
<div class="container">
  <div class="a">A</div>
  <div class="b">B</div>
  <div class="c">C</div>
</div>
```$s$, $s$**Kết quả: A = 150px, B = 300px, C = 150px.**

`flex: 1` là viết tắt của `flex: 1 1 0%` → `flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 0%`.

Vì `flex-basis: 0`, tất cả không gian 600px được coi là **không gian dư** và chia theo **tỉ lệ flex-grow**:
- Tổng grow = 1 + 2 + 1 = **4 phần**.
- Mỗi phần = 600 / 4 = **150px**.
- A (grow 1) = 150px, B (grow 2) = 300px, C (grow 1) = 150px.

**Điểm dễ nhầm — `flex: 1` khác `flex: auto`:**
- `flex: 1` = `1 1 0%` → chia thuần theo tỉ lệ, **bỏ qua** kích thước nội dung.
- `flex: auto` = `1 1 auto` → `flex-basis: auto` lấy theo kích thước nội dung trước, chỉ chia phần **dư còn lại** theo tỉ lệ → item nhiều chữ sẽ rộng hơn dù cùng grow.

Nếu đề dùng `flex: auto` thay vì `flex: 1`, kết quả sẽ phụ thuộc độ dài nội dung A/B/C, không còn là 150/300/150 nữa.$s$, $s$.container { display: flex; width: 600px; }
.a { flex: 1; }
.b { flex: 2; }
.c { flex: 1; }$s$, $s$css$s$, null, null, null),
  ($s$css-grid-vs-flexbox-khi-nao-dung$s$, (select id from public.topics where slug = $s$css-grid-responsive$s$), 'theory', 'mid', 3, 4, $s$CSS Grid và Flexbox khác nhau thế nào? Khi nào nên dùng cái nào?$s$, $s$**Khác biệt cốt lõi: số chiều bố cục.**
- **Flexbox** là hệ thống **1 chiều (one-dimensional)**: bố trí theo **một trục** tại một thời điểm (một hàng HOẶC một cột). Kích thước item chủ yếu do **nội dung** quyết định (content-first / content-out).
- **Grid** là hệ thống **2 chiều (two-dimensional)**: kiểm soát **đồng thời hàng và cột**. Bạn định nghĩa layout trước rồi đặt item vào (layout-first / layout-in).

**Khi nào dùng Flexbox:**
- Bố cục theo một dòng: navbar, toolbar, danh sách nút, căn giữa một phần tử.
- Khi muốn item **tự co giãn theo nội dung** và phân phối không gian dư (grow/shrink).

**Khi nào dùng Grid:**
- Bố cục tổng thể trang: header/sidebar/main/footer, dashboard, gallery dạng lưới.
- Khi cần **canh thẳng hàng theo cả hai trục**, hoặc dùng `grid-template-areas` để mô tả layout trực quan.

**Thực tế:** hai cái **không loại trừ nhau** — thường dùng Grid cho khung lớn của trang và Flexbox cho các component nhỏ bên trong (ví dụ mỗi card là flex, còn lưới các card là grid). Chọn theo bài toán: **một chiều → Flexbox, hai chiều → Grid**.$s$, null, null, null, null, null),
  ($s$css-grid-responsive-auto-fit-minmax$s$, (select id from public.topics where slug = $s$css-grid-responsive$s$), 'coding', 'mid', 3, 4, $s$Giải thích đoạn CSS sau làm gì và vì sao nó responsive mà **không cần media query**. `auto-fit` khác `auto-fill` chỗ nào?

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```$s$, $s$**Đoạn này tạo một lưới card tự động xuống dòng và co giãn theo bề rộng container** mà không cần viết breakpoint thủ công.

- **`minmax(200px, 1fr)`**: mỗi cột rộng **tối thiểu 200px**, tối đa **1fr** (chia đều phần không gian dư). Khi container hẹp lại, số cột **vừa với 200px** sẽ giảm dần; khi rộng ra, cột nhiều thêm và mỗi cột giãn tới 1fr.
- **`repeat(auto-fit, ...)`**: trình duyệt tự tính **bao nhiêu cột** nhét vừa một hàng → responsive tự động.
- **`1fr` (fractional unit)**: một phần của không gian **còn lại** sau khi trừ gap; nhiều cột `1fr` sẽ chia đều nhau.

**`auto-fit` vs `auto-fill`:**
- **`auto-fill`**: giữ lại các cột **rỗng** (empty tracks) nếu còn chỗ → các item không giãn hết chiều rộng, để chừa cột trống.
- **`auto-fit`**: **thu gọn** (collapse) các cột rỗng về 0 → các item hiện có **giãn ra lấp đầy** toàn bộ chiều rộng.

**So với media query / mobile-first:** cách truyền thống là dùng `@media (min-width: ...)` để đổi số cột tại từng breakpoint (mobile-first: viết style cho màn nhỏ trước, rồi `min-width` bổ sung cho màn lớn). `auto-fit + minmax` gọn hơn cho các lưới đều nhau, nhưng media query vẫn cần khi muốn **thay đổi layout khác hẳn** (ví dụ giấu sidebar, đổi từ grid sang stack) theo từng kích thước màn hình.$s$, $s$.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}$s$, $s$css$s$, null, null, null),
  ($s$css-cac-gia-tri-position$s$, (select id from public.topics where slug = $s$css-positioning-stacking$s$), 'theory', 'mid', 3, 5, $s$Phân biệt các giá trị của `position`: `static`, `relative`, `absolute`, `fixed`, `sticky`. Mỗi cái định vị theo mốc nào?$s$, $s$- **`static`** (mặc định): phần tử theo **normal flow**. `top/right/bottom/left` và `z-index` **không có tác dụng**.
- **`relative`**: vẫn giữ **chỗ trong flow**, nhưng có thể dịch chuyển bằng `top/left...` **so với vị trí gốc của chính nó**. Quan trọng: nó tạo **containing block** cho con `absolute` (mốc để con định vị) và có thể tạo stacking context nếu đặt `z-index`.
- **`absolute`**: **bị nhấc ra khỏi flow** (không chiếm chỗ). Định vị theo **ancestor gần nhất có `position` khác `static`** (relative/absolute/fixed/sticky); nếu không có thì theo **initial containing block** (viewport/gốc trang).
- **`fixed`**: nhấc khỏi flow, định vị theo **viewport** → dính cố định khi cuộn trang (thường dùng cho header/nút nổi). Lưu ý: nếu ancestor có `transform`/`filter`/`perspective`, `fixed` sẽ neo theo ancestor đó thay vì viewport.
- **`sticky`**: lai giữa `relative` và `fixed`. Ban đầu cuộn như bình thường (`relative`), khi chạm ngưỡng offset (ví dụ `top: 0`) thì **dính** lại như `fixed` trong phạm vi container cha. Cần chỉ định ít nhất một offset (`top/bottom/...`) mới hoạt động.

**Mẹo phỏng vấn:** cụm hay dùng là `position: relative` ở cha + `position: absolute` ở con để định vị chính xác con bên trong cha (ví dụ badge trên góc avatar).$s$, null, null, null, null, null),
  ($s$css-cai-gi-tao-stacking-context$s$, (select id from public.topics where slug = $s$css-positioning-stacking$s$), 'quiz', 'senior', 4, 3, $s$Trường hợp nào sau đây **KHÔNG** tạo ra một **stacking context** mới?$s$, $s$**Đáp án đúng: d) `position: relative;` (không đặt `z-index`, tức `z-index: auto`).**

Một phần tử **positioned** (relative/absolute) chỉ tạo stacking context khi có `z-index` **khác `auto`**. Nếu chỉ `position: relative` mà không có `z-index`, nó **không** tạo stacking context mới.

Các lựa chọn khác **đều tạo** stacking context:
- **a) `position: relative; z-index: 0;`** — positioned + `z-index` khác `auto` (kể cả giá trị 0) → tạo stacking context.
- **b) `opacity: 0.9;`** — bất kỳ `opacity < 1` nào cũng tạo stacking context.
- **c) `transform: translateX(10px);`** — `transform` khác `none` tạo stacking context (tương tự `filter`, `will-change`, `perspective`, `animation`, `mix-blend-mode`, `contain: layout/paint`...).

**Vì sao đáng nhớ:** đây là nguyên nhân số 1 khiến `z-index` "không hoạt động". Khi một ancestor vô tình tạo stacking context (thường do `transform`, `opacity`, hay `filter` phục vụ animation), thì `z-index` cao của phần tử con **chỉ so được trong stacking context của cha đó**, không thể "nhảy ra" đè lên các phần tử ngoài. Ghi nhớ: `z-index` chỉ so sánh giữa các phần tử **trong cùng một stacking context**.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"position: relative; z-index: 0;","explanation":"Positioned + z-index khác auto (kể cả 0) → tạo stacking context."},{"key":"b","text":"opacity: 0.9;","explanation":"opacity < 1 luôn tạo stacking context mới."},{"key":"c","text":"transform: translateX(10px);","explanation":"transform khác none tạo stacking context (như filter, will-change, animation)."},{"key":"d","text":"position: relative; (không có z-index)","explanation":"Đúng: positioned nhưng z-index: auto nên KHÔNG tạo stacking context."}]$s$::jsonb, array['d']::text[]),
  ($s$css-zindex-khong-hoat-dong-sua-loi$s$, (select id from public.topics where slug = $s$css-positioning-stacking$s$), 'coding', 'senior', 4, 4, $s$Modal đặt `z-index: 9999` nhưng vẫn bị `.header` (`z-index: 10`) đè lên. Vì sao và sửa thế nào?

```css
.page {
  transform: translateZ(0); /* thêm để 'tối ưu' */
}
.header {
  position: sticky;
  z-index: 10;
}
.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
```

```html
<div class="page">
  <header class="header">...</header>
  <main>...</main>
  <div class="modal">...</div>
</div>
```$s$, $s$**Nguyên nhân:** `.page` có `transform: translateZ(0)` → tạo một **stacking context** mới. Cả `.modal` lẫn `.header` đều nằm **bên trong** stacking context của `.page`. Nhưng `.header` là `position: sticky` với `z-index: 10` cũng tạo stacking context riêng, và vấn đề mấu chốt là: `z-index: 9999` của modal chỉ có ý nghĩa **so với các phần tử cùng cấp trong `.page`** — nó **không thể vượt ra ngoài** để cạnh tranh ở cấp cao hơn. Con số 9999 to nhưng **bị nhốt** trong stacking context của cha; thứ tự thực tế do vị trí của `.page` trong cây quyết định, không phải bởi giá trị tuyệt đối 9999.

Nói ngắn gọn: **`z-index` chỉ so sánh trong cùng một stacking context.** Một `transform`/`opacity`/`filter` vô tình ở ancestor sẽ "giam" modal lại.

**Các cách sửa:**
1. **Bỏ thứ tạo stacking context ngoài ý muốn** ở `.page` (`transform: translateZ(0)`) nếu không thực sự cần → modal `fixed` trở lại neo theo viewport và so z-index ở cấp gốc.
2. **Đưa modal ra ngoài** ngữ cảnh bị giam bằng **portal**: render modal thẳng vào `<body>` (React `createPortal`) để nó không nằm trong stacking context của `.page`.

```jsx
// React: đưa modal ra body, thoát khỏi stacking context của .page
return createPortal(<div className="modal">...</div>, document.body);
```

**Bài học:** khi z-index "không nghe lời", hãy đi ngược cây DOM tìm ancestor có `transform`, `opacity < 1`, `filter`, `will-change`... — đó gần như luôn là thủ phạm.$s$, $s$.page {
  transform: translateZ(0);
}
.header {
  position: sticky;
  z-index: 10;
}
.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
}$s$, $s$css$s$, null, null, null),
  ($s$css-transition-vs-animation-khac-nhau$s$, (select id from public.topics where slug = $s$css-positioning-stacking$s$), 'theory', 'mid', 2, 4, $s$Phân biệt `transition` và `animation` trong CSS. Nên animate thuộc tính nào để đạt hiệu năng tốt?$s$, $s$**`transition`** — chuyển động **giữa HAI trạng thái**, cần một **trigger** (thay đổi giá trị thuộc tính, thường do `:hover`, `:focus`, hoặc đổi class bằng JS):
- Chỉ đi từ giá trị cũ sang giá trị mới, **không tự chạy** khi tải trang, **không lặp**.
- Cú pháp: `transition: <property> <duration> <timing-function> <delay>` — ví dụ `transition: transform 0.3s ease-in-out;`.

**`animation` + `@keyframes`** — chuyển động **nhiều bước (multi-step)**, mạnh và linh hoạt hơn:
- Có thể **tự chạy** khi tải trang, **lặp** (`animation-iteration-count: infinite`), chạy tới lui (`alternate`), qua nhiều mốc `0% → 50% → 100%`.
- Cú pháp: định nghĩa `@keyframes name { ... }` rồi `animation: name 2s ease infinite;`.

**Khi nào dùng cái nào:** cần phản hồi tương tác đơn giản (hover đổi màu, phóng to nút) → `transition`. Cần hiệu ứng phức tạp, tự chạy, lặp, nhiều giai đoạn (spinner, loading, bounce) → `animation`.

**Hiệu năng — animate cái gì:** ưu tiên **`transform`** và **`opacity`** vì chúng được **GPU tăng tốc**, chỉ ảnh hưởng bước composite, **không** gây layout/reflow hay repaint tốn kém. Tránh animate các thuộc tính gây **reflow** như `width/height/top/left/margin` — hãy thay bằng `transform: translate()/scale()`. Có thể gợi ý trình duyệt bằng `will-change: transform` (nhưng dùng tiết chế vì nó tạo stacking context và tốn bộ nhớ).$s$, null, null, null, null, null),
  ($s$css-so-sanh-do-uu-tien-specificity$s$, (select id from public.topics where slug = $s$css-specificity-cascade$s$), 'quiz', 'mid', 3, 5, $s$Cả bốn selector dưới đây cùng nhắm vào một thẻ `<a>` và cùng đặt `color`. Selector nào **thắng** (specificity cao nhất, giả sử không có `!important` và không tính inline style)?$s$, $s$**Đáp án đúng: a) `#nav .item a`.**

Specificity được tính theo bộ ba **(ID, CLASS/attribute/pseudo-class, TYPE/pseudo-element)**, so sánh từ trái sang phải — cột trái quan trọng hơn **mọi** giá trị ở cột phải:
- **a) `#nav .item a`** → **(1, 1, 1)**: 1 ID + 1 class + 1 type.
- **b) `.menu .item a:hover`** → (0, 3, 1): 3 class/pseudo-class + 1 type.
- **c) `ul li a.active`** → (0, 1, 3): 1 class + 3 type.
- **d) `body header nav ul li a`** → (0, 0, 6): 6 type.

Chỉ cần có **1 ID**, selector a) thắng tất cả các selector chỉ gồm class/type, **dù chúng có bao nhiêu class hay type đi nữa** — vì ID nằm ở cột cao nhất. Do đó a) (1,1,1) > b) (0,3,1) > c) (0,1,3) > d) (0,0,6).

**Bổ sung về thứ tự ưu tiên tổng thể (cascade):**
1. `!important` (thắng mọi specificity thường — nên hạn chế dùng).
2. **Inline style** (`style="..."`) — coi như cột cao hơn cả ID.
3. Specificity của selector (bộ ba như trên).
4. **Thứ tự xuất hiện**: nếu specificity **bằng nhau**, quy tắc **viết sau** thắng.

Lưu ý: universal selector `*` và combinator (`>`, `+`, `~`) có specificity **0**; `:where()` cũng có specificity 0, còn `:not()`/`:is()` lấy specificity của đối số bên trong.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"#nav .item a","explanation":"(1,1,1) — có 1 ID nên thắng mọi selector chỉ gồm class/type."},{"key":"b","text":".menu .item a:hover","explanation":"(0,3,1) — 3 class/pseudo-class nhưng không có ID nên thua a."},{"key":"c","text":"ul li a.active","explanation":"(0,1,3) — chỉ 1 class, không có ID."},{"key":"d","text":"body header nav ul li a","explanation":"(0,0,6) — toàn type selector, specificity thấp nhất."}]$s$::jsonb, array['a']::text[]),
  ($s$css-pseudo-class-vs-pseudo-element$s$, (select id from public.topics where slug = $s$css-specificity-cascade$s$), 'theory', 'mid', 2, 4, $s$Phân biệt **pseudo-class** và **pseudo-element**. Cho ví dụ và giải thích cú pháp `:` so với `::`.$s$, $s$**Pseudo-class** (`:`) — chọn phần tử dựa trên **trạng thái** hoặc **vị trí** của nó (không tạo phần tử mới):
- Ví dụ trạng thái: `:hover`, `:focus`, `:active`, `:checked`, `:disabled`.
- Ví dụ cấu trúc: `:first-child`, `:last-child`, `:nth-child(2n)`, `:not(.active)`.
- Tác dụng: áp style khi phần tử ở một trạng thái nhất định.

**Pseudo-element** (`::`) — tạo ra và tạo kiểu cho một **phần "ảo" của phần tử** như thể có thêm một element trong DOM:
- Ví dụ: `::before`, `::after` (chèn nội dung tạo bằng `content`), `::first-line`, `::first-letter`, `::placeholder`, `::selection`, `::marker`.
- `::before`/`::after` **bắt buộc** có thuộc tính `content` (dù là `content: ""`) mới hiển thị.

**Cú pháp `:` vs `::`:** CSS3 quy ước dùng **hai dấu hai chấm `::` cho pseudo-element** và **một dấu `:` cho pseudo-class** để phân biệt rõ. Trình duyệt vẫn chấp nhận `:before`/`:after` (cú pháp CSS2 cũ) để tương thích ngược, nhưng nên viết `::before`/`::after`.

**Về specificity:** pseudo-class tính như một **class** (cột giữa), còn pseudo-element tính như một **type/element** (cột phải) — thấp hơn class.

```css
a:hover { color: red; }          /* pseudo-class: khi rê chuột */
.card::before {                  /* pseudo-element: chèn nội dung ảo */
  content: "\2605";              /* dấu sao */
}
```$s$, null, null, null, null, null),
  ($s$semantic-html-la-gi-loi-ich$s$, (select id from public.topics where slug = $s$html-semantic$s$), 'theory', 'junior', 2, 5, $s$Semantic HTML là gì? Kể vài lợi ích và cho ví dụ thẻ semantic thay cho `<div>`.$s$, $s$**Semantic HTML** là cách dùng các thẻ có **ý nghĩa mô tả nội dung** thay vì `<div>`/`<span>` vô nghĩa. Thẻ nói cho browser, search engine và assistive technology (screen reader) biết *vai trò* của khối nội dung.

**Lợi ích:**
- **Accessibility (a11y):** screen reader dựng được landmark, người dùng nhảy nhanh giữa các vùng (`<nav>`, `<main>`...).
- **SEO:** search engine hiểu cấu trúc trang tốt hơn (heading hierarchy, `<article>`, `<time>`).
- **Maintainability:** markup tự mô tả, đọc code dễ hơn `<div class="header">`.

**Ví dụ thay thế:**
- `<div id="header">` → `<header>`
- `<div class="nav">` → `<nav>`
- `<div class="content">` → `<main>`
- `<div class="post">` → `<article>`
- `<div class="sidebar">` → `<aside>`
- `<div class="footer">` → `<footer>`

Lưu ý: dùng đúng ngữ nghĩa quan trọng hơn dùng nhiều thẻ — đừng bọc mọi thứ bằng `<section>` chỉ để trông "semantic".$s$, null, null, null, null, null),
  ($s$phan-biet-section-article-div-quiz$s$, (select id from public.topics where slug = $s$html-semantic$s$), 'quiz', 'junior', 2, 4, $s$Bạn cần bọc một **bài blog post độc lập**, có thể tái sử dụng / phân phối riêng (ví dụ hiển thị trong RSS feed). Thẻ nào phù hợp NHẤT?$s$, $s$Đáp án đúng: **c) `<article>`**.

`<article>` dành cho **nội dung độc lập, tự chứa (self-contained)**, có nghĩa khi tách khỏi trang: blog post, comment, product card, tin tức. Đây chính là mô tả của đề bài.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"<div class=\"post\">","explanation":"div không có ngữ nghĩa — không truyền được vai trò cho screen reader / SEO. Chỉ dùng khi không có thẻ semantic phù hợp."},{"key":"b","text":"<section>","explanation":"section là nhóm nội dung có chung chủ đề (thường có heading) TRONG một tài liệu, không nhấn mạnh tính 'độc lập, phân phối được'."},{"key":"c","text":"<article>","explanation":"Đúng: nội dung tự chứa, có thể tái sử dụng/phân phối độc lập — chuẩn cho blog post."},{"key":"d","text":"<main>","explanation":"main là vùng nội dung chính DUY NHẤT của trang, chỉ được dùng 1 lần — không dùng để bọc từng post."}]$s$::jsonb, array['c']::text[]),
  ($s$sua-div-soup-thanh-semantic$s$, (select id from public.topics where slug = $s$html-semantic$s$), 'coding', 'mid', 3, 4, $s$Refactor đoạn "div soup" sau thành semantic HTML tương đương:$s$, $s$Thay các `div` bằng thẻ semantic đúng vai trò:

```html
<header>
  <nav>
    <a href="/">Trang chủ</a>
  </nav>
</header>

<main>
  <article>
    <h1>Tiêu đề bài viết</h1>
    <p>Nội dung...</p>
  </article>
  <aside>Bài liên quan</aside>
</main>

<footer>© 2026</footer>
```

**Nguyên tắc mapping:**
- vùng đầu trang → `<header>`; điều hướng → `<nav>`
- vùng nội dung chính (1 lần/trang) → `<main>`
- bài viết độc lập → `<article>` (kèm heading `<h1>`/`<h2>`)
- nội dung phụ/bổ trợ → `<aside>`
- chân trang → `<footer>`

Lợi ích ngay: screen reader có landmark để nhảy, không cần đọc hết `class` để đoán vai trò.$s$, $s$<div class="header">
  <div class="nav">
    <a href="/">Trang chủ</a>
  </div>
</div>
<div class="content">
  <div class="post">
    <div class="title">Tiêu đề bài viết</div>
    <p>Nội dung...</p>
  </div>
  <div class="sidebar">Bài liên quan</div>
</div>
<div class="footer">© 2026</div>$s$, $s$html$s$, null, null, null),
  ($s$html5-form-validation-attributes$s$, (select id from public.topics where slug = $s$html-forms$s$), 'theory', 'junior', 2, 4, $s$Các thuộc tính HTML5 nào giúp validate form phía client mà không cần JavaScript? Nêu vài cái phổ biến.$s$, $s$HTML5 hỗ trợ **client-side validation** ngay trên thẻ `<input>`, browser tự chặn submit và hiện thông báo:

- **`required`**: bắt buộc nhập.
- **`type`**: `email`, `url`, `number`, `tel`, `date`... browser tự kiểm tra định dạng.
- **`pattern`**: regex tùy chỉnh, ví dụ `pattern="[0-9]{10}"`.
- **`min` / `max` / `step`**: giới hạn giá trị số / ngày.
- **`minlength` / `maxlength`**: độ dài chuỗi.

**Ví dụ:**
```html
<input type="email" required minlength="5">
```

**Lưu ý quan trọng:**
- Có thể tắt bằng thuộc tính **`novalidate`** trên `<form>` (hoặc `formnovalidate` trên button submit).
- Client-side validation chỉ để UX — **KHÔNG bao giờ tin tưởng**, phải validate lại ở server (bảo mật).
- Style trạng thái bằng pseudo-class CSS: `:valid`, `:invalid`, `:required`.$s$, null, null, null, null, null),
  ($s$lien-ket-label-input-quiz$s$, (select id from public.topics where slug = $s$html-forms$s$), 'quiz', 'mid', 3, 5, $s$Cách nào sau đây KHÔNG tạo được liên kết hợp lệ giữa `<label>` và input (click label không focus vào input)?$s$, $s$Đáp án đúng (cái SAI): **c**.

`<label for="...">` phải trỏ tới **`id`** của control, KHÔNG phải `name`. Ở phương án c, input chỉ có `name="user"` mà không có `id="user"`, nên `for` không tìm thấy phần tử nào → không liên kết.

Liên kết label-input đúng giúp: click label focus vào input, và screen reader đọc đúng nhãn khi vào field — cực kỳ quan trọng cho a11y.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"<label for=\"user\">Tên</label> <input id=\"user\">","explanation":"Hợp lệ: for trỏ đúng tới id của input (explicit association)."},{"key":"b","text":"<label>Tên <input></label>","explanation":"Hợp lệ: bọc input trong label (implicit association), không cần for/id."},{"key":"c","text":"<label for=\"user\">Tên</label> <input name=\"user\">","explanation":"SAI: for phải khớp với id, không phải name. Input không có id=\"user\" nên không liên kết."},{"key":"d","text":"<label id=\"user\">Tên</label> <input aria-labelledby=\"user\">","explanation":"Hợp lệ: aria-labelledby trên input trỏ tới id của label → screen reader đọc đúng nhãn."}]$s$::jsonb, array['c']::text[]),
  ($s$button-type-mac-dinh-trong-form$s$, (select id from public.topics where slug = $s$html-forms$s$), 'coding', 'mid', 3, 4, $s$Người dùng bấm nút "Xóa" (để clear ô input) nhưng trang lại **reload / submit form**. Vì sao và sửa thế nào?$s$, $s$**Nguyên nhân:** một `<button>` nằm trong `<form>` mà **không khai báo `type`** thì `type` mặc định là **`submit`**. Bấm nó → submit form → trang reload/navigate.

**Cách sửa:** đặt `type="button"` cho những nút không dùng để submit:

```html
<form action="/search">
  <input name="q">
  <button type="button" onclick="clearInput()">Xóa</button>
  <button type="submit">Tìm</button>
</form>
```

**Ghi nhớ 3 giá trị `type` của button:**
- `submit` (mặc định) — gửi form.
- `button` — không làm gì, chỉ chạy JS handler.
- `reset` — reset toàn bộ field về giá trị ban đầu.

Đây là bug kinh điển, nhất là khi dùng icon button trong form.$s$, $s$<form action="/search">
  <input name="q">
  <button onclick="clearInput()">Xóa</button>
</form>$s$, $s$html$s$, null, null, null),
  ($s$aria-la-gi-first-rule-of-aria$s$, (select id from public.topics where slug = $s$html-a11y$s$), 'theory', 'senior', 3, 4, $s$ARIA là gì? Nêu "First Rule of ARIA" và khi nào thực sự cần dùng ARIA.$s$, $s$**ARIA** (Accessible Rich Internet Applications) là tập thuộc tính (`role`, `aria-*`) bổ sung **ngữ nghĩa cho assistive technology** khi HTML gốc không diễn đạt đủ — thường cho custom widget (tabs, modal, combobox...).

**First Rule of ARIA:** *"Nếu có sẵn một phần tử HTML native mang đúng ngữ nghĩa và hành vi bạn cần, hãy dùng nó thay vì tái tạo bằng `div` + ARIA."*

Ví dụ: dùng `<button>` thay vì `<div role="button" tabindex="0" aria-pressed>` + tự viết keyboard handler. Native button đã có: focusable, kích hoạt bằng Enter/Space, ngữ nghĩa role=button — miễn phí.

**Khi nào cần ARIA:**
- Custom widget không có element native tương đương (ví dụ `role="tablist"`, `aria-expanded` cho accordion).
- Bổ sung trạng thái động: `aria-live` cho vùng cập nhật real-time, `aria-invalid`, `aria-busy`.
- Cung cấp tên khi không có text nhìn thấy: `aria-label`, `aria-labelledby`.

**Cảnh báo:** ARIA dùng sai còn tệ hơn không dùng ("No ARIA is better than bad ARIA") — ví dụ đặt `role` sai làm screen reader hiểu lệch. ARIA chỉ đổi ngữ nghĩa, **không tự thêm hành vi** (không tự làm focusable, không tự bắt keyboard).$s$, null, null, null, null, null),
  ($s$alt-text-cho-anh-trang-tri-quiz$s$, (select id from public.topics where slug = $s$html-a11y$s$), 'quiz', 'senior', 3, 5, $s$Một ảnh thuần **trang trí** (decorative), không mang thông tin. Cách khai báo `alt` ĐÚNG để screen reader **bỏ qua** ảnh?$s$, $s$Đáp án đúng: **b) `alt=""` (rỗng)**.

`alt=""` (chuỗi rỗng, có mặt thuộc tính) báo rõ cho screen reader biết ảnh là **decorative** → bỏ qua hoàn toàn, không đọc. Đây là chuẩn cho icon trang trí, đường viền, spacer.

Giải thích các phương án sai:
- **a)** Bỏ hẳn `alt`: markup không hợp lệ về a11y; nhiều screen reader sẽ **đọc luôn tên file** (`deco_final_v2.png`) — gây nhiễu.
- **c)** `alt="ảnh trang trí"`: thêm nội dung vô nghĩa vào luồng đọc, làm phiền người dùng.
- **d)** `alt="null"`: screen reader đọc thành chữ **"null"**.

Mẹo nâng cao: có thể dùng thêm `role="presentation"` hoặc đưa ảnh vào CSS `background-image` nếu thuần trang trí.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Bỏ luôn thuộc tính alt: <img src=\"deco.png\">","explanation":"Sai: thiếu alt khiến nhiều screen reader đọc tên file — trải nghiệm tệ."},{"key":"b","text":"<img src=\"deco.png\" alt=\"\">","explanation":"Đúng: alt rỗng đánh dấu ảnh decorative, screen reader bỏ qua."},{"key":"c","text":"<img src=\"deco.png\" alt=\"ảnh trang trí\">","explanation":"Sai: mô tả thừa cho ảnh không mang thông tin, gây nhiễu."},{"key":"d","text":"<img src=\"deco.png\" alt=\"null\">","explanation":"Sai: screen reader đọc thành chữ 'null'."}]$s$::jsonb, array['b']::text[]),
  ($s$responsive-image-srcset-sizes-loading$s$, (select id from public.topics where slug = $s$html-media-seo$s$), 'coding', 'mid', 3, 4, $s$Viết một `<img>` responsive: tải ảnh phù hợp theo bề rộng màn hình, lazy-load, và không gây layout shift. Giải thích `srcset`, `sizes`, `loading`.$s$, $s$```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w,
          photo-800.jpg 800w,
          photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  width="800" height="600"
  loading="lazy"
  alt="Mô tả ảnh">
```

**`srcset` (width descriptor `w`):** liệt kê các phiên bản ảnh kèm **bề rộng thực** của file. Browser tự chọn file hợp lý dựa trên độ phân giải màn hình (DPR) + `sizes`.

**`sizes`:** cho browser biết ảnh sẽ **chiếm bao nhiêu chỗ** trong layout ở từng breakpoint (ví dụ màn nhỏ chiếm `100vw`, màn lớn `50vw`). Nhờ đó browser tính đúng file cần tải TRƯỚC khi có CSS.

**`loading="lazy"`:** hoãn tải ảnh nằm ngoài viewport cho tới khi người dùng cuộn gần tới — tiết kiệm băng thông, tăng tốc load ban đầu. (Đừng lazy-load ảnh hero/above-the-fold.)

**`width` + `height`:** đặt tỉ lệ để browser **giữ chỗ (reserve space)** trước khi ảnh tải xong → tránh **CLS (Cumulative Layout Shift)** — nội dung không bị nhảy. `src` là fallback cho browser cũ không hiểu `srcset`.$s$, null, $s$html$s$, null, null, null),
  ($s$meta-viewport-charset-quiz$s$, (select id from public.topics where slug = $s$html-media-seo$s$), 'quiz', 'junior', 1, 5, $s$Thẻ `<meta>` nào BẮT BUỘC để trang **responsive** hiển thị đúng trên mobile (không bị thu nhỏ như đang xem trang desktop)?$s$, $s$Đáp án đúng: **c) `<meta name="viewport" content="width=device-width, initial-scale=1">`**.

Thiếu thẻ viewport này, mobile browser giả định viewport rộng ~980px rồi **zoom-out toàn trang** → chữ nhỏ xíu, media query không kích hoạt đúng. `width=device-width` đặt bề rộng viewport bằng bề rộng thật của thiết bị; `initial-scale=1` không zoom.

Các phương án khác đều là meta hữu ích nhưng KHÔNG giải quyết responsive:
- **a)** `charset="UTF-8"`: khai báo bảng mã ký tự (nên có, đặt sớm trong `<head>`), không liên quan layout mobile.
- **b)** `description`: mô tả cho SEO/snippet, không ảnh hưởng hiển thị.
- **d)** `X-UA-Compatible`: chỉ dành cho IE cũ, đã lỗi thời.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"<meta charset=\"UTF-8\">","explanation":"Khai báo bảng mã, nên có nhưng không liên quan responsive."},{"key":"b","text":"<meta name=\"description\" content=\"...\">","explanation":"Phục vụ SEO/snippet, không ảnh hưởng scale mobile."},{"key":"c","text":"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">","explanation":"Đúng: đặt viewport theo bề rộng thiết bị, tiền đề của responsive design."},{"key":"d","text":"<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">","explanation":"Chỉ dành cho IE cũ, đã lỗi thời, không liên quan mobile."}]$s$::jsonb, array['c']::text[]),
  ($s$script-defer-vs-async$s$, (select id from public.topics where slug = $s$html-embed-perf$s$), 'theory', 'mid', 3, 5, $s$Phân biệt `<script>` thường, `<script defer>` và `<script async>`. Khi nào dùng cái nào?$s$, $s$Cả `defer` và `async` chỉ áp dụng cho script **external** (có `src`), và đều **tải file song song** với quá trình parse HTML (không chặn download). Khác nhau ở thời điểm **thực thi**:

| Loại | Download | Thực thi | Chặn HTML parsing? | Giữ thứ tự? |
|------|----------|----------|--------------------|-------------|
| `<script>` thường | Ngay, chặn | Ngay khi tải xong | **Có** — dừng parse | Có |
| `<script async>` | Song song | **Ngay khi tải xong** (có thể chen giữa parse) | Có thể, khi thực thi | **Không** — ai xong trước chạy trước |
| `<script defer>` | Song song | **Sau khi parse HTML xong**, trước `DOMContentLoaded` | Không | Có — theo thứ tự trong HTML |

**Chọn thế nào:**
- **`defer`**: mặc định nên dùng cho script phụ thuộc DOM hoặc phụ thuộc lẫn nhau (cần đúng thứ tự). Chạy sau khi DOM sẵn sàng.
- **`async`**: cho script **độc lập**, không cần DOM và không phụ thuộc script khác — analytics, ads, tracking.
- **Script thường (không attr)**: chặn render; nếu đặt trong `<head>` sẽ làm chậm hiển thị. Nếu buộc dùng, đặt cuối `<body>`.

Ghi nhớ: `defer` = đợi DOM + giữ thứ tự; `async` = chạy sớm nhất có thể + không đảm bảo thứ tự.$s$, null, null, null, null, null),
  ($s$data-attributes-va-dataset$s$, (select id from public.topics where slug = $s$html-embed-perf$s$), 'coding', 'junior', 2, 3, $s$`data-*` attributes dùng để làm gì? Đọc/ghi chúng từ JavaScript như thế nào? Cho biết output của đoạn code sau.$s$, $s$**`data-*`** là attribute tùy chỉnh để **gắn dữ liệu riêng của app vào HTML** một cách hợp lệ (không lạm dụng `class`/`id`). Thường dùng truyền metadata cho JS hoặc CSS.

**Truy cập từ JS qua `element.dataset`** — tên được chuyển từ `kebab-case` sang `camelCase`:
- `data-user-id` → `el.dataset.userId`
- `data-role` → `el.dataset.role`

**Output của đoạn code:**
```
42
admin
```

Giải thích: `data-user-id="42"` đọc qua `dataset.userId` = `"42"` (luôn là **string**). Gán `dataset.role = "admin"` tạo/ghi attribute `data-role="admin"`.

**Lưu ý:**
- Giá trị luôn là string → cần tự ép kiểu (`Number(el.dataset.userId)`).
- Cách khác: `getAttribute('data-user-id')` / `setAttribute(...)`.
- CSS đọc được qua `attr()` và selector `[data-role="admin"]`.
- Không nhét dữ liệu nhạy cảm/quá lớn vào `data-*` (nằm lộ trong DOM).$s$, $s$<div id="box" data-user-id="42"></div>

<script>
  const el = document.getElementById('box');
  console.log(el.dataset.userId);
  el.dataset.role = 'admin';
  console.log(el.dataset.role);
</script>$s$, $s$html$s$, null, null, null),
  ($s$iframe-sandbox-va-lazy-loading$s$, (select id from public.topics where slug = $s$html-embed-perf$s$), 'theory', 'senior', 4, 3, $s$Khi nhúng nội dung bên thứ ba bằng `<iframe>`, thuộc tính `sandbox` để làm gì? Nêu vài token và một cạm bẫy bảo mật thường gặp.$s$, $s$**`sandbox`** áp một tập **giới hạn bảo mật** lên nội dung iframe. Khi khai báo `sandbox` (kể cả rỗng), iframe bị **chặn gần như mọi thứ**: không chạy script, không submit form, không popup, coi như **origin khác (opaque origin)**, không tự điều hướng trang cha... Ta **nới lỏng từng phần** bằng cách thêm token.

**Vài token phổ biến:**
- `allow-scripts`: cho phép chạy JavaScript.
- `allow-forms`: cho phép submit form.
- `allow-same-origin`: giữ nguyên origin thật (cho phép truy cập cookie/storage cùng origin).
- `allow-popups`, `allow-modals`, `allow-top-navigation`.

**Cạm bẫy bảo mật kinh điển:** dùng **`allow-scripts` + `allow-same-origin` cùng lúc** cho nội dung không tin cậy. Khi đó iframe cùng origin với trang cha VÀ chạy được script → nó có thể **tự gỡ bỏ thuộc tính `sandbox` của chính mình** (thao tác DOM lên `<iframe>` trong document cha), vô hiệu hóa toàn bộ sandbox. Với nội dung bên thứ ba, tránh kết hợp hai token này.

**Bổ sung hữu ích:**
- `loading="lazy"` trên iframe: hoãn tải iframe ngoài viewport (tốt cho embed nặng như video, map).
- `allow` (Permissions Policy): kiểm soát quyền tính năng như camera/mic/fullscreen, ví dụ `allow="fullscreen"`.
- `referrerpolicy`, `title` (bắt buộc cho a11y — screen reader đọc nội dung frame).$s$, null, null, null, null, null),
  ($s$critical-rendering-path-la-gi$s$, (select id from public.topics where slug = $s$browser-crp$s$), 'theory', 'mid', 3, 5, $s$Critical Rendering Path (CRP) la gi? Trinh duyet trai qua nhung buoc nao de bien HTML/CSS/JS thanh pixel tren man hinh?$s$, $s$**Critical Rendering Path** la chuoi buoc trinh duyet thuc hien de chuyen HTML, CSS, JS thanh pixel hien thi. Cac buoc chinh:

1. **Parse HTML -> DOM tree**: dung cay cau truc tai lieu.
2. **Parse CSS -> CSSOM tree**: dung cay style, tinh ca cascade/inheritance.
3. **Render Tree** = DOM + CSSOM: chi chua node **duoc hien thi**. `display:none` bi loai khoi render tree; nhung `visibility:hidden` van con (chiem cho, chi vo hinh).
4. **Layout (Reflow)**: tinh vi tri + kich thuoc hinh hoc cua tung node (bao nhieu px, o dau).
5. **Paint**: ve pixel (mau, text, border, shadow...) thanh cac layer.
6. **Composite**: ghep cac layer theo dung thu tu (z-index, layer GPU) de ra frame cuoi.

**Toi uu CRP**: CSS la *render-blocking* (browser cho CSSOM xong moi render); `<script>` dong bo chan parser -> dung `defer`/`async`; giam so byte va so *critical resources* de first paint nhanh hon. Cac chi so lien quan: FCP (First Contentful Paint), LCP (Largest Contentful Paint).$s$, null, null, null, null, null),
  ($s$phan-biet-reflow-va-repaint$s$, (select id from public.topics where slug = $s$browser-crp$s$), 'theory', 'mid', 3, 5, $s$Phan biet **reflow (layout)** va **repaint**. Thao tac nao gay reflow, thao tac nao chi repaint? Vi sao reflow ton kem hon?$s$, $s$- **Reflow (layout)**: browser tinh lai **hinh hoc** (vi tri, kich thuoc) cua element, thuong lan ra ca ancestor/descendant/sibling. Kich hoat khi thay doi thu anh huong layout: `width`, `height`, `padding`, `margin`, `position`, `font-size`, them/xoa DOM node, doi noi dung text, hoac **doc** thuoc tinh buoc tinh layout (`offsetTop`, `offsetWidth`, `getBoundingClientRect()`, `scrollHeight`...).
- **Repaint**: ve lai pixel ma **khong** doi layout. Vi du: doi `color`, `background-color`, `visibility`, `box-shadow`, `outline`.

**Vi sao reflow ton kem hon**: reflow phai tinh lai geometry va co the lan ca cay -> luon keo theo repaint + composite. Repaint thi khong keo theo reflow.

**Meo**: chi doi `transform` va `opacity` (tren layer rieng) co the chi can **composite** o GPU, khong reflow/repaint -> animation muot hon nhieu so voi animate `top`/`left`/`width`.$s$, null, null, null, null, null),
  ($s$sua-layout-thrashing-doc-ghi-dom$s$, (select id from public.topics where slug = $s$browser-crp$s$), 'coding', 'senior', 4, 3, $s$Doan code sau chay giat khi list dai. Giai thich van de va sua lai cho toi uu.$s$, $s$Day la **layout thrashing** (forced synchronous reflow). Trong moi vong lap, ban **doc** `offsetWidth` (buoc browser flush layout de tra so chinh xac) ngay sau khi **ghi** `style.width` o vong truoc (lam layout "dirty"). Chuoi read -> write -> read xen ke ep browser reflow **dong bo** o MOI vong lap -> O(n) reflow.

**Cach sua**: tach pha DOC va pha GHI (batch). Doc het truoc, ghi het sau -> chi 1 reflow duy nhat:

```js
const boxes = document.querySelectorAll('.box');
// Pha DOC (khong xen ghi)
const widths = [...boxes].map((box) => box.offsetWidth);
// Pha GHI
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px';
});
```

Nang cao: gom pha ghi vao `requestAnimationFrame` (chay truoc frame ve), hoac dung thu vien nhu **FastDOM** de tach doc/ghi tu dong.$s$, $s$const boxes = document.querySelectorAll('.box');
boxes.forEach((box) => {
  const w = box.offsetWidth;         // DOC -> flush layout
  box.style.width = w + 10 + 'px';   // GHI -> layout dirty
});$s$, $s$js$s$, null, null, null),
  ($s$event-bubbling-vs-capturing-3-pha$s$, (select id from public.topics where slug = $s$browser-events$s$), 'theory', 'junior', 2, 5, $s$Event **bubbling** va event **capturing** khac nhau the nao? Mo ta 3 pha cua mot su kien DOM.$s$, $s$Mot su kien DOM di qua **3 pha**:

1. **Capturing (capture) phase**: su kien di TU `window`/`document` XUONG dan toi element target (top -> down).
2. **Target phase**: toi dung element bi tac dong.
3. **Bubbling phase**: su kien NOI nguoc tu target LEN dan toi cac ancestor (bottom -> up).

Mac dinh `addEventListener(type, handler)` lang nghe o pha **bubbling**. Muon nghe o pha **capturing**: `addEventListener(type, handler, true)` hoac `{ capture: true }`.

Da so handler dung bubbling; capturing huu ich khi muon xu ly/chan o lop cha TRUOC khi toi con. Luu y: mot so su kien **khong bubble** (`focus`, `blur`, `mouseenter`, `mouseleave`) -> dung ban bubble tuong ung (`focusin`/`focusout`) hoac dung capture.$s$, null, null, null, null, null),
  ($s$event-delegation-la-gi-vi-du$s$, (select id from public.topics where slug = $s$browser-events$s$), 'coding', 'mid', 3, 5, $s$**Event delegation** la gi va vi sao nen dung? Viet vi du xu ly click cho danh sach item co the them/xoa dong.$s$, $s$**Event delegation** la ky thuat gan MOT listener o element cha thay vi gan nhieu listener cho tung con, tan dung **event bubbling**: click o con noi len cha, ta dung `event.target` (thuong kem `.closest()`) de xac dinh con nao bi click.

**Loi ich**:
- It listener -> tiet kiem bo nho, khoi tao nhanh.
- Tu dong ap dung cho item **them moi sau nay** (khong can gan lai listener).
- De go bo (chi 1 listener).

```js
const list = document.querySelector('#todo-list');
list.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn || !list.contains(btn)) return; // click ngoai nut xoa -> bo qua
  btn.closest('li').remove();
});
```

`closest('.delete-btn')` xu ly ca truong hop click vao icon ben trong nut (bubble tu con). Them item moi vao list van hoat dong ma khong can gan listener lai.$s$, null, null, null, null, null),
  ($s$preventdefault-vs-stoppropagation-quiz$s$, (select id from public.topics where slug = $s$browser-events$s$), 'quiz', 'mid', 3, 4, $s$Phat bieu nao **DUNG** ve `preventDefault()`, `stopPropagation()` va `stopImmediatePropagation()`?$s$, $s$Dap an dung: **c**.

- **`preventDefault()`**: ngan **hanh vi mac dinh** cua browser (chan submit form, chan dieu huong theo `<a>`, chan checkbox tu tick). KHONG anh huong toi bubbling.
- **`stopPropagation()`**: dung su kien lan tiep qua cac pha (khong len cha nua), NHUNG cac listener khac da dang ky tren CUNG element van duoc goi.
- **`stopImmediatePropagation()`**: nhu `stopPropagation` + chan luon cac listener con lai tren chinh element do.

Vi sao cac dap an khac sai:
- **a** dao vai tro: ngan bubble la viec cua `stopPropagation`, khong phai `preventDefault`.
- **b** dao vai tro: ngan hanh vi mac dinh la viec cua `preventDefault`, khong phai `stopPropagation`.
- **d** sai vi hai ham co muc dich hoan toan khac nhau, khong the thay the nhau.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"preventDefault() ngan su kien lan (bubble) sang element cha.","explanation":"Sai - ngan bubble la nhiem vu cua stopPropagation()."},{"key":"b","text":"stopPropagation() ngan hanh vi mac dinh cua trinh duyet (vd chan submit form).","explanation":"Sai - chan hanh vi mac dinh la nhiem vu cua preventDefault()."},{"key":"c","text":"stopPropagation() chan lan truyen len cha nhung cac listener KHAC tren cung element van chay; stopImmediatePropagation() chan ca cac listener con lai tren chinh element do.","explanation":"Dung - mo ta chinh xac khac biet giua 2 ham."},{"key":"d","text":"preventDefault() va stopPropagation() la bi danh cua nhau, dung cai nao cung duoc.","explanation":"Sai - khac muc dich hoan toan."}]$s$::jsonb, array['c']::text[]),
  ($s$cookie-vs-localstorage-vs-sessionstorage$s$, (select id from public.topics where slug = $s$browser-storage$s$), 'theory', 'junior', 2, 5, $s$So sanh **cookie**, **localStorage** va **sessionStorage**: dung luong, vong doi, pham vi, co gui kem HTTP request khong?$s$, $s$| Tieu chi | cookie | localStorage | sessionStorage |
|---|---|---|---|
| Dung luong | ~4KB | ~5-10MB | ~5-10MB |
| Vong doi | theo `Expires`/`Max-Age` (hoac het session) | vinh vien toi khi bi xoa | toi khi dong tab |
| Gui kem HTTP request | **CO** (moi request cung domain) | KHONG | KHONG |
| Pham vi | domain + path | theo origin, chia se moi tab | theo origin, RIENG tung tab |
| API | `document.cookie` (string) | `getItem`/`setItem` | `getItem`/`setItem` |

**Ghi chu**:
- Cookie chu yeu cho auth/session -> nen dat `HttpOnly` (JS khong doc duoc, chong XSS lay token), `Secure`, `SameSite` (chong CSRF).
- `localStorage`/`sessionStorage` chi doc/ghi o client, API **dong bo (blocking)**, chi luu **string** -> phai `JSON.stringify`/`JSON.parse` khi luu object.
- `localStorage` chia se giua cac tab cung origin; `sessionStorage` tach rieng moi tab.
- Dat token nhay cam vao `localStorage` co rui ro XSS -> can can nhac.$s$, null, null, null, null, null),
  ($s$storage-nao-gui-kem-moi-http-request$s$, (select id from public.topics where slug = $s$browser-storage$s$), 'quiz', 'junior', 2, 4, $s$Co che luu tru phia client nao duoc trinh duyet **TU DONG** dinh kem vao moi HTTP request toi cung domain?$s$, $s$Dap an dung: **c (Cookie)**.

Chi **cookie** duoc trinh duyet tu dong gui trong header `Cookie` cua moi request cung domain (tru khi bi gioi han boi `SameSite`, `Domain`, `Path`, `Secure`). Day vua la uu diem (server nhan session tu dong) vua la nhuoc diem (tang payload MOI request -> khong nen nhet du lieu lon vao cookie).

Vi sao cac dap an khac sai: `localStorage`, `sessionStorage`, `IndexedDB` chi ton tai o **client**; JS phai chu dong doc va tu gan vao request (vi du `Authorization` header) -> browser khong tu dong gui.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"localStorage","explanation":"Sai - chi o client, JS phai tu doc va tu gan vao request."},{"key":"b","text":"sessionStorage","explanation":"Sai - chi o client, khong tu gui, con bi tach rieng theo tab."},{"key":"c","text":"Cookie","explanation":"Dung - tu dong gui trong header Cookie moi request cung domain."},{"key":"d","text":"IndexedDB","explanation":"Sai - database o client, khong bao gio tu gan vao HTTP request."}]$s$::jsonb, array['c']::text[]),
  ($s$indexeddb-vs-localstorage-khi-nao-dung$s$, (select id from public.topics where slug = $s$browser-storage$s$), 'theory', 'senior', 4, 3, $s$Khi nao nen dung **IndexedDB** thay vi **localStorage**? Neu khac biet cot loi.$s$, $s$- **localStorage**: key-value don gian, CHI luu **string**, API **dong bo (blocking)** -> thao tac lon lam nghen main thread; dung luong ~5-10MB.
- **IndexedDB**: database NoSQL trong trinh duyet, luu duoc **object co cau truc** (structured clone: object, `Blob`, `File`, `ArrayBuffer`...), API **bat dong bo** (khong block UI), ho tro **index, transaction, cursor**; dung luong lon (hang tram MB toi GB tuy disk/quota).

**Dung IndexedDB khi**: can luu nhieu du lieu, can query theo index, offline-first (PWA/Service Worker), cache file/anh, khong muon block main thread.

**Dung localStorage khi**: du lieu nho, don gian (theme, flag, token nho).

**Luu y**: IndexedDB API kha ruom ra (event-based) -> thuc te thuong dung wrapper nhu `idb`, `Dexie.js` cho de dung (Promise-based).$s$, null, null, null, null, null),
  ($s$cors-la-gi-va-preflight-request$s$, (select id from public.topics where slug = $s$browser-network$s$), 'theory', 'mid', 3, 5, $s$**CORS** la gi? **Same-origin policy** la gi? **Preflight request** (OPTIONS) xay ra khi nao?$s$, $s$- **Same-Origin Policy (SOP)**: chinh sach bao mat cua browser chan script doc du lieu tu origin KHAC. Origin = `scheme` + `host` + `port`; khac 1 trong 3 la khac origin (vi du `https://a.com` vs `http://a.com` vs `https://a.com:8080` deu khac nhau).
- **CORS (Cross-Origin Resource Sharing)**: co che dung HTTP header de server CHO PHEP mot so origin khac truy cap tai nguyen, noi long SOP co kiem soat. Header chinh: `Access-Control-Allow-Origin`, `-Allow-Methods`, `-Allow-Headers`, `-Allow-Credentials`.
- **Preflight**: voi request "non-simple", browser TU gui truoc mot request `OPTIONS` de hoi server co cho phep khong, roi moi gui request that. Preflight xay ra khi: method khong thuoc {GET, POST, HEAD}, HOAC co custom header (vd `Authorization`), HOAC `Content-Type` khong thuoc 3 loai "simple" (`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`).

**Luu y quan trong**: CORS la co che phia **BROWSER**; goi server<->server hay tu Postman KHONG bi CORS. Loi CORS khong the "fix" hoan toan o frontend -> **server** phai tra dung header (hoac dung proxy).$s$, null, null, null, null, null),
  ($s$request-nao-kich-hoat-cors-preflight$s$, (select id from public.topics where slug = $s$browser-network$s$), 'quiz', 'mid', 3, 4, $s$Request cross-origin nao se **KICH HOAT preflight** (OPTIONS) truoc khi gui request that?$s$, $s$Dap an dung: **b**.

Preflight xay ra khi request KHONG phai "simple request". **Simple request** chi gom method GET/POST/HEAD, khong header custom, va `Content-Type` thuoc {`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`}.

- **b**: `Content-Type: application/json` KHONG thuoc danh sach simple -> **kich hoat preflight**. DUNG.
- **a**: GET don gian, khong header custom -> simple -> khong preflight.
- **c**: POST voi `application/x-www-form-urlencoded` -> nam trong danh sach simple -> khong preflight.
- **d**: `text/plain` cung thuoc danh sach simple -> khong preflight.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"fetch('https://api.x.com/data') - GET, khong header custom","explanation":"Simple request -> khong preflight."},{"key":"b","text":"fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })","explanation":"Dung - application/json khong phai simple content-type -> preflight."},{"key":"c","text":"POST form voi Content-Type: application/x-www-form-urlencoded","explanation":"Content-type nay thuoc nhom simple -> khong preflight."},{"key":"d","text":"fetch(url) voi Content-Type: text/plain","explanation":"text/plain thuoc nhom simple -> khong preflight."}]$s$::jsonb, array['b']::text[]),
  ($s$http-cache-control-va-etag-revalidation$s$, (select id from public.topics where slug = $s$browser-network$s$), 'theory', 'senior', 4, 4, $s$Giai thich HTTP cache: `Cache-Control` (`max-age`, `no-cache`, `no-store`) va `ETag` + `If-None-Match` hoat dong the nao? Phan biet **strong cache** va **revalidation**.$s$, $s$Cache co 2 tang:

**1. Strong cache (freshness)** - dung lai tu cache ma KHONG hoi server neu con "tuoi":
- `Cache-Control: max-age=3600` -> tuoi trong 3600s, dung thang tu disk/memory cache.
- `no-cache` -> VAN luu cache nhung phai **revalidate** voi server truoc khi dung (KHONG phai "khong cache").
- `no-store` -> khong luu gi ca (du lieu nhay cam).
- `Cache-Control` uu tien hon header cu `Expires`.

**2. Revalidation (conditional request)** - khi cache het han, browser hoi server con dung duoc khong:
- **ETag** (fingerprint cua noi dung): server tra `ETag: "abc"`. Lan sau browser gui `If-None-Match: "abc"`. Neu chua doi, server tra **304 Not Modified** (khong body) -> dung lai cache, tiet kiem bang thong.
- `Last-Modified` + `If-Modified-Since`: co che tuong tu dua tren thoi gian (kem chinh xac hon ETag).

**Chien luoc pho bien**: file co hash trong ten (`app.abc123.js`) dat `max-age` rat dai + `immutable`; file `index.html` dat `no-cache` de luon revalidate, dam bao user luon lay ban HTML moi tro toi asset moi.$s$, null, null, null, null, null),
  ($s$throttle-scroll-bang-requestanimationframe$s$, (select id from public.topics where slug = $s$browser-perf$s$), 'coding', 'mid', 3, 5, $s$Handler `scroll` chay qua nhieu lan gay giat (jank). Viet **throttle bang requestAnimationFrame** de cap nhat toi da 1 lan moi frame. Vi sao dung `requestAnimationFrame` thay vi `setTimeout`?$s$, $s$`scroll`/`resize`/`mousemove` ban rat nhieu lan/giay. Neu handler lam viec nang (doc layout, cap nhat DOM) se gay jank. Giai phap: **throttle bang requestAnimationFrame** - gom nhieu lan ban thanh toi da 1 lan cap nhat moi frame (~16.7ms o 60fps), dung nhip trinh duyet ve.

```js
function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;          // da co lan cho ve frame -> bo qua
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
}

window.addEventListener('scroll', rafThrottle(() => {
  update(window.scrollY);
}), { passive: true });
```

**Vi sao rAF > setTimeout**: `requestAnimationFrame` chay ngay TRUOC lan repaint ke tiep, tu dong khop refresh rate cua man hinh va **tam dung khi tab an** (tiet kiem pin/CPU). `setTimeout` dung moc thoi gian co dinh, de lech nhip ve -> thua hoac thieu frame.

**Phan biet voi debounce**: throttle = chay deu dan trong khi scroll; debounce = chi chay 1 lan sau khi NGUNG scroll (dung `setTimeout` reset). Dung `{ passive: true }` de listener khong chan cuon trang.$s$, $s$// Xau: chay MOI lan scroll ban ra -> co the hang tram lan/giay
window.addEventListener('scroll', () => {
  update(window.scrollY); // doc/ghi layout lien tuc -> jank
});$s$, $s$js$s$, null, null, null),
  ($s$web-vitals-metric-do-visual-stability$s$, (select id from public.topics where slug = $s$perf-core-web-vitals$s$), 'quiz', 'junior', 2, 5, $s$Core Web Vitals hiện gồm 3 metric chính. Metric nào đo **độ ổn định thị giác (visual stability)** của trang — tức mức độ nội dung bị "nhảy" (layout shift) trong lúc tải?$s$, $s$Đáp án đúng: **b) CLS (Cumulative Layout Shift)**.

- **CLS** đo tổng mức dịch chuyển bố cục bất ngờ của các phần tử đang hiển thị → chính là *visual stability*. Ngưỡng tốt: CLS < 0.1.
- **LCP (Largest Contentful Paint)** đo tốc độ *loading* — thời gian render phần tử nội dung lớn nhất trong viewport (good < 2.5s). Sai vì đo tốc độ, không phải độ ổn định.
- **INP (Interaction to Next Paint)** đo *responsiveness* — độ trễ phản hồi tương tác (good < 200ms). Sai vì đo tính phản hồi.
- **TTFB (Time to First Byte)** là metric phụ trợ đo thời gian server trả byte đầu tiên, không nằm trong 3 Core Web Vitals chính và không đo độ ổn định.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"LCP (Largest Contentful Paint)","explanation":"Sai — LCP đo tốc độ loading của nội dung lớn nhất, không phải độ ổn định."},{"key":"b","text":"CLS (Cumulative Layout Shift)","explanation":"Đúng — CLS đo tổng layout shift, chính là visual stability."},{"key":"c","text":"INP (Interaction to Next Paint)","explanation":"Sai — INP đo responsiveness/độ trễ tương tác."},{"key":"d","text":"TTFB (Time to First Byte)","explanation":"Sai — TTFB là metric phụ đo thời gian phản hồi của server."}]$s$::jsonb, array['b']::text[]),
  ($s$toi-uu-lcp-nguong-va-cach$s$, (select id from public.topics where slug = $s$perf-core-web-vitals$s$), 'theory', 'mid', 3, 5, $s$LCP (Largest Contentful Paint) là gì? Ngưỡng "tốt" là bao nhiêu và nêu các cách tối ưu LCP.$s$, $s$**LCP** đo thời gian render phần tử nội dung **lớn nhất** hiển thị trong viewport (thường là ảnh hero, `<video>` poster, block heading lớn). Nó phản ánh cảm nhận "trang đã tải xong nội dung chính chưa".

**Ngưỡng (đo ở 75th percentile của người dùng thật):**
- Good: **< 2.5s**
- Needs improvement: 2.5s – 4s
- Poor: > 4s

**Cách tối ưu LCP:**
- **Giảm TTFB**: dùng CDN, cache phía server, SSR/streaming.
- **Ưu tiên tải phần tử LCP**: `<link rel="preload">` + `fetchpriority="high"` cho ảnh LCP; **KHÔNG** `loading="lazy"` cho ảnh above-the-fold.
- **Tối ưu ảnh**: format hiện đại (WebP/AVIF), nén, `srcset` responsive để tránh tải ảnh quá lớn.
- **Loại render-blocking resources**: defer/async JS, inline **critical CSS**, tránh CSS/JS chặn render.
- **Ưu tiên font**: preload font, dùng `font-display: swap`.

LCP thường bị chi phối bởi 4 phần: TTFB, resource load delay, resource load time, render delay — cần đo bằng field data (CrUX) chứ không chỉ lab.$s$, null, null, null, null, null),
  ($s$inp-thay-the-fid-khac-biet$s$, (select id from public.topics where slug = $s$perf-core-web-vitals$s$), 'theory', 'senior', 4, 4, $s$Từ tháng 3/2024, INP thay thế FID trong Core Web Vitals. INP khác FID thế nào và làm sao cải thiện INP?$s$, $s$**FID (First Input Delay)** chỉ đo **độ trễ** của tương tác **đầu tiên**, và chỉ tính phần *input delay* (thời gian tương tác phải chờ vì main thread đang bận) — không tính thời gian xử lý event handler hay thời gian vẽ lại.

**INP (Interaction to Next Paint)** đo **mọi** tương tác (click, tap, gõ phím) trong suốt vòng đời trang và báo cáo (gần) giá trị **tệ nhất**. Quan trọng: INP đo **toàn bộ latency** của một tương tác:
1. **Input delay** — chờ main thread rảnh.
2. **Processing time** — thời gian chạy event handler.
3. **Presentation delay** — thời gian đến khi frame kế tiếp được **paint**.

Vì vậy INP phản ánh trải nghiệm phản hồi thực tế đầy đủ hơn FID. Ngưỡng good: **< 200ms**.

**Cách cải thiện INP:**
- **Chia nhỏ long tasks**, yield về main thread (`scheduler.yield()`, `setTimeout`, `await`) để không chặn input.
- **Giảm JS thực thi** trong handler; tránh công việc nặng đồng bộ.
- Trong React: dùng `startTransition`/`useTransition` để đánh dấu cập nhật không khẩn cấp, giữ input phản hồi; tránh re-render đồng bộ tốn kém.
- **Debounce/throttle** handler chạy thường xuyên (scroll, input).
- Tránh **layout thrashing** (đọc/ghi layout xen kẽ); ưu tiên CSS transform cho animation thay vì JS.
- Trì hoãn công việc không cần thiết bằng `requestIdleCallback`.$s$, null, null, null, null, null),
  ($s$sua-layout-shift-cls-anh-khong-kich-thuoc$s$, (select id from public.topics where slug = $s$perf-core-web-vitals$s$), 'coding', 'mid', 3, 5, $s$Đoạn HTML sau gây layout shift (CLS cao) khi ảnh tải xong. Vì sao và sửa thế nào?$s$, $s$**Nguyên nhân:** Thẻ `<img>` không khai báo `width`/`height` nên trước khi ảnh tải xong, browser reserve chiều cao = 0. Khi ảnh tải xong, nó chiếm chỗ và **đẩy** đoạn `<p>` bên dưới xuống → **layout shift** → CLS tăng.

**Cách sửa:** Luôn khai báo `width` và `height` (browser dùng chúng để suy ra `aspect-ratio` và reserve đúng không gian ngay từ đầu). Vẫn responsive nếu thêm CSS `width:100%; height:auto`.

```html
<img src="/hero.jpg" alt="Hero" width="1200" height="600"
     style="width:100%; height:auto;" />
<p>Nội dung bên dưới không còn bị đẩy.</p>
```

Bổ sung: với ảnh chưa biết tỉ lệ, bọc trong container có `aspect-ratio` cố định; với web font, dùng `font-display: swap` + size-adjust để tránh shift do đổi font; và tránh chèn nội dung động (banner, ad) phía trên nội dung đã hiển thị.$s$, $s$<img src="/hero.jpg" alt="Hero" />
<p>Nội dung bên dưới bị đẩy xuống khi ảnh tải xong.</p>$s$, $s$html$s$, null, null, null),
  ($s$lazy-loading-la-gi-cac-cach$s$, (select id from public.topics where slug = $s$perf-lazy-code-splitting$s$), 'theory', 'junior', 2, 4, $s$Lazy loading là gì? Nêu các cách lazy-load tài nguyên trên web.$s$, $s$**Lazy loading** = trì hoãn việc tải một tài nguyên cho đến khi thực sự cần (thường là khi nó sắp vào viewport hoặc khi người dùng cần đến). Mục tiêu: giảm **initial load**, tiết kiệm băng thông và cải thiện thời gian tải trang đầu.

**Các cách lazy-load:**
- **Native lazy loading**: thuộc tính `loading="lazy"` cho `<img>` và `<iframe>` — browser tự trì hoãn tải, không cần JS.
- **IntersectionObserver**: tự phát hiện phần tử sắp vào viewport để tải ảnh/nội dung/data.
- **Code splitting / component-based**: `import()` động + `React.lazy` + `Suspense` để chỉ tải component (route, modal, chart) khi cần.
- **Lazy-load data**: infinite scroll, phân trang, chỉ fetch dữ liệu below-the-fold khi cần.

**Lưu ý:** **KHÔNG** lazy-load ảnh above-the-fold / phần tử **LCP** — làm vậy sẽ trì hoãn LCP và giảm điểm Core Web Vitals.$s$, null, null, null, null, null),
  ($s$react-lazy-suspense-code-splitting-component$s$, (select id from public.topics where slug = $s$perf-lazy-code-splitting$s$), 'coding', 'mid', 3, 4, $s$Một `HeavyChart` (kéo theo thư viện chart nặng) đang nằm trong bundle chính và tải ngay cả khi chưa hiển thị. Hãy tách nó ra (code splitting) và chỉ tải khi cần, dùng React.$s$, $s$Dùng **dynamic `import()`** (tạo split point cho bundler) + **`React.lazy`** + **`Suspense`** để chỉ tải chunk khi component được render:

```jsx
import { lazy, Suspense } from 'react';

// Bundler tách HeavyChart thành chunk riêng, chỉ fetch khi render
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard({ show }) {
  return (
    <Suspense fallback={<Spinner />}>
      {show && <HeavyChart />}
    </Suspense>
  );
}
```

**Cách hoạt động:**
- `import('./HeavyChart')` là dynamic import → webpack/Vite/Rollup tạo một **chunk** riêng, không nằm trong initial bundle.
- `React.lazy` nhận một hàm trả về `import()` và biến nó thành component tải lười.
- `Suspense` hiển thị `fallback` trong lúc chunk đang tải.

**Bổ sung tốt cho production:**
- Bọc trong **Error Boundary** để xử lý khi chunk load fail (mạng lỗi).
- Kết hợp **route-based splitting** để giảm mạnh initial bundle.
- Có thể **prefetch** chunk khi hover/idle để trải nghiệm mượt hơn.$s$, $s$// Trước: import tĩnh -> HeavyChart luôn nằm trong bundle chính
import HeavyChart from './HeavyChart';

function Dashboard({ show }) {
  return <div>{show && <HeavyChart />}</div>;
}$s$, $s$jsx$s$, null, null, null),
  ($s$loading-lazy-attribute-img-quiz$s$, (select id from public.topics where slug = $s$perf-lazy-code-splitting$s$), 'quiz', 'junior', 2, 4, $s$Phát biểu nào **ĐÚNG** về thuộc tính `loading="lazy"` trên thẻ `<img>`?$s$, $s$Đáp án đúng: **b)**.

- **b) Đúng** — `loading="lazy"` là tính năng **native** của browser: trì hoãn tải ảnh cho đến khi ảnh sắp xuất hiện trong viewport, không cần JavaScript.
- **a) Sai** — **KHÔNG** dùng cho ảnh LCP / above-the-fold; lazy-load ảnh quan trọng nhất sẽ làm **chậm LCP** và giảm điểm Core Web Vitals. Ảnh above-the-fold nên tải sớm (thậm chí `fetchpriority="high"`).
- **c) Sai** — đây là hành vi native, **không** bắt buộc IntersectionObserver. IntersectionObserver chỉ cần khi muốn tự cài đặt lazy-load tùy biến hoặc hỗ trợ trình duyệt cũ.
- **d) Sai** — lazy loading không làm ảnh tải "nhanh hơn"; nó **trì hoãn** tải để tiết kiệm băng thông cho nội dung ngoài màn hình.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Nên dùng cho ảnh LCP / above-the-fold để trang tải nhanh hơn","explanation":"Sai — lazy-load ảnh LCP làm chậm LCP; ảnh above-the-fold nên tải sớm."},{"key":"b","text":"Trì hoãn tải ảnh đến khi ảnh sắp vào viewport, được browser hỗ trợ native","explanation":"Đúng — đây là hành vi native, không cần JS."},{"key":"c","text":"Bắt buộc phải kèm JavaScript IntersectionObserver mới hoạt động","explanation":"Sai — native lazy loading không cần IntersectionObserver."},{"key":"d","text":"Làm ảnh tải song song nhanh hơn tất cả ảnh khác","explanation":"Sai — nó trì hoãn tải chứ không tăng tốc."}]$s$::jsonb, array['b']::text[]),
  ($s$tree-shaking-la-gi-dieu-kien$s$, (select id from public.topics where slug = $s$perf-bundle-optimization$s$), 'theory', 'senior', 4, 4, $s$Tree shaking là gì? Cần những điều kiện gì để tree shaking hoạt động hiệu quả?$s$, $s$**Tree shaking** = quá trình bundler (Rollup, webpack, esbuild, Vite) **loại bỏ dead code** — các export được import nhưng không dùng — dựa trên **static analysis** đồ thị module. Kết quả: bundle nhỏ hơn.

**Điều kiện để hoạt động hiệu quả:**
- **Dùng ESM (`import`/`export` tĩnh)**: cú pháp tĩnh cho phép phân tích chính xác cái gì được dùng. CommonJS (`require`) là **động** → khó/không tree-shake được. (Ví dụ: `lodash` CJS không shake được, nên dùng `lodash-es`.)
- **Đánh dấu side effects**: khai báo `"sideEffects": false` trong `package.json` (hoặc liệt kê danh sách file có side effect như `"*.css"`). Nhờ đó bundler tự tin loại module không dùng mà không sợ mất side effect (polyfill, CSS import, đăng ký global).
- **Named import thay vì namespace**: `import { debounce } from '...'` tốt hơn `import * as _`.
- **Production mode + minifier**: cần chạy build production + Terser/esbuild để thực sự **cắt bỏ** code đã được đánh dấu dead (DCE).
- Tránh pattern làm mất tính tĩnh: re-export động, truy cập export qua biến, code có side effect ở top-level.

Tóm lại: tree shaking = *static analysis (ESM) + đánh dấu side effects + minifier loại dead code*.$s$, null, null, null, null, null),
  ($s$import-lodash-tree-shaking-bundle-quiz$s$, (select id from public.topics where slug = $s$perf-bundle-optimization$s$), 'quiz', 'senior', 4, 4, $s$Bạn chỉ cần hàm `debounce` từ `lodash` (package gốc, phát hành dưới dạng CommonJS). Cách import nào cho **bundle NHỎ NHẤT**?$s$, $s$Đáp án đúng: **c) `import debounce from 'lodash/debounce'`**.

`lodash` (bản chính) được phát hành dưới dạng **CommonJS**, không phải ESM, nên bundler **không tree-shake** được — bất kỳ import nào chạm vào `'lodash'` đều kéo **toàn bộ** thư viện (~70KB+).

- **a)** `import _ from 'lodash'` → kéo cả lib. Sai.
- **b)** `import { debounce } from 'lodash'` → **vẫn kéo cả lib** vì lodash là CJS (named import không cứu được). Đây là cái bẫy phổ biến. Sai.
- **c) Đúng** — import trực tiếp **submodule** `lodash/debounce` chỉ bundle đúng hàm đó cùng các dependency nội bộ của nó → nhỏ nhất.
- **d)** `require('lodash')` → kéo cả lib và là CJS. Sai.

**Lưu ý:** Cách sạch hơn là dùng `lodash-es` (bản ESM) rồi `import { debounce } from 'lodash-es'` để bundler tree-shake được; hoặc thay bằng hàm tự viết/`use-debounce`.$s$, null, null, 'single_choice', $s$[{"key":"a","text":"import _ from 'lodash'; _.debounce(...)","explanation":"Sai — kéo toàn bộ lodash."},{"key":"b","text":"import { debounce } from 'lodash'","explanation":"Sai — lodash là CommonJS nên named import vẫn kéo cả lib."},{"key":"c","text":"import debounce from 'lodash/debounce'","explanation":"Đúng — chỉ bundle đúng submodule cần dùng."},{"key":"d","text":"const _ = require('lodash')","explanation":"Sai — require CJS kéo toàn bộ lib, không tree-shake."}]$s$::jsonb, array['c']::text[]),
  ($s$virtualization-windowing-danh-sach-lon$s$, (select id from public.topics where slug = $s$perf-render-optimization$s$), 'theory', 'senior', 4, 3, $s$Virtualization (windowing) khi render danh sách lớn là gì? Khi nào nên dùng và có đánh đổi gì?$s$, $s$**Virtualization (windowing)** = chỉ render các item đang (hoặc sắp) **hiển thị trong viewport** thay vì render toàn bộ danh sách. Khi người dùng scroll, chỉ một "cửa sổ" nhỏ các DOM node được tạo/thay thế; các item ngoài màn hình **không** nằm trong DOM (thường được thay bằng padding/spacer để giữ chiều cao scroll đúng).

**Lợi ích:** giảm mạnh số DOM node → giảm thời gian mount, giảm memory, giảm reflow/repaint → cuộn mượt với danh sách hàng nghìn–hàng chục nghìn item.

**Khi nào dùng:** list/table/grid rất dài (feed, log, bảng dữ liệu lớn). Với vài chục item thì không cần — chi phí phức tạp không đáng.

**Thư viện:** `react-window`, `react-virtualized`, `TanStack Virtual`.

**Đánh đổi / lưu ý:**
- Cần biết/ước lượng **chiều cao item** (fixed hoặc dynamic measurement); nội dung cao thay đổi khó xử lý hơn.
- **Ctrl+F của browser và SEO** không thấy item ngoài DOM.
- Cần lo **accessibility** (focus, ARIA) và các thao tác như "scroll to item", giữ scroll position.
- Có thể có "nháy" khi scroll nhanh nếu overscan quá nhỏ.$s$, null, null, null, null, null),
  ($s$sua-re-render-thua-usememo-usecallback-memo$s$, (select id from public.topics where slug = $s$perf-render-optimization$s$), 'coding', 'mid', 3, 4, $s$Component dưới đây tính toán lọc danh sách lại mỗi lần render và làm `Row` con re-render không cần thiết. Hãy tối ưu bằng memoization.$s$, $s$**Vấn đề:**
1. `items.filter(...)` (O(n)) chạy lại **mỗi lần render**, kể cả khi `items`/`query` không đổi.
2. `onSelect={() => select(i.id)}` tạo một hàm **mới mỗi render** → dù `Row` được bọc `React.memo`, prop `onSelect` luôn "khác" nên `Row` vẫn re-render.

**Tối ưu:**
```jsx
import { memo, useMemo, useCallback } from 'react';

const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items, query }) {
  const filtered = useMemo(
    () => items.filter(i => i.name.includes(query)),
    [items, query]            // chỉ tính lại khi items/query đổi
  );
  const handleSelect = useCallback((id) => select(id), []); // ref ổn định

  return (
    <ul>
      {filtered.map(i => (
        <Row key={i.id} item={i} onSelect={handleSelect} />
      ))}
    </ul>
  );
}
```
- **`useMemo`**: cache kết quả tính toán nặng, chỉ tính lại khi dependency đổi.
- **`useCallback`**: giữ **ổn định tham chiếu** hàm để `React.memo(Row)` so sánh props shallow không thấy đổi → skip re-render.
- **`React.memo`**: chặn re-render con khi props không đổi.

**Lưu ý:** chỉ áp dụng khi đo được vấn đề thật (React DevTools Profiler). Memoization cũng tốn chi phí so sánh + bộ nhớ; lạm dụng có thể phản tác dụng.$s$, $s$function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
}

function List({ items, query }) {
  // chạy lại mỗi render, kể cả khi items/query không đổi
  const filtered = items.filter(i => i.name.includes(query));
  return (
    <ul>
      {filtered.map(i => (
        <Row key={i.id} item={i} onSelect={() => select(i.id)} />
      ))}
    </ul>
  );
}$s$, $s$jsx$s$, null, null, null),
  ($s$cache-control-immutable-hashed-assets$s$, (select id from public.topics where slug = $s$perf-caching-assets$s$), 'theory', 'mid', 3, 4, $s$Giải thích chiến lược caching static asset dùng `Cache-Control` kết hợp tên file có content hash. Vì sao đặt `max-age` rất dài lại an toàn? HTML entry nên cache thế nào?$s$, $s$**Content hashing:** khi build, mỗi asset (JS/CSS/ảnh) được đặt tên kèm hash nội dung, ví dụ `app.4f3a9c.js`. Hash chỉ đổi khi **nội dung** đổi.

**Cache asset:** đặt
```
Cache-Control: public, max-age=31536000, immutable
```
→ browser cache 1 năm và (với `immutable`) **không revalidate** trong thời gian đó.

**Vì sao an toàn với max-age dài?** Vì URL asset gắn với hash: khi nội dung đổi → hash đổi → **tên file (URL) đổi** → browser coi là resource mới và tải về. Một URL cụ thể thì nội dung **không bao giờ** thay đổi, nên cache lâu không gây phục vụ bản cũ (stale). Đây là mô hình "cache-busting bằng tên file".

**HTML entry (index.html):** **KHÔNG** cache dài, vì nó chứa tham chiếu tới tên asset có hash. Dùng:
```
Cache-Control: no-cache        (hoặc max-age ngắn) + ETag
```
→ browser luôn revalidate; nếu chưa đổi server trả **304 Not Modified** (không tải lại body). Khi deploy mới, HTML trỏ tới hash mới → người dùng nhận asset mới ngay.

**ETag / Last-Modified:** dùng cho **revalidation** — client gửi `If-None-Match`/`If-Modified-Since`, server trả 304 nếu không đổi, tiết kiệm băng thông.$s$, null, null, null, null, null),
  ($s$critical-css-la-gi-quiz$s$, (select id from public.topics where slug = $s$perf-caching-assets$s$), 'quiz', 'mid', 3, 3, $s$"Critical CSS" (critical path CSS) là kỹ thuật tối ưu nào?$s$, $s$Đáp án đúng: **b)**.

**Critical CSS** = trích xuất phần CSS **tối thiểu** cần để render nội dung **above-the-fold**, rồi **inline** trực tiếp vào `<head>` của HTML. Nhờ đó browser render được màn hình đầu **ngay** mà không phải chờ tải file CSS ngoài (vốn **render-blocking**) → cải thiện FCP/LCP. Phần CSS còn lại được load **bất đồng bộ** (ví dụ `<link rel="preload" ... onload>` hoặc thủ thuật `media="print" onload`).

**Vì sao các lựa chọn khác sai:**
- **a)** Nén CSS bằng gzip/brotli là tối ưu transfer size, **khác** khái niệm critical CSS.
- **c)** Xóa CSS không dùng (PurgeCSS/unused CSS) làm nhỏ file CSS tổng — hữu ích nhưng **không phải** critical CSS (nó không inline phần above-the-fold).
- **d)** Gộp nhiều file CSS thành một là bundling/giảm số request, cũng khác.

(a, c, d đều là các kỹ thuật tối ưu CSS hợp lệ, nhưng chỉ **b** đúng định nghĩa critical CSS.)$s$, null, null, 'single_choice', $s$[{"key":"a","text":"Nén toàn bộ file CSS bằng gzip/brotli","explanation":"Sai — đó là nén transfer size, không phải critical CSS."},{"key":"b","text":"Inline phần CSS cho nội dung above-the-fold vào <head>, phần còn lại load bất đồng bộ","explanation":"Đúng — đây chính là định nghĩa critical CSS, giúp tránh render-blocking."},{"key":"c","text":"Xóa toàn bộ CSS không dùng bằng PurgeCSS","explanation":"Sai — đó là loại unused CSS, khác critical CSS."},{"key":"d","text":"Gộp tất cả file CSS thành một file duy nhất","explanation":"Sai — đó là bundling để giảm số request."}]$s$::jsonb, array['b']::text[])
on conflict (slug) do nothing;
