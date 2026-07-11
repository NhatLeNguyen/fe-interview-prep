> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# Bộ Phân Loại Kiến Thức (Knowledge Taxonomy) — FE Interview Prep

Tài liệu này là **xương sống nội dung** của toàn dự án. Mọi câu hỏi, quiz, flashcard, lộ trình học đều gắn vào cây phân loại này. Mục tiêu: đủ rộng để bao phủ mọi câu hỏi phỏng vấn FE thực tế (từ basic đến advanced), đủ chặt để query/filter/tag chính xác trong Postgres.

---

## 1. Mô hình phân cấp (Taxonomy Model)

Hệ thống dùng **3 tầng cố định** + tag phẳng để cross-cut:

```
Category (nhóm lớn)  →  Topic (chủ đề con)  →  Knowledge Point / Question Type
        │                      │                        │
   22 categories        ~6-10 topics/category    điểm kiến thức + dạng câu hỏi
```

- **Category**: nhóm kiến thức lớn, ổn định, hiếm khi thay đổi. Là đơn vị điều hướng chính của UI (sidebar, lộ trình học).
- **Topic**: chủ đề con thuộc một category. Là đơn vị gắn **level** (Junior/Mid/Senior) và là mắt xích của spaced-repetition deck.
- **Knowledge Point / Question Type**: điểm kiến thức cụ thể hoặc dạng câu hỏi hay gặp. Đây là nơi câu hỏi thực tế "neo" vào.
- **Tag**: nhãn phẳng (flat), cross-cut nhiều category (ví dụ `#event-loop`, `#big-o`, `#hydration`). Một câu hỏi có 1 category + 1 topic nhưng nhiều tag.

> **Quy ước ngôn ngữ trong toàn bộ nội dung**: giải thích bằng **tiếng Việt**, **giữ nguyên** thuật ngữ tiếng Anh (`closure`, `hoisting`, `reconciliation`, `hydration`, `specificity`...). Không dịch thuật ngữ sang tiếng Việt.

---

## 2. Định nghĩa cấp độ (Level)

| Level | Alias | Ý nghĩa | Đặc điểm câu hỏi |
|---|---|---|---|
| **Junior** | Basic | 0-1.5 năm KN. Hiểu cú pháp, khái niệm nền tảng, làm được UI cơ bản. | Định nghĩa, phân biệt A vs B, đọc/sửa code đơn giản, "cái này là gì". |
| **Mid** | Intermediate | 1.5-4 năm KN. Hiểu cơ chế bên dưới, tối ưu, xử lý edge case. | "Tại sao", "khi nào dùng", debug, trade-off, cơ chế hoạt động. |
| **Senior** | Advanced | 4+ năm KN. Kiến trúc, đánh đổi hệ thống, dẫn dắt quyết định kỹ thuật. | System design, trade-off ở quy mô, performance ở scale, mentoring. |

> **Lưu ý senior**: `level` = độ **thâm niên/kỳ vọng vị trí**, KHÁC với `difficulty` = độ **khó thuần túy** của câu hỏi. Một câu Junior vẫn có thể khó (difficulty cao) nếu đánh lừa. Tách 2 trường này ra (xem schema §3).

---

## 3. Schema Tag & Metadata cho câu hỏi

### 3.1. TypeScript type (nguồn chân lý cho `types/`)

```ts
// types/taxonomy.ts
export type Level = 'junior' | 'mid' | 'senior';

export type QuestionType =
  | 'theory'        // giải thích khái niệm, phân biệt
  | 'coding'        // viết/sửa/đọc code, output prediction
  | 'quiz'          // trắc nghiệm nhiều lựa chọn (dùng cho module Quiz)
  | 'system-design' // thiết kế component/kiến trúc
  | 'behavioral';   // hành vi / soft-skill (STAR)

export type Frequency = 1 | 2 | 3 | 4 | 5;
// 5 = rất hay hỏi (gần như luôn có), 1 = hiếm gặp / nâng cao chuyên sâu

export type Difficulty = 1 | 2 | 3 | 4 | 5; // độ khó thuần túy, độc lập với level

export interface QuestionMeta {
  id: string;                 // uuid
  category: string;           // FK -> categories.slug (vd: 'js-core')
  topic: string;              // FK -> topics.slug   (vd: 'closure')
  subtopic?: string | null;   // optional, mịn hơn topic
  level: Level;
  type: QuestionType;
  tags: string[];             // controlled vocab + free tag, vd ['#event-loop','#async']
  frequency: Frequency;       // độ phổ biến trong phỏng vấn
  difficulty: Difficulty;     // độ khó thuần túy
  estimatedTimeSec: number;   // thời gian trả lời kỳ vọng (giây)
  companies?: string[];       // optional: cty hay hỏi (FAANG, product, outsource...)
  relatedQuestionIds?: string[];
  source?: string | null;     // nguồn tham khảo / link chuẩn
  isDeprecated?: boolean;     // đánh dấu nội dung lỗi thời (vd API cũ)
}

// Nội dung song ngữ tách khỏi meta để i18n & versioning dễ hơn
export interface QuestionContent {
  questionId: string;
  prompt: string;             // đề bài (VI + giữ term EN)
  answerMarkdown: string;     // đáp án chi tiết (VI + term EN), hỗ trợ code block
  // Chỉ dùng khi type = 'quiz':
  options?: { key: string; text: string }[];
  correctKeys?: string[];     // hỗ trợ multi-correct
  optionExplanations?: Record<string, string>; // giải thích từng đáp án
  codeSnippet?: string | null;
  language?: 'ts' | 'js' | 'html' | 'css' | 'jsx' | 'bash' | null;
}
```

### 3.2. Bảng metadata (mô tả từng trường)

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|---|
| `category` | slug | ✅ | Nhóm lớn, FK bảng `categories` | `react` |
| `topic` | slug | ✅ | Chủ đề con, FK bảng `topics` | `hooks-useeffect` |
| `subtopic` | string | ❌ | Mịn hơn topic | `cleanup-function` |
| `level` | enum | ✅ | Thâm niên kỳ vọng | `mid` |
| `type` | enum | ✅ | Dạng câu hỏi | `coding` |
| `tags[]` | string[] | ✅ | Cross-cut, filter nhanh | `['#closure','#memory-leak']` |
| `frequency` | 1-5 | ✅ | Độ hay gặp trong phỏng vấn | `5` |
| `difficulty` | 1-5 | ✅ | Độ khó thuần | `3` |
| `estimatedTimeSec` | int | ✅ | Thời gian trả lời | `120` |
| `companies[]` | string[] | ❌ | Loại/tên cty hay hỏi | `['faang','product']` |
| `relatedQuestionIds[]` | uuid[] | ❌ | Gợi ý câu liên quan (learn-more) | — |
| `source` | url | ❌ | Nguồn chuẩn (MDN, spec, docs) | MDN link |
| `isDeprecated` | bool | ❌ | Đánh dấu lỗi thời | `false` |

### 3.3. Bộ tag chuẩn (controlled vocabulary — khuyến nghị)

Duy trì một bảng `tags` với các tag **được kiểm soát** để tránh loạn tag (`#eventloop` vs `#event-loop`). Nhóm gợi ý:

- **Cơ chế**: `#event-loop`, `#microtask`, `#rendering-pipeline`, `#reconciliation`, `#hydration`, `#gc`, `#specificity`, `#service-worker`, `#history-api`
- **Kỹ năng**: `#output-prediction`, `#debug`, `#refactor`, `#trade-off`, `#optimization`
- **Chủ đề nóng**: `#performance`, `#security`, `#accessibility`, `#async`, `#immutability`, `#caching`, `#forms`, `#validation`, `#i18n`, `#offline`
- **Thư viện/stack**: `#zod`, `#react-hook-form`, `#react-19`, `#url-state`, `#json`, `#regex`, `#web-components`, `#cookie-security`, `#portal`, `#rtl`, `#pwa`, `#lru-cache`
- **Meta phỏng vấn**: `#must-know` (bắt buộc thuộc), `#trick` (câu đánh lừa), `#deep-dive` (đào sâu senior)

> Kết hợp `frequency=5` + tag `#must-know` để build nhanh deck "Top câu phải thuộc trước phỏng vấn".

---

## 4. Cây phân loại đầy đủ (22 Categories)

Với mỗi category: mô tả phạm vi + bảng topic (level trội + điểm kiến thức + dạng câu hỏi hay gặp + frequency 1-5).

> Cột **Level** ghi cấp độ **trội** của topic; nhiều topic trải dài nhiều cấp — câu hỏi cụ thể vẫn gắn level riêng.

---

### C01 — HTML & Semantic `html`
Nền tảng markup, ngữ nghĩa, form, SEO cơ bản. Hay bị xem nhẹ nhưng luôn có ở vòng đầu junior/mid.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `semantic-html` | Junior | thẻ semantic (`header/nav/main/article/section/aside/footer`), `div` vs semantic, outline document | "Vì sao dùng semantic?", chọn thẻ đúng ngữ cảnh | 5 |
| `forms-validation` | Junior | input types, `label`, `required/pattern`, native validation, `FormData` | validate không cần JS, a11y của form | 4 |
| `metadata-seo` | Mid | `<meta>`, `title`, Open Graph, canonical, robots, heading hierarchy | SEO cơ bản cho SPA, heading order | 3 |
| `media-embedding` | Junior | `img` (`srcset`, `alt`, `loading=lazy`), `picture`, `video/audio`, `iframe` | responsive image, lazy load ảnh | 3 |
| `html-attributes-global` | Junior | `data-*`, `aria-*`, `id/class`, `contenteditable`, `tabindex` | `data-*` dùng khi nào | 3 |
| `document-structure` | Junior | DOCTYPE, `head` vs `body`, charset, viewport meta | viewport meta để làm gì | 3 |

---

### C02 — CSS & Layout `css`
Nhóm lớn, cực hay hỏi ở junior/mid, có phần senior (architecture, CSS-in-JS).

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `box-model` | Junior | content/padding/border/margin, `box-sizing`, margin collapse | margin collapse xảy ra khi nào | 5 |
| `flexbox` | Junior | main/cross axis, `justify/align`, `flex-grow/shrink/basis`, `flex:1` | căn giữa, chia layout, `flex-basis` vs `width` | 5 |
| `grid` | Mid | `grid-template`, `fr`, `auto-fit/fill`, `minmax`, area, gap | grid vs flex khi nào, layout responsive không media query | 4 |
| `positioning` | Junior | static/relative/absolute/fixed/sticky, containing block, z-index & stacking context | sticky không hoạt động vì sao, stacking context | 5 |
| `specificity-cascade` | Mid | specificity calc, cascade, `!important`, inheritance, `:where/:is` | tính specificity, vì sao style bị override | 5 |
| `responsive-design` | Junior | media query, mobile-first, đơn vị (`rem/em/%/vw/vh/ch`), `clamp()` | rem vs em, mobile-first vì sao | 5 |
| `selectors-pseudo` | Junior | combinators, pseudo-class/element, attribute selector | `::before` vs `:before`, combinator | 3 |
| `animation-transition` | Mid | `transition`, `@keyframes`, `transform`, `will-change`, GPU compositing, `prefers-reduced-motion` | animate cái gì thì mượt (transform/opacity), reflow | 4 |
| `css-architecture` | Senior | BEM, ITCSS, CSS Modules, scoping, cascade layers `@layer` | scale CSS trong team lớn, tránh xung đột | 3 |
| `preprocessor-sass` | Mid | biến, mixin, nesting, `@use/@forward`, partial | Sass còn cần khi có CSS vars? | 2 |
| `css-in-js` | Mid | styled-components/emotion, runtime vs zero-runtime, RSC compatibility | trade-off CSS-in-JS, vấn đề với RSC | 3 |
| `tailwind` | Mid | utility-first, `@apply`, config/theme, JIT, `cn()` merge, dark mode | utility-first trade-off, tránh class dài | 4 |
| `modern-css` | Senior | container queries, `:has()`, subgrid, logical properties, custom properties | container query vs media query | 2 |

---

### C03 — JavaScript Core `js-core`
**Category quan trọng nhất**, chiếm tỉ trọng câu hỏi lớn nhất. Bao phủ mọi cơ chế nền tảng.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `data-types` | Junior | primitive vs reference, 7 primitive, `typeof`, `NaN`, `null` vs `undefined` | `typeof null`, copy value vs reference | 5 |
| `type-coercion` | Mid | implicit/explicit coercion, `==` vs `===`, truthy/falsy, `+` vs `-` | `[]+[]`, `[]+{}`, output tricky | 4 |
| `scope-hoisting` | Junior | function/block/lexical scope, `var/let/const`, TDZ, hoisting | output với `var` trong loop, TDZ | 5 |
| `strict-mode` | Junior | `'use strict'`, `this = undefined`, cấm implicit global, cấm duplicate param, module ESM tự strict | strict mode thay đổi gì | 2 |
| `closure` | Mid | closure định nghĩa, lexical environment, ứng dụng (encapsulation, memo), memory | loop + `setTimeout`, private var, memory leak | 5 |
| `this-binding` | Mid | `this` 4 rule, arrow vs regular, `call/apply/bind`, mất `this` | `this` trong callback, arrow không có `this` | 5 |
| `prototype-inheritance` | Mid | prototype chain, `__proto__` vs `prototype`, `class` là syntactic sugar, `new` | mô phỏng `new`, inheritance, `instanceof` | 4 |
| `event-loop` | Senior | call stack, task queue vs microtask queue, `setTimeout(0)` vs `Promise` | thứ tự output async, microtask/macrotask | 5 |
| `promises` | Mid | states, chaining, `Promise.all/allSettled/race/any`, error handling | tự implement `Promise.all`, chaining output | 5 |
| `async-await` | Mid | sugar trên Promise, sequential vs parallel, error `try/catch`, top-level await | `await` trong loop (sequential trap), song song hoá | 5 |
| `higher-order-functions` | Junior | `map/filter/reduce`, callback, function as value | tự viết `reduce`, `map` vs `forEach` | 4 |
| `currying-composition` | Mid | currying, partial application, `compose/pipe` | implement curry, ứng dụng | 3 |
| `debounce-throttle` | Mid | định nghĩa, khác biệt, use case, leading/trailing edge | implement debounce/throttle, khi nào dùng | 5 |
| `garbage-collection` | Senior | reachability, mark-and-sweep, memory leak thường gặp (closure, listener, timer) | nguyên nhân leak, cách phát hiện | 3 |
| `pure-functions-immutability` | Mid | pure function, side effect, immutability, `Object.freeze` | vì sao immutability quan trọng | 3 |
| `iterators-generators` | Senior | `Symbol.iterator`, `function*`, `yield`, lazy evaluation | generator để làm gì, iterator protocol | 2 |
| `error-handling` | Mid | `try/catch/finally`, custom Error, async error, error propagation | bắt lỗi async đúng cách | 3 |
| `number-precision` | Mid | IEEE-754, `0.1+0.2`, `Number.isNaN`, `BigInt` | `0.1+0.2 !== 0.3` vì sao | 3 |
| `json-serialization` | Mid | `JSON.parse/stringify`, `replacer`/`reviver`, `toJSON`, mất `undefined`/`function`/`Symbol`, circular reference, clone qua JSON (giới hạn) | vì sao clone qua JSON mất data, circular ref lỗi gì | 4 |
| `regular-expressions` | Mid | cú pháp regex, capturing/non-capturing group, lookahead/lookbehind, flags (`g/i/m/s/u`), `test/match/matchAll/replace`, backtracking | viết regex validate, tách/replace chuỗi | 3 |
| `date-time-intl` | Mid | `Date` gotchas (month 0-index), timezone/UTC vs local, epoch, `Intl.DateTimeFormat`, `Temporal` (đề xuất) | xử lý timezone, format ngày theo locale | 3 |

---

### C04 — ES6+ & Modern JS `es-next`
Cú pháp và tính năng hiện đại. Chồng lấn nhẹ với js-core nhưng tách để filter riêng.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `destructuring-spread` | Junior | array/object destructuring, default, rest/spread, swap | spread copy nông (shallow), rest params | 5 |
| `arrow-functions` | Junior | cú pháp, `this`, không `arguments`, không dùng làm method/constructor | arrow vs function khác gì | 5 |
| `template-literals` | Junior | interpolation, multiline, tagged template | tagged template làm gì | 3 |
| `modules-esm` | Mid | `import/export`, named vs default, dynamic import, ESM vs CommonJS, tree-shaking | ESM vs CJS, dynamic import | 4 |
| `optional-chaining-nullish` | Junior | `?.`, `??`, `??=`, khác `||` | `??` vs `||`, khi nào dùng | 4 |
| `map-set-weakmap` | Mid | `Map/Set` vs object/array, `WeakMap/WeakSet`, use case | Map vs Object, WeakMap để tránh leak | 3 |
| `symbols` | Senior | `Symbol`, well-known symbols, private-ish | Symbol dùng khi nào | 2 |
| `newer-features` | Mid | `Array.at`, `Object.groupBy`, `structuredClone`, top-level await, logical assignment | deep clone hiện đại (`structuredClone`) | 2 |

---

### C05 — TypeScript `typescript`
Bắt buộc trong stack dự án. Rất hay hỏi ở mid/senior.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `basic-types` | Junior | primitives, `any/unknown/never/void`, array/tuple, enum, literal types | `any` vs `unknown`, `never` khi nào | 5 |
| `interface-vs-type` | Junior | `interface` vs `type alias`, declaration merging, extends | interface vs type khác gì | 5 |
| `union-intersection-narrowing` | Mid | union/intersection, type guards, `in/typeof/instanceof`, discriminated union | narrowing, discriminated union | 5 |
| `generics` | Mid | generic function/type, constraints (`extends`), default, `keyof`, inference | viết generic, `keyof T` | 5 |
| `utility-types` | Mid | `Partial/Required/Pick/Omit/Record/Readonly/ReturnType/Parameters` | implement `Pick`, dùng utility | 4 |
| `advanced-types` | Senior | conditional types, mapped types, template literal types, `infer` | conditional type, mapped type | 3 |
| `type-narrowing-guards` | Mid | user-defined type guard `is`, assertion function, exhaustiveness check | custom type guard | 3 |
| `runtime-validation-zod` | Mid | vì sao cần validate ở biên (API/form/env), `zod` schema, `z.infer` type từ schema, `safeParse`, static type vs runtime type | validate env/form với zod, suy type từ schema | 3 |
| `declaration-config` | Mid | `.d.ts`, ambient, `declare`, `tsconfig` (strict, `noImplicitAny`), module resolution | viết `.d.ts`, strict flags | 2 |
| `ts-with-react` | Mid | typing props/hooks, `ReactNode/PropsWithChildren`, event types, generic component | type một component/hook | 4 |

---

### C06 — DOM & Browser `dom-browser`
Cơ chế trình duyệt, rendering, storage, event system, Web APIs, platform APIs.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `dom-manipulation` | Junior | query selectors, create/append, `textContent` vs `innerHTML`, fragment | thao tác DOM hiệu quả | 3 |
| `event-model` | Mid | bubbling/capturing/target, `stopPropagation`, `preventDefault`, `passive` | 3 phase event, capture vs bubble | 5 |
| `event-delegation` | Mid | delegation pattern, lợi ích, `event.target` vs `currentTarget` | vì sao dùng delegation | 4 |
| `rendering-pipeline` | Senior | parse → DOM/CSSOM → render tree → layout → paint → composite | pipeline gồm những bước gì | 4 |
| `reflow-repaint` | Senior | reflow (layout) vs repaint, thao tác gây reflow, batching, layout thrashing | tối ưu tránh reflow | 4 |
| `critical-rendering-path` | Senior | render-blocking CSS/JS, `async/defer`, preload, FOUC | tối ưu CRP, async vs defer | 3 |
| `storage` | Junior | cookie vs localStorage vs sessionStorage vs IndexedDB, dung lượng, scope, security | so sánh storage, chọn cái nào | 5 |
| `browser-apis` | Mid | `fetch`, `IntersectionObserver`, `MutationObserver`, `ResizeObserver`, `requestAnimationFrame` | infinite scroll bằng IO, `rAF` vs `setTimeout` | 3 |
| `history-api-routing` | Mid | `pushState/replaceState`, `popstate`, hash vs history routing, SPA navigation, cách client-side router hoạt động | tự làm client-side router, back/forward | 3 |
| `web-components` | Senior | Custom Elements, Shadow DOM (encapsulation), `<template>`, slot, khi nào dùng, vs React | Web Component là gì, Shadow DOM | 2 |
| `url-to-render` | Mid | end-to-end: DNS → TCP → TLS handshake → HTTP request → server → parse HTML → CRP → render; điểm FE tối ưu | "điều gì xảy ra khi gõ một URL" | 4 |
| `web-workers` | Senior | Web Worker, message passing, khi nào offload, Service Worker vs Web Worker | offload heavy task | 2 |
| `browser-rendering-frame` | Senior | 60fps, frame budget 16ms, `requestIdleCallback` | vì sao animation giật | 2 |

---

### C07 — Network & Security `network-security`
Giao thức, API, và bảo mật FE. Rất hay hỏi từ mid trở lên.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `http-basics` | Junior | methods, status codes, headers, idempotency, request/response cycle | 301 vs 302, idempotent methods | 5 |
| `https-tls` | Mid | TLS handshake, cert, mixed content, HSTS | HTTPS bảo vệ gì | 3 |
| `http-versions` | Senior | HTTP/1.1 keep-alive, HTTP/2 multiplexing, HTTP/3 QUIC, head-of-line blocking | 1.1 vs 2 vs 3 | 3 |
| `rest-api` | Junior | REST principles, resource, verbs, status, versioning | REST là gì, thiết kế endpoint | 4 |
| `graphql` | Mid | query/mutation/subscription, over/under-fetching, schema, N+1 | GraphQL vs REST | 3 |
| `websocket` | Mid | full-duplex, vs HTTP polling/SSE, use case | WebSocket vs polling vs SSE | 3 |
| `cors` | Mid | same-origin policy, preflight (OPTIONS), CORS headers, credentials | CORS error nguyên nhân/fix | 5 |
| `cookie-security` | Mid | `HttpOnly`, `Secure`, `SameSite` (Strict/Lax/None), `Domain/Path`, session vs persistent, vì sao token nên ở HttpOnly cookie | cookie flags bảo vệ gì, SameSite chống CSRF | 4 |
| `xss` | Senior | reflected/stored/DOM XSS, sanitization, `dangerouslySetInnerHTML`, escaping | XSS là gì, chống thế nào | 5 |
| `csrf` | Senior | CSRF cơ chế, token, SameSite cookie, vs XSS | CSRF vs XSS, chống CSRF | 4 |
| `csp` | Senior | Content-Security-Policy, nonce/hash, mitigate XSS | CSP làm gì | 2 |
| `auth-jwt-oauth` | Senior | JWT structure, access/refresh token, storage (cookie vs LS), OAuth 2.0/OIDC flow | JWT lưu ở đâu an toàn, OAuth flow | 5 |
| `caching-headers` | Mid | `Cache-Control`, `ETag`, `Last-Modified`, strong/weak, CDN, stale-while-revalidate | cache-control directives | 4 |
| `client-resilience` | Senior | client-side rate limiting, retry + exponential backoff + jitter, idempotency key, request dedupe/cancel, circuit breaker nhẹ | retry an toàn thế nào, idempotency phía client | 3 |

---

### C08 — React `react`
**Category trọng tâm** cùng js-core. Bao phủ toàn bộ hooks, cơ chế, pattern, React 19.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `jsx-fundamentals` | Junior | JSX → `createElement`, expression, key, fragment, conditional/list render | JSX compile ra gì, key vì sao cần | 5 |
| `components-props` | Junior | function component, props, children, composition, prop drilling | prop drilling giải quyết sao | 4 |
| `state-usestate` | Junior | `useState`, batching, functional update, lazy init, state là immutable | vì sao dùng functional update | 5 |
| `useeffect` | Mid | dependency array, cleanup, mount/update/unmount, race condition, StrictMode double-run | cleanup, deps sai, fetch trong effect | 5 |
| `hooks-rules` | Junior | Rules of Hooks, vì sao không gọi trong điều kiện/loop | vì sao có rules of hooks | 4 |
| `useref-usecontext` | Mid | `useRef` (DOM + mutable), `forwardRef`, `useContext`, context re-render | ref vs state, context tối ưu | 4 |
| `usememo-usecallback` | Mid | memoization, referential equality, khi nào KHÔNG cần, `React.memo` | useMemo vs useCallback, có nên optimize sớm | 5 |
| `usereducer-custom-hooks` | Mid | `useReducer` vs `useState`, tách logic ra custom hook | khi nào useReducer, viết custom hook | 4 |
| `portals` | Mid | `createPortal`, render ngoài cây DOM cha (modal/tooltip/toast), event bubbling qua portal, z-index/overflow | vì sao modal cần portal | 3 |
| `reconciliation-fiber` | Senior | virtual DOM, diffing algorithm, keys, Fiber architecture, concurrent rendering | reconciliation hoạt động sao, Fiber | 4 |
| `virtual-dom` | Mid | vDOM là gì, vì sao, diff & patch, có phải luôn nhanh hơn | vDOM có luôn nhanh hơn DOM? | 4 |
| `controlled-uncontrolled` | Mid | controlled vs uncontrolled input, `defaultValue`, ref form | controlled vs uncontrolled | 4 |
| `error-boundary` | Mid | error boundary, `componentDidCatch`, giới hạn (không bắt async/event) | error boundary bắt được gì | 3 |
| `performance-optimization` | Senior | re-render nguyên nhân, memo strategy, list virtualization, code splitting `lazy/Suspense` | tối ưu re-render, tránh render thừa | 5 |
| `react-patterns` | Senior | HOC, render props, compound component, controlled props, provider pattern | so sánh pattern, khi nào dùng | 3 |
| `hooks-advanced` | Senior | `useLayoutEffect` vs `useEffect`, `useImperativeHandle`, `useId`, `useSyncExternalStore`, `useTransition/useDeferredValue` | layout vs effect, concurrent hooks | 3 |
| `react-lifecycle` | Mid | mapping class lifecycle ↔ hooks, mounting/updating/unmounting | lifecycle bằng hooks | 3 |
| `react-19-features` | Senior | `use()` hook (đọc promise/context), Actions & `<form action>`, `useActionState`, `useFormStatus`, `useOptimistic`, ref-as-prop (bỏ `forwardRef`), Document Metadata | React 19 có gì mới, `use()` khác hook thường | 4 |

---

### C09 — Next.js `nextjs`
Framework của dự án. App Router + RSC là trọng tâm; bao phủ cả phần advanced routing.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `rendering-strategies` | Mid | CSR/SSR/SSG/ISR, khi nào dùng cái nào, hydration | SSR vs SSG vs ISR, chọn thế nào | 5 |
| `app-router` | Mid | file-based routing, `layout/page/loading/error/not-found`, route groups, dynamic segments (`[slug]`), `generateStaticParams` | cấu trúc App Router, nested layout, `generateStaticParams` | 5 |
| `server-components-rsc` | Senior | RSC vs Client Component, `'use client'`, server/client boundary, serialization | RSC là gì, khi nào `'use client'` | 5 |
| `data-fetching` | Mid | fetch trong RSC, `async` component, streaming, Suspense, parallel/sequential fetch | fetch trong App Router | 4 |
| `caching-layers` | Senior | Request Memoization, Data Cache, Full Route Cache, Router Cache, revalidate | 4 tầng cache của Next, `revalidate` | 4 |
| `server-actions` | Mid | `'use server'`, mutation, form action, `revalidatePath/Tag`, progressive enhancement, tích hợp `useActionState`/`useFormStatus` | server action vs API route | 4 |
| `middleware` | Mid | `middleware.ts`, matcher, edge runtime, auth guard, redirect/rewrite | middleware để làm gì | 3 |
| `metadata-seo` | Mid | Metadata API, `generateMetadata`, OG image, sitemap/robots | SEO trong App Router | 3 |
| `image-font-optimization` | Junior | `next/image` (lazy, srcset, blur), `next/font`, CLS | vì sao dùng `next/image` | 3 |
| `route-handlers` | Mid | `route.ts` (API), vs server actions, REST endpoint | API route vs server action | 3 |
| `advanced-routing` | Senior | Parallel Routes (`@slot`), Intercepting Routes (`(.)`, `(..)`, `(...)`), modal-qua-route, `default.js` | parallel/intercepting routes để làm gì | 3 |
| `dynamic-import-next` | Mid | `next/dynamic`, `ssr: false`, lazy component, loading placeholder, code splitting thủ công | `next/dynamic` vs `React.lazy` | 3 |
| `draft-preview-mode` | Mid | Draft Mode, preview nội dung CMS chưa publish, cookie bật/tắt, bypass cache | preview CMS/draft thế nào | 2 |
| `deployment-vercel` | Mid | build output, edge vs node runtime, env vars, ISR trên Vercel | edge vs node runtime | 2 |

---

### C10 — State Management `state-management`
Local vs global, các thư viện, immutability, URL-as-state.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `local-vs-global` | Mid | khi nào cần global state, colocate state, lifting state up | state để đâu, tránh global thừa | 4 |
| `context-api` | Mid | Context re-render problem, split context, `useContext` limits | vì sao Context không thay Redux | 4 |
| `redux-toolkit` | Mid | store/action/reducer, RTK, middleware/thunk, selector, normalize | Redux flow, khi nào cần | 3 |
| `zustand` | Mid | store, selector, shallow, middleware (persist), vs Redux/Context | Zustand vs Redux, tránh re-render | 4 |
| `immutability-state` | Mid | vì sao immutable, `Immer`, structural sharing | mutate state hậu quả | 3 |
| `server-state` | Senior | server state vs client state, React Query/SWR, cache/stale/revalidate | server state là gì, khác client state | 4 |
| `url-search-params-state` | Mid | URL/`searchParams` như single source of truth, đọc/ghi trong RSC & Client, state shareable/bookmarkable, `nuqs`, so với local state; form state cũng có thể lưu ở URL | khi nào state nên ở URL thay vì `useState` | 3 |
| `state-machines` | Senior | XState, finite state machine, khi nào dùng | FSM cho UI phức tạp | 1 |

> Ghi chú: **form state** chuyên sâu (dirty/touched/submission) nằm ở C20 — Forms & Validation; ở đây chỉ đề cập góc "form state ↔ global/URL state".

---

### C11 — Web Performance `performance`
Core Web Vitals và kỹ thuật tối ưu. Senior-heavy.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `core-web-vitals` | Mid | LCP, CLS, INP (thay FID), ngưỡng good/poor, đo bằng gì | LCP/CLS/INP là gì, cải thiện | 5 |
| `loading-optimization` | Mid | lazy loading, code splitting, dynamic import, preload/prefetch, resource hints | code split ở đâu, preload vs prefetch | 4 |
| `bundle-optimization` | Senior | tree shaking, bundle analyze, side effects, chunk strategy, `import cost` | giảm bundle size, tree shaking | 4 |
| `rendering-performance` | Senior | virtualization (windowing), avoid layout thrash, debounce render, `content-visibility` | render list 10k item | 4 |
| `memoization-perf` | Mid | memo hợp lý, tránh over-memoization, referential stability | memo có luôn tốt không | 3 |
| `image-asset-perf` | Junior | format (WebP/AVIF), responsive images, CDN, compression | tối ưu ảnh | 3 |
| `caching-strategies` | Senior | HTTP cache, service worker cache, SWR pattern, CDN | chiến lược cache tổng thể | 3 |
| `runtime-perf-profiling` | Senior | Chrome DevTools Performance, flame chart, long task, memory profiling | debug jank/leak thế nào | 3 |

---

### C12 — Testing `testing`
Unit/integration/e2e, tooling, a11y testing, visual regression.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `testing-fundamentals` | Junior | test pyramid, unit vs integration vs e2e, AAA pattern | testing pyramid, loại test | 4 |
| `jest-vitest` | Mid | matchers, `describe/it`, setup/teardown, snapshot, coverage | snapshot test khi nào | 3 |
| `react-testing-library` | Mid | query priority (`getByRole`), user-centric, `fireEvent` vs `user-event`, `waitFor` | test theo user, query nào ưu tiên | 4 |
| `mocking` | Mid | mock module/function, `jest.fn`, `spyOn`, mock fetch/MSW, timers | mock API bằng gì | 3 |
| `e2e-testing` | Mid | Playwright vs Cypress, selectors, flakiness, CI | e2e vs integration, chống flaky | 3 |
| `accessibility-testing` | Mid | `jest-axe`/`axe-core`, tự động phát hiện a11y violation, giới hạn (không thay manual + screen reader) | test a11y tự động thế nào | 2 |
| `visual-component-testing` | Mid | Storybook (isolate component), visual regression (Chromatic / Playwright snapshot), interaction test | Storybook để làm gì, visual regression | 2 |
| `test-coverage-strategy` | Senior | coverage nghĩa gì, test cái gì đáng, TDD | coverage 100% có tốt không | 2 |

---

### C13 — Build Tools & Tooling `tooling`
Bundler, transpiler, linter, package manager.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `bundlers` | Mid | Webpack (loader/plugin/entry/output), Vite (esbuild + Rollup, dev server), Turbopack | Vite vs Webpack, vì sao Vite nhanh | 4 |
| `transpilation-babel` | Mid | Babel, AST, preset/plugin, polyfill vs transpile, `core-js`, SWC | Babel làm gì, polyfill vs transpile | 3 |
| `linting-formatting` | Junior | ESLint (rules, plugin), Prettier, khác nhau, flat config | ESLint vs Prettier | 3 |
| `package-managers` | Junior | npm vs yarn vs pnpm, lockfile, semver, `^` vs `~`, monorepo/workspaces | pnpm khác npm, semver | 3 |
| `module-systems` | Mid | ESM vs CommonJS, UMD, module resolution, `exports` field | ESM vs CJS trong tooling | 2 |
| `dev-experience` | Mid | HMR, source map, dev vs prod build, env config | HMR hoạt động sao | 2 |

---

### C14 — Accessibility (a11y) `a11y`
WCAG, ARIA, keyboard, screen reader.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `wcag-principles` | Mid | POUR (Perceivable/Operable/Understandable/Robust), A/AA/AAA, contrast ratio | WCAG là gì, mức AA | 3 |
| `semantic-a11y` | Junior | semantic HTML = a11y free, landmark, heading order | semantic giúp a11y sao | 4 |
| `aria` | Mid | ARIA roles/states/properties, khi nào KHÔNG dùng ARIA ("no ARIA > bad ARIA"), `aria-live` | first rule of ARIA | 4 |
| `keyboard-navigation` | Mid | tab order, `tabindex`, focus management, focus trap, skip link | focus trap cho modal | 4 |
| `screen-reader` | Mid | screen reader hoạt động, accessible name, `alt`, `aria-label` | test screen reader thế nào | 3 |
| `accessible-components` | Senior | build accessible modal/dropdown/tabs, WAI-ARIA patterns | thiết kế modal accessible | 3 |
| `forms-a11y` | Junior | label association, error announcement, `aria-invalid/describedby` | form a11y | 3 |

---

### C15 — Design Patterns & FE Architecture `patterns-architecture`
SOLID cho FE, các pattern, kiến trúc.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `solid-fe` | Senior | SOLID diễn giải cho FE/React (SRP component, DIP với props/context) | SOLID áp dụng FE sao | 3 |
| `creational-patterns` | Mid | Singleton, Factory, Module pattern | module pattern là gì | 2 |
| `behavioral-patterns` | Mid | Observer/Pub-Sub, Strategy, Command | observer pattern ví dụ | 3 |
| `structural-patterns` | Mid | Facade, Proxy, Decorator, Adapter | facade trong FE | 2 |
| `architecture-mv` | Senior | MVC/MVVM/MVP, data binding, khác nhau | MVC vs MVVM | 2 |
| `component-architecture` | Senior | container/presentational, atomic design, feature-based folder, separation of concerns | tách logic/UI thế nào (rất khớp yêu cầu dự án) | 4 |
| `micro-frontend` | Senior | micro-frontend, module federation, khi nào cần, trade-off | micro-frontend là gì | 2 |
| `clean-code-fe` | Mid | naming, DRY/KISS/YAGNI, custom hook vs helper vs util (tách bạch) | tách custom hook / helper / constant | 3 |

---

### C16 — Frontend System Design `system-design`
Thiết kế hệ thống/component ở quy mô — vòng senior.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `sd-framework` | Senior | quy trình: requirement → API → data model → component → optimization | tiếp cận bài SD FE thế nào | 4 |
| `design-component-library` | Senior | design system, theming/tokens, API design, a11y, versioning, tree-shakeable | thiết kế component library | 3 |
| `design-autocomplete` | Senior | debounce, caching, cancel request, keyboard nav, a11y, ranking | design autocomplete/typeahead | 4 |
| `design-infinite-scroll` | Senior | IntersectionObserver vs scroll, virtualization, pagination cursor, restore scroll | design infinite scroll/feed | 4 |
| `design-image-carousel` | Mid | lazy load, preload adjacent, a11y, touch/swipe, performance | design carousel/slider | 2 |
| `design-data-table` | Senior | virtualization, sort/filter server vs client, column resize, pagination | design data grid | 2 |
| `design-chat-notification` | Senior | WebSocket/SSE, optimistic UI, offline queue, reconnection | design chat/realtime | 2 |
| `design-form-builder` | Mid | dynamic schema, validation, state, performance nhiều field | design form/wizard | 2 |

---

### C17 — Data Structures & Algorithms for FE `dsa`
DSA thường hỏi cho FE (không phải LeetCode hard, tập trung thực tế).

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `big-o-complexity` | Mid | time/space complexity, phân tích, amortized | Big-O của đoạn code | 5 |
| `array-manipulation` | Junior | two pointers, sliding window, dedupe, flatten, chunk | flatten mảng lồng, sliding window | 5 |
| `string-manipulation` | Junior | reverse, anagram, palindrome, frequency count, parse | anagram, palindrome | 4 |
| `recursion` | Mid | base case, call stack, tree recursion, tail call, vs iteration | flatten đệ quy, đệ quy vs vòng lặp | 4 |
| `hashmap-set-problems` | Mid | dùng Map/Set để O(1) lookup, two-sum, group | two-sum, dùng hashmap tối ưu | 4 |
| `linear-structures` | Mid | stack, queue, deque, linked list (single/double), thao tác & độ phức tạp, khi nào dùng | implement stack/queue, đảo linked list | 3 |
| `tree-graph-basics` | Mid | DOM là tree, DFS/BFS, traverse, tree của UI | traverse DOM tree, DFS/BFS | 3 |
| `sorting-searching` | Mid | binary search, sort stability, custom comparator, `sort` gotcha | `[1,10,2].sort()` output, binary search | 3 |
| `fe-specific-algos` | Mid | implement debounce/throttle/memoize/deepClone/EventEmitter/curry/`Promise.all`/**LRU Cache** | implement `deepClone`, `LRU Cache`, `EventEmitter` | 5 |
| `dynamic-programming-basic` | Senior | memoization, fibonacci, climbing stairs, cơ bản | DP cơ bản có memo | 2 |

---

### C18 — Git & Workflow `git-workflow`
Version control và quy trình làm việc.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `git-basics` | Junior | add/commit/push/pull, staging area, `.gitignore`, HEAD | git flow cơ bản | 4 |
| `branching-merging` | Mid | merge vs rebase, fast-forward, conflict resolution, cherry-pick | merge vs rebase | 4 |
| `git-workflow-models` | Mid | Git Flow, GitHub Flow, trunk-based, feature branch | workflow team dùng | 2 |
| `pr-code-review` | Mid | PR process, review culture, commit convention (Conventional Commits) | quy trình review | 3 |
| `git-advanced` | Senior | interactive rebase, squash, `reflog`, `bisect`, revert vs reset | undo commit, reset vs revert | 2 |
| `ci-cd-basics` | Mid | CI/CD pipeline, GitHub Actions, Vercel deploy, preview deploy | CI/CD là gì (khớp stack dự án) | 3 |

---

### C19 — Behavioral & Soft Skills `behavioral`
Vòng hành vi — luôn có, quyết định offer.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `star-method` | Mid | Situation-Task-Action-Result, cách kể chuyện có cấu trúc | trả lời behavioral bằng STAR | 5 |
| `conflict-teamwork` | Mid | xung đột với đồng nghiệp, disagreement, feedback | "kể lần bất đồng với team" | 4 |
| `ownership-failure` | Mid | thất bại/lỗi production, học được gì, ownership | "kể lần bạn làm hỏng việc" | 4 |
| `project-deep-dive` | Mid | mô tả dự án khó nhất, quyết định kỹ thuật, trade-off | "dự án tự hào nhất" | 4 |
| `communication-stakeholder` | Senior | giải thích kỹ thuật cho non-tech, đàm phán deadline | giải thích cho PM/khách | 3 |
| `growth-learning` | Junior | cách học công nghệ mới, cập nhật xu hướng | "học điều mới thế nào" | 3 |
| `questions-to-ask` | Junior | câu hỏi hỏi ngược interviewer | hỏi lại nhà tuyển dụng gì | 2 |

---

### C20 — Forms & Validation `forms`
Xử lý form là công việc FE hằng ngày và hay bị đào sâu ở mid. Stack dự án dùng **react-hook-form + zod**; tách category riêng vì form cắt ngang React + validation + state + a11y.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `form-fundamentals` | Junior | controlled vs uncontrolled form, `value/onChange` vs `defaultValue`/ref, single source of truth, `FormData` | controlled vs uncontrolled form | 4 |
| `react-hook-form` | Mid | `useForm`, `register`, uncontrolled-first (ít re-render), `Controller` cho controlled UI lib, `formState`, `handleSubmit` | vì sao RHF ít re-render, khi nào cần `Controller` | 4 |
| `schema-validation-zod` | Mid | `zod` schema, `zodResolver`, `z.infer` type, một nguồn validate dùng chung client + server (Server Action) | validate form bằng zod schema, tái dùng schema | 4 |
| `async-validation` | Mid | validate bất đồng bộ (check username tồn tại), debounce input, map server error về field | async validation, hiển thị lỗi từ server | 3 |
| `field-arrays-dynamic` | Mid | `useFieldArray`, thêm/xoá field động, nested form, multi-step/wizard | form động nhiều dòng, wizard | 3 |
| `form-state-ux` | Mid | `isDirty/isValid/touchedFields/isSubmitting`, submit + `useOptimistic`, `reset`, error summary + a11y (liên kết C14 `forms-a11y`) | quản lý trạng thái submit/lỗi, optimistic submit | 3 |

---

### C21 — Internationalization (i18n) `i18n`
App song ngữ Việt-Anh nên i18n là kiến thức nền của chính dự án, đồng thời là chủ đề phỏng vấn cho sản phẩm global. Bao gồm cả `Intl` API và localization.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `i18n-fundamentals` | Mid | tách text khỏi code, message catalog/keys, namespace, fallback locale, thư viện (`next-intl`, `react-i18next`) | tổ chức bản dịch thế nào, i18n vs l10n | 3 |
| `intl-formatting` | Mid | `Intl.NumberFormat/DateTimeFormat/RelativeTimeFormat/ListFormat`, currency, timezone, locale-aware | format số/tiền/ngày theo locale | 3 |
| `pluralization-messageformat` | Mid | ICU MessageFormat, plural rules, gender/select, interpolation an toàn (chống XSS) | xử lý số nhiều đa ngôn ngữ | 2 |
| `rtl-bidi` | Senior | RTL layout, thuộc tính `dir`, CSS logical properties (`margin-inline`, `padding-block`), mirroring icon | hỗ trợ RTL thế nào | 2 |
| `locale-routing` | Mid | locale routing trong Next.js App Router, detection (Accept-Language/cookie), `[locale]` segment, hreflang & SEO đa ngữ | locale routing & SEO đa ngôn ngữ | 3 |
| `translation-workflow` | Senior | key management, lazy-load bản dịch theo route, tránh bundle toàn bộ ngôn ngữ, quy trình handoff cho translator | tối ưu tải bản dịch, tránh phình bundle | 2 |

---

### C22 — PWA & Offline `pwa`
Progressive Web App, Service Worker và offline-first — nền tảng cho trải nghiệm resilient (khớp nguyên tắc offline-tolerant). Kiến trúc `type` để sẵn cho phase sau.

| Topic (slug) | Level | Điểm kiến thức chính | Dạng câu hỏi hay gặp | Freq |
|---|---|---|---|---|
| `pwa-fundamentals` | Mid | Web App Manifest, installability, add-to-home-screen, tiêu chí PWA, yêu cầu HTTPS | PWA gồm những gì | 2 |
| `service-worker-lifecycle` | Senior | register → install → activate, scope, `skipWaiting`/`clients.claim`, update flow, gotcha | vòng đời service worker | 3 |
| `sw-caching-strategies` | Senior | cache-first, network-first, stale-while-revalidate, cache versioning/cleanup, Workbox | chọn chiến lược cache offline | 3 |
| `offline-first` | Senior | offline UX, `navigator.onLine`, IndexedDB queue, Background Sync, conflict/resync | app hoạt động offline thế nào | 2 |
| `push-notifications` | Senior | Push API, Notifications API, subscription, permission UX | web push hoạt động sao | 1 |
| `app-shell` | Mid | app shell model, precache khung UI, tách shell vs content | app shell là gì | 1 |

---

## 5. Đề xuất số lượng câu hỏi seed

Chiến lược **2 giai đoạn**: seed **MVP** để launch có nội dung chất lượng ngay, sau đó bổ sung dần tới **Full** qua trang Admin. Con số theo tỉ trọng phỏng vấn thực tế (React + JS Core nặng nhất).

| # | Category | MVP (launch) | Full (target) | Ghi chú ưu tiên |
|---|---|---:|---:|---|
| C01 | HTML | 15 | 40 | high-freq junior |
| C02 | CSS | 35 | 90 | core, hỏi nhiều |
| C03 | JavaScript Core | 62 | 165 | **trọng tâm #1** |
| C04 | ES6+ | 20 | 50 | |
| C05 | TypeScript | 30 | 78 | bắt buộc trong stack (+ zod runtime) |
| C06 | DOM & Browser | 32 | 90 | + History API, Web Components, URL-to-render |
| C07 | Network & Security | 34 | 92 | senior-value cao (+ cookie security, resilience) |
| C08 | React | 66 | 170 | **trọng tâm #2** (+ Portals, React 19) |
| C09 | Next.js | 40 | 110 | framework dự án (+ advanced routing) |
| C10 | State Management | 22 | 55 | + URL-as-state |
| C11 | Web Performance | 26 | 70 | senior-value cao |
| C12 | Testing | 24 | 68 | + a11y test, visual regression |
| C13 | Build Tools | 16 | 45 | |
| C14 | Accessibility | 16 | 45 | |
| C15 | Patterns & Architecture | 20 | 55 | |
| C16 | System Design FE | 16 | 50 | vòng senior |
| C17 | DSA for FE | 36 | 105 | coding round (+ LRU, linear structures) |
| C18 | Git & Workflow | 12 | 30 | |
| C19 | Behavioral | 18 | 45 | |
| C20 | Forms & Validation | 18 | 45 | **khớp stack RHF + zod** |
| C21 | Internationalization | 12 | 35 | app song ngữ |
| C22 | PWA & Offline | 12 | 35 | offline-tolerant |
| | **TỔNG** | **~582** | **~1,568** | |

**Phân bổ theo level (khuyến nghị cho bản Full)** để lộ trình junior→senior cân bằng:

| Level | Tỉ lệ | Số câu (~) |
|---|---:|---:|
| Junior | 35% | ~550 |
| Mid | 40% | ~627 |
| Senior | 25% | ~392 |

**Phân bổ theo type** (để module Quiz và Coding đủ nguyên liệu):

| Type | Tỉ lệ gợi ý | Ghi chú |
|---|---:|---|
| `theory` | 45% | ngân hàng câu hỏi chính + flashcard |
| `quiz` | 25% | phục vụ module Quiz chấm điểm |
| `coding` | 18% | output prediction + implement (DSA, JS, React, Forms) |
| `system-design` | 7% | vòng senior |
| `behavioral` | 5% | vòng HR/culture |

> **Nguyên tắc chất lượng seed**: mỗi topic có tối thiểu **1 câu junior + 1 mid + (nếu áp dụng) 1 senior**, và mọi câu `frequency ≥ 4` phải nằm trong MVP. Ưu tiên **độ sâu đáp án** hơn số lượng — một câu `closure` giải thích kèm memory model + ví dụ code + bẫy thường gặp giá trị hơn 5 câu hời hợt.

---

## 6. Câu hỏi mẫu minh hoạ định dạng song ngữ

Dưới đây 5 câu ở các category/level/type khác nhau, kèm metadata đầy đủ, minh hoạ chuẩn nội dung (giải thích tiếng Việt, giữ term tiếng Anh).

### Mẫu 1 — JS Core / Closure (Mid, coding, output prediction)

```yaml
category: js-core
topic: closure
level: mid
type: coding
tags: ['#closure', '#scope-hoisting', '#output-prediction', '#must-know']
frequency: 5
difficulty: 3
estimatedTimeSec: 90
```

**Đề bài:** Đoạn code sau in ra gì? Giải thích tại sao và cách sửa để in ra `0 1 2`.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```

**Đáp án chi tiết:**
In ra `3 3 3`.

Nguyên nhân là do `var` có **function scope** (không phải block scope), nên chỉ tồn tại **một biến `i` duy nhất** được chia sẻ cho cả 3 lần lặp. Callback của `setTimeout` là các `closure` "bắt" (capture) **tham chiếu tới cùng biến `i`** đó, chứ không phải giá trị tại thời điểm tạo callback. Vì `setTimeout` là **macrotask**, callback chỉ chạy sau khi vòng lặp đã kết thúc (lúc này `i === 3`). Khi call stack rỗng, event loop mới lấy các callback ra chạy → cả 3 đều đọc `i === 3`.

**Cách sửa:**
1. Dùng `let` (block scope → mỗi vòng lặp tạo một binding `i` mới):
```js
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 100);
```
2. Hoặc tạo closure riêng bằng IIFE (cách cũ trước ES6):
```js
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i);
}
```

**Bẫy thường gặp:** ứng viên trả lời `0 1 2` vì tưởng closure bắt *giá trị*. Điểm mấu chốt: closure bắt **biến (reference)**, không phải snapshot giá trị.

---

### Mẫu 2 — React / useEffect (Mid, theory)

```yaml
category: react
topic: useeffect
level: mid
type: theory
tags: ['#useeffect', '#cleanup', '#race-condition', '#async', '#must-know']
frequency: 5
difficulty: 3
estimatedTimeSec: 120
```

**Đề bài:** Khi fetch dữ liệu trong `useEffect` dựa theo một `id` thay đổi, tại sao cần cleanup function? Nếu bỏ qua thì hậu quả là gì?

**Đáp án chi tiết:**
Khi `id` thay đổi nhanh (ví dụ user chuyển tab liên tục), mỗi lần đổi sẽ trigger một request mới, nhưng các request **không đảm bảo trả về đúng thứ tự** (network là bất định). Đây là **race condition**: response của request cũ có thể về **sau** response của request mới và **ghi đè** state → UI hiển thị dữ liệu của `id` cũ dù đang xem `id` mới (stale data).

`cleanup function` chạy **trước mỗi lần effect chạy lại** (và khi unmount), cho ta cơ hội "vô hiệu hoá" kết quả của request cũ:

```tsx
useEffect(() => {
  let ignore = false;
  fetchUser(id).then((data) => {
    if (!ignore) setUser(data); // chỉ set nếu chưa bị cleanup
  });
  return () => { ignore = true; }; // cleanup: đánh dấu bỏ qua kết quả cũ
}, [id]);
```

Cách chuẩn hơn: dùng `AbortController` để **huỷ hẳn** request cũ (`return () => controller.abort()`).

**Lưu ý bổ sung (senior):** trong `React.StrictMode` ở dev, effect chạy 2 lần (mount → cleanup → mount) một cách cố ý để phát hiện effect thiếu cleanup. Ở production tốt nhất nên dùng thư viện server-state (React Query/SWR) vì chúng xử lý race condition, cache, dedupe sẵn.

---

### Mẫu 3 — CSS / Flexbox (Junior, quiz — trắc nghiệm)

```yaml
category: css
topic: flexbox
level: junior
type: quiz
tags: ['#flexbox', '#box-model', '#must-know']
frequency: 5
difficulty: 2
estimatedTimeSec: 45
```

**Đề bài:** Trong Flexbox, thuộc tính nào căn các item theo **cross axis** (trục vuông góc với `flex-direction`)?

- **A.** `justify-content`
- **B.** `align-items`
- **C.** `flex-wrap`
- **D.** `order`

**Đáp án đúng:** **B**

**Giải thích từng lựa chọn:**
- **A. `justify-content`** — Sai. Căn theo **main axis** (trục chính, cùng hướng `flex-direction`).
- **B. `align-items`** ✅ — Đúng. Căn item theo **cross axis** (trục phụ). Ví dụ khi `flex-direction: row` thì cross axis là chiều dọc → `align-items: center` căn giữa theo chiều dọc.
- **C. `flex-wrap`** — Sai. Quyết định item có xuống dòng khi tràn hay không.
- **D. `order`** — Sai. Đổi thứ tự hiển thị item, không liên quan căn chỉnh.

**Mẹo nhớ:** `justify` = **main axis**, `align` = **cross axis**. Đổi `flex-direction` sang `column` thì 2 trục hoán đổi ý nghĩa.

---

### Mẫu 4 — Next.js / RSC (Senior, theory)

```yaml
category: nextjs
topic: server-components-rsc
level: senior
type: theory
tags: ['#hydration', '#rsc', '#server-client-boundary', '#must-know']
frequency: 5
difficulty: 4
estimatedTimeSec: 180
```

**Đề bài:** React Server Components (RSC) trong Next.js App Router khác Client Components thế nào? Khi nào **bắt buộc** phải thêm `'use client'`?

**Đáp án chi tiết:**
Mặc định trong App Router, mọi component là **Server Component** — render **trên server**, không gửi JS của component đó xuống client, và **không tham gia hydration**. Lợi ích: bundle nhỏ hơn, truy cập trực tiếp backend/DB/secret an toàn, fetch data ngay trong component (`async` component).

**Client Component** (`'use client'`) được prerender trên server rồi **hydrate** trên client để có tính tương tác.

**Bắt buộc `'use client'` khi component cần một trong các thứ chỉ có ở client:**
1. **State & hooks tương tác**: `useState`, `useReducer`, `useEffect`, `useRef`...
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`...
3. **Browser-only API**: `window`, `document`, `localStorage`, `IntersectionObserver`...
4. **Class components** hoặc thư viện phụ thuộc các thứ trên (nhiều context provider, framer-motion...).

**Nguyên tắc kiến trúc (điểm senior):**
- Đẩy `'use client'` **xuống càng thấp (lá) càng tốt** trên cây component để giữ phần lớn cây là Server Component → giảm JS gửi xuống client.
- **Server → Client boundary**: props truyền từ Server sang Client phải **serializable** (không truyền function, class instance, Date phức tạp — chỉ plain object/primitive).
- Có thể truyền **Server Component làm `children`** vào Client Component (composition) để "chèn" server content vào bên trong client wrapper mà không biến nó thành client — pattern quan trọng để tránh "client hoá" lan rộng.

---

### Mẫu 5 — DSA for FE / Implement (Mid, coding)

```yaml
category: dsa
topic: fe-specific-algos
level: mid
type: coding
tags: ['#debounce-throttle', '#closure', '#fe-specific-algos', '#must-know']
frequency: 5
difficulty: 3
estimatedTimeSec: 240
```

**Đề bài:** Tự implement hàm `debounce(fn, delay)`. Giải thích khác biệt với `throttle` và một use case thực tế.

**Đáp án chi tiết:**

```js
function debounce(fn, delay) {
  let timerId; // giữ trong closure, tồn tại giữa các lần gọi
  return function (...args) {
    clearTimeout(timerId);          // huỷ lịch cũ nếu lại được gọi
    timerId = setTimeout(() => {
      fn.apply(this, args);         // giữ đúng `this` và tham số
    }, delay);
  };
}
```

**Cơ chế:** `debounce` gom một chuỗi lời gọi liên tiếp và **chỉ chạy `fn` một lần sau khi ngừng gọi `delay` ms**. Mỗi lần gọi mới sẽ `clearTimeout` cái cũ → reset đồng hồ. `timerId` được giữ nhờ **closure**.

**Debounce vs Throttle:**

| | Debounce | Throttle |
|---|---|---|
| Cơ chế | Chạy sau khi **ngừng** gọi `delay` ms | Chạy **tối đa 1 lần** mỗi `delay` ms |
| Ví dụ trực quan | Chờ user gõ xong mới search | Cứ 200ms xử lý scroll một lần |
| Use case | Search input autocomplete, resize xong mới tính | Scroll/mousemove/infinite-scroll, rate-limit |

**Use case thực tế:** ô search autocomplete — không gọi API mỗi ký tự user gõ, mà đợi user ngừng gõ ~300ms mới gọi → giảm số request đáng kể.

**Điểm cộng (senior):** hỏi thêm về `leading`/`trailing` edge (chạy ngay lần đầu hay chỉ lần cuối), và hàm `cancel()` để huỷ pending call — đây là những chi tiết phân biệt ứng viên mid vs senior.

---

## 7. Ghi chú triển khai DB (gợi ý ánh xạ)

Để taxonomy này "sẵn sàng mở rộng" đúng như yêu cầu kiến trúc:

- **Bảng `categories`**: `slug` (PK-ish, unique), `name_vi`, `name_en`, `order`, `icon`, `description`. → 22 dòng.
- **Bảng `topics`**: `slug`, `category_slug` (FK), `name_vi`, `name_en`, `default_level`, `order`. → ~210 dòng.
- **Bảng `questions`**: theo `QuestionMeta` (§3.1), FK tới `topics`.
- **Bảng `question_contents`**: tách nội dung (song ngữ/versioning) theo `QuestionContent`.
- **Bảng `tags`** + **`question_tags`** (many-to-many): controlled vocabulary.
- **`level`, `type`, `frequency`** dùng Postgres `enum` hoặc `check constraint` để type-safe khớp với TS union types (đồng bộ 1-1 giữa DB enum và `types/taxonomy.ts`).
- **RLS**: `questions`/`contents` cho phép `SELECT` với mọi user đã đăng nhập (hoặc public read); `INSERT/UPDATE/DELETE` chỉ cho role `admin` (dùng cho trang Admin). Bảng tiến độ cá nhân (`user_progress`, `bookmarks`, `srs_reviews`) filter theo `auth.uid() = user_id`.
- **Mở rộng Phase sau** (Coding challenge, Mock interview): thêm `type` mới (`live-coding`, `mock`) vào enum + bảng phụ, **không phá vỡ** schema hiện tại — vì taxonomy đã tách `type` khỏi `category/topic`. Các category mới (Forms, i18n, PWA) và topic bổ sung cũng chỉ là thêm dòng vào `categories`/`topics`, không đổi cấu trúc.

Đây là bộ khung phân loại đầy đủ (basic → advanced) để bắt đầu seed nội dung chất lượng cao và build UI điều hướng/lộ trình học theo cấp độ junior → senior.