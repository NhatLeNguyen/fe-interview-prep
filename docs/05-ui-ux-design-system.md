> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

Thư mục dự án trống (greenfield). Dưới đây là hệ thống thiết kế hoàn chỉnh — trả về trực tiếp dưới dạng Markdown, sẵn sàng dán vào `app/globals.css` và `tailwind.config.ts`.

---

# Design System — FE Interview Prep

> Tài liệu hệ thống thiết kế (design system) cho nền tảng luyện phỏng vấn Front-end. Song ngữ Việt–Anh: giải thích tiếng Việt, giữ nguyên thuật ngữ kỹ thuật (closure, hoisting, reconciliation...). Tối ưu cho Next.js 15 + Tailwind + shadcn/ui + dark mode.

Mục lục:
1. [Ngôn ngữ thiết kế (Design Language)](#1-ngon-ngu-thiet-ke)
2. [Design Tokens](#2-design-tokens)
3. [Component Inventory](#3-component-inventory)
4. [Layout & App Shell](#4-layout--app-shell)
5. [UI Notes theo từng trang](#5-ui-notes-theo-tung-trang)
6. [Accessibility (A11y)](#6-accessibility)
7. [Micro-interactions & Polish](#7-micro-interactions--polish)
8. [Icon, Illustration & Syntax Highlight](#8-icon-illustration--syntax-highlight)

---

## 1. Ngôn ngữ thiết kế

### 1.1. Ba hướng (mood board bằng chữ)

| Hướng | Từ khóa cảm xúc | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A. "Focused Studio"** (chọn) | clean, low-distraction, subtle depth, developer aesthetic, mono accents, calm confidence | Dễ đọc lâu, hợp "học tập nghiêm túc", dark mode đẹp, không gây mỏi mắt | Cần polish micro-interaction để không bị "nhạt" |
| **B. "Neon Terminal"** | high-contrast, glow, cyber, mono-first, tech-heavy | Rất "dev", ấn tượng ngay | Chói, khó đọc văn bản dài, dễ lỗi thời, a11y kém |
| **C. "Friendly Course"** | soft, rounded, illustrative, pastel, gamified vui | Thân thiện, hợp junior | Dễ trông "trẻ con", thiếu uy tín cho senior track |

### 1.2. Hướng đã chọn — "Focused Studio"

Triết lý: **Giao diện lùi về sau, nội dung tiến ra trước.** Người dùng đến đây để *học và luyện tập lâu*, nên nền tảng phải yên tĩnh, tương phản tốt, ít nhiễu — nhưng vẫn có "chất dev" qua mono type cho code/metadata và các accent tinh tế.

Nguyên tắc cốt lõi:
- **Content-first, chrome-quiet:** sidebar/topbar dùng màu muted, primary chỉ xuất hiện ở hành động chính (CTA, active state, progress).
- **Subtle depth, not flat, not heavy:** dùng border 1px + shadow rất nhẹ (light mode) / border sáng nhẹ + surface elevation (dark mode). Không đổ bóng nặng.
- **Mono as accent, not as body:** JetBrains/Geist Mono cho `code`, level badge, mã câu hỏi (`JS-014`), số liệu dashboard, phím tắt `⌘K`. Body vẫn là sans để dễ đọc.
- **Calm gamification:** streak/level/progress dùng amber + emerald có kiểm soát, không "loè loẹt game".
- **One accent hue lãnh đạo:** Indigo/Violet là "giọng nói thương hiệu" xuyên suốt; các màu semantic chỉ dùng đúng ngữ cảnh.

Cảm giác cuối cùng cần đạt: *"Một chiếc IDE/Docs được thiết kế lại bởi một studio có gu"* — sạch, tập trung, đáng tin, hơi tối giản.

---

## 2. Design Tokens

### 2.1. Bảng màu — nguyên lý

- **Primary (Brand):** Indigo/Violet — hiện đại, techy, dark mode đẹp.
- **Accent (gamification):** Amber — streak, highlight, "phần thưởng".
- **Neutral scale:** Slate (hơi lạnh) — nền, chữ, border. Dark mode dùng deep slate (không dùng pure black `#000` để tránh gắt và cho phép elevation).
- **Semantic:** Emerald (success), Amber (warning), Rose/Red (danger), Sky (info).

> **Lưu ý quan trọng về quy ước shadcn:** trong shadcn, token `--accent` **KHÔNG** phải màu thương hiệu nổi bật — nó là màu nền muted cho hover/active của item. Vì vậy ta giữ `--accent` trung tính (theo chuẩn shadcn) và định nghĩa **thêm** các token thương hiệu/semantic riêng (`--success`, `--warning`, `--info`, `--brand-amber`). Điều này giúp component shadcn hoạt động đúng mà vẫn có palette mở rộng.

### 2.2. Bảng token màu (giá trị HSL cụ thể — Light & Dark)

Định dạng HSL không có `hsl()` để map thẳng vào biến CSS shadcn (`hsl(var(--x))`).

#### Core surfaces & text

| Token (CSS var) | Vai trò | Light `H S% L%` | Dark `H S% L%` |
|---|---|---|---|
| `--background` | Nền toàn app | `0 0% 100%` | `224 44% 8%` |
| `--foreground` | Chữ chính | `222 47% 11%` | `210 40% 98%` |
| `--card` | Nền card/surface nổi | `0 0% 100%` | `223 43% 11%` |
| `--card-foreground` | Chữ trên card | `222 47% 11%` | `210 40% 98%` |
| `--popover` | Nền popover/dropdown/command | `0 0% 100%` | `223 43% 11%` |
| `--popover-foreground` | Chữ trên popover | `222 47% 11%` | `210 40% 98%` |
| `--muted` | Nền muted (chip, hover nhẹ) | `210 40% 96%` | `217 33% 16%` |
| `--muted-foreground` | Chữ phụ, metadata | `215 16% 47%` | `215 20% 65%` |
| `--border` | Đường viền | `214 32% 91%` | `217 33% 20%` |
| `--input` | Viền input | `214 32% 91%` | `217 33% 22%` |

#### Brand & interactive

| Token | Vai trò | Light | Dark |
|---|---|---|---|
| `--primary` | Màu thương hiệu, CTA chính | `243 75% 59%` | `243 75% 62%` |
| `--primary-foreground` | Chữ trên primary | `210 40% 98%` | `210 40% 98%` |
| `--secondary` | Nút phụ, nền secondary | `210 40% 96%` | `217 33% 18%` |
| `--secondary-foreground` | Chữ trên secondary | `222 47% 11%` | `210 40% 98%` |
| `--accent` (shadcn hover bg) | Nền hover/active của item | `243 75% 96%` | `243 40% 20%` |
| `--accent-foreground` | Chữ trên accent | `243 60% 40%` | `243 90% 90%` |
| `--ring` | Focus ring | `243 75% 59%` | `243 85% 70%` |

#### Semantic (mở rộng — thêm ngoài chuẩn shadcn)

| Token | Vai trò | Light | Dark |
|---|---|---|---|
| `--success` | Đúng đáp án, hoàn thành | `160 84% 39%` | `158 64% 52%` |
| `--success-foreground` | Chữ trên success | `0 0% 100%` | `160 90% 12%` |
| `--warning` | Cảnh báo, "cần ôn lại" | `38 92% 50%` | `43 96% 56%` |
| `--warning-foreground` | Chữ trên warning | `38 95% 12%` | `38 95% 12%` |
| `--destructive` | Sai đáp án, xóa | `0 84% 60%` | `0 72% 58%` |
| `--destructive-foreground` | Chữ trên destructive | `0 0% 100%` | `0 0% 100%` |
| `--info` | Thông tin, gợi ý | `199 89% 48%` | `198 90% 60%` |
| `--info-foreground` | Chữ trên info | `0 0% 100%` | `199 90% 12%` |
| `--brand-amber` | Streak, XP, highlight thưởng | `38 92% 50%` | `43 96% 56%` |

#### Difficulty (dùng cho DifficultyIndicator / LevelBadge)

| Token | Cấp độ | Light | Dark |
|---|---|---|---|
| `--diff-junior` | Junior / Easy | `160 84% 39%` (emerald) | `158 64% 52%` |
| `--diff-mid` | Mid / Medium | `38 92% 50%` (amber) | `43 96% 56%` |
| `--diff-senior` | Senior / Hard | `0 84% 60%` (rose) | `0 72% 62%` |

#### Chart / progress (dashboard)

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `243 75% 59%` | `243 75% 65%` |
| `--chart-2` | `160 84% 39%` | `158 64% 52%` |
| `--chart-3` | `38 92% 50%` | `43 96% 56%` |
| `--chart-4` | `199 89% 48%` | `198 90% 60%` |
| `--chart-5` | `280 65% 60%` | `280 70% 68%` |

#### Sidebar (token riêng của shadcn sidebar)

| Token | Light | Dark |
|---|---|---|
| `--sidebar-background` | `210 40% 98%` | `224 47% 6%` |
| `--sidebar-foreground` | `215 25% 27%` | `210 30% 88%` |
| `--sidebar-primary` | `243 75% 59%` | `243 75% 65%` |
| `--sidebar-primary-foreground` | `210 40% 98%` | `210 40% 98%` |
| `--sidebar-accent` | `243 75% 96%` | `243 40% 18%` |
| `--sidebar-accent-foreground` | `243 60% 40%` | `243 90% 90%` |
| `--sidebar-border` | `214 32% 91%` | `217 33% 16%` |
| `--sidebar-ring` | `243 75% 59%` | `243 85% 70%` |

### 2.3. `globals.css` — dán trực tiếp

> File: `app/globals.css` (tạo mới). Dùng cùng `darkMode: ["class"]` trong Tailwind config; class `.dark` gắn ở `<html>` thông qua `next-themes`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* radius */
    --radius: 0.75rem;

    /* surfaces & text */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;

    /* brand & interactive */
    --primary: 243 75% 59%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --accent: 243 75% 96%;
    --accent-foreground: 243 60% 40%;
    --ring: 243 75% 59%;

    /* semantic (mở rộng) */
    --success: 160 84% 39%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 38 95% 12%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --info: 199 89% 48%;
    --info-foreground: 0 0% 100%;
    --brand-amber: 38 92% 50%;

    /* difficulty */
    --diff-junior: 160 84% 39%;
    --diff-mid: 38 92% 50%;
    --diff-senior: 0 84% 60%;

    /* charts */
    --chart-1: 243 75% 59%;
    --chart-2: 160 84% 39%;
    --chart-3: 38 92% 50%;
    --chart-4: 199 89% 48%;
    --chart-5: 280 65% 60%;

    /* sidebar */
    --sidebar-background: 210 40% 98%;
    --sidebar-foreground: 215 25% 27%;
    --sidebar-primary: 243 75% 59%;
    --sidebar-primary-foreground: 210 40% 98%;
    --sidebar-accent: 243 75% 96%;
    --sidebar-accent-foreground: 243 60% 40%;
    --sidebar-border: 214 32% 91%;
    --sidebar-ring: 243 75% 59%;
  }

  .dark {
    --background: 224 44% 8%;
    --foreground: 210 40% 98%;
    --card: 223 43% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 223 43% 11%;
    --popover-foreground: 210 40% 98%;
    --muted: 217 33% 16%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 20%;
    --input: 217 33% 22%;

    --primary: 243 75% 62%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 33% 18%;
    --secondary-foreground: 210 40% 98%;
    --accent: 243 40% 20%;
    --accent-foreground: 243 90% 90%;
    --ring: 243 85% 70%;

    --success: 158 64% 52%;
    --success-foreground: 160 90% 12%;
    --warning: 43 96% 56%;
    --warning-foreground: 38 95% 12%;
    --destructive: 0 72% 58%;
    --destructive-foreground: 0 0% 100%;
    --info: 198 90% 60%;
    --info-foreground: 199 90% 12%;
    --brand-amber: 43 96% 56%;

    --diff-junior: 158 64% 52%;
    --diff-mid: 43 96% 56%;
    --diff-senior: 0 72% 62%;

    --chart-1: 243 75% 65%;
    --chart-2: 158 64% 52%;
    --chart-3: 43 96% 56%;
    --chart-4: 198 90% 60%;
    --chart-5: 280 70% 68%;

    --sidebar-background: 224 47% 6%;
    --sidebar-foreground: 210 30% 88%;
    --sidebar-primary: 243 75% 65%;
    --sidebar-primary-foreground: 210 40% 98%;
    --sidebar-accent: 243 40% 18%;
    --sidebar-accent-foreground: 243 90% 90%;
    --sidebar-border: 217 33% 16%;
    --sidebar-ring: 243 85% 70%;
  }

  * { @apply border-border; }
  body { @apply bg-background text-foreground; font-feature-settings: "rlig" 1, "calt" 1; }

  /* Tôn trọng prefers-reduced-motion toàn cục */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### 2.4. `tailwind.config.ts` — mapping token

> File: `tailwind.config.ts`. Mở rộng `colors` để dùng `bg-success`, `text-diff-senior`, `border-brand-amber`... trực tiếp trong className.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
        "brand-amber": "hsl(var(--brand-amber))",
        diff: {
          junior: "hsl(var(--diff-junior))",
          mid: "hsl(var(--diff-mid))",
          senior: "hsl(var(--diff-senior))",
        },
        chart: {
          1: "hsl(var(--chart-1))", 2: "hsl(var(--chart-2))", 3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))", 5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",                    /* 12px */
        md: "calc(var(--radius) - 2px)",        /* 10px */
        sm: "calc(var(--radius) - 4px)",        /* 8px  */
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "flip-in": { from: { transform: "rotateY(90deg)", opacity: "0" }, to: { transform: "rotateY(0)", opacity: "1" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flip-in": "flip-in 0.4s cubic-bezier(0.22,1,0.36,1)",
        "fade-up": "fade-up 0.3s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
```

### 2.5. Typography

**Font đề xuất (chọn 1 trong 2 cặp):**

| Vai trò | Ưu tiên 1 (khuyên dùng) | Thay thế |
|---|---|---|
| Sans (UI, body) | **Geist Sans** (Vercel, native với Next) | Inter |
| Mono (code, metadata, `⌘K`) | **Geist Mono** | JetBrains Mono |

> Vì sao Geist: đi kèm package `geist` của Vercel, load qua `next/font` không cần request ngoài, hinting tốt, cùng "gia đình" nên sans + mono ăn khớp. Nếu muốn cá tính "code" mạnh hơn → JetBrains Mono cho `--font-mono`.

Setup trong `app/layout.tsx`:
```tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
// <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
// biến CSS: --font-sans (GeistSans.variable), --font-mono (GeistMono.variable)
```

**Type scale** (base 16px = 1rem):

| Token | Size | Line-height | Weight | Dùng cho |
|---|---|---|---|---|
| `text-xs` | 12px / 0.75rem | 16px | 500 | Badge, metadata, mã câu hỏi, caption |
| `text-sm` | 14px / 0.875rem | 20px | 400–500 | Chữ phụ, label, item sidebar |
| `text-base` | 16px / 1rem | 26px | 400 | Body — nội dung đáp án, đọc lâu (line-height rộng hơn mặc định cho dễ đọc) |
| `text-lg` | 18px / 1.125rem | 28px | 500 | Câu hỏi trong QuestionCard, lead |
| `text-xl` | 20px / 1.25rem | 30px | 600 | Tiêu đề card, section nhỏ |
| `text-2xl` | 24px / 1.5rem | 32px | 600 | Tiêu đề trang phụ |
| `text-3xl` | 30px / 1.875rem | 36px | 700 | Tiêu đề trang chính (dashboard) |
| `text-4xl` | 36px / 2.25rem | 40px | 700 | Hero phụ |
| `text-5xl` | 48px / 3rem | 1.1 | 800 | Hero landing (desktop) |
| `text-6xl` | 60px / 3.75rem | 1.05 | 800 | Hero landing lớn |

Quy ước:
- **Headings:** weight 600–800, `tracking-tight` (letter-spacing âm nhẹ) cho ≥ `text-2xl`.
- **Body dài (đáp án):** `text-base leading-relaxed`, giới hạn `max-w-[70ch]` (prose) để dễ đọc.
- **Mono:** dùng `font-mono` + `text-[0.9em]` khi inline `code`, `tracking-tight`.
- **Prose:** dùng `@tailwind/typography` với class `prose prose-slate dark:prose-invert` cho nội dung đáp án markdown.

### 2.6. Spacing scale

Theo chuẩn Tailwind (base 4px). Quy ước dùng nhất quán:

| Ngữ cảnh | Giá trị |
|---|---|
| Padding trong control (button, input) | `px-4 py-2` (16/8) |
| Padding card | `p-6` (24) desktop, `p-4` (16) mobile |
| Gap giữa các field form | `space-y-4` (16) |
| Gap giữa card trong list | `gap-4` (16) |
| Section spacing (dọc trang) | `py-8` → `py-12` → `py-16` |
| Container max-width | `1400px` (2xl), content chính `max-w-4xl`/`max-w-5xl` |
| Gutter ngang mobile | `px-4`; desktop `px-6` |

### 2.7. Border radius

| Token | Giá trị | Dùng cho |
|---|---|---|
| `rounded-sm` | 8px | Badge, chip, tag nhỏ |
| `rounded-md` | 10px | Button, input, select |
| `rounded-lg` | 12px (`--radius`) | Card, dialog, popover |
| `rounded-xl` | 16px | Hero card, feature card lớn |
| `rounded-2xl` | 20px | Modal lớn, illustration container |
| `rounded-full` | — | Avatar, ProgressRing, StreakBadge, icon button tròn |

Định hướng: bo góc **vừa phải** (12px chủ đạo) — thân thiện nhưng vẫn "nghiêm túc / senior", tránh bo quá tròn (trẻ con) hay quá vuông (khô cứng).

### 2.8. Shadow / Elevation

Triết lý: **Light mode dựa vào shadow + border; Dark mode dựa vào surface lightness + border sáng** (shadow gần như vô hình trên nền tối).

| Level | Light `box-shadow` | Dark (thay bằng) | Dùng cho |
|---|---|---|---|
| `elev-0` | none, `border` 1px | `border` 1px `--border` | Card tĩnh, list item |
| `elev-1` | `0 1px 2px 0 hsl(222 47% 11% / 0.05)` | border + `--card` sáng hơn nền | Card mặc định |
| `elev-2` | `0 4px 12px -2px hsl(222 47% 11% / 0.08)` | `0 4px 12px -2px hsl(0 0% 0% / 0.5)` + border | Card hover, dropdown |
| `elev-3` | `0 12px 32px -4px hsl(222 47% 11% / 0.12)` | `0 12px 32px -8px hsl(0 0% 0% / 0.6)` + border | Dialog, popover, command menu |
| `elev-glow` | `0 0 0 1px hsl(var(--ring)/0.4), 0 8px 24px -6px hsl(var(--primary)/0.35)` | tương tự | CTA nổi bật, active quiz card |

Quy ước: hover nâng elevation 1 bậc + `-translate-y-0.5` (rất nhẹ). Không dùng shadow quá 3 lớp.

### 2.9. Motion (duration, easing)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `duration-fast` | 120ms | Hover color, focus ring, tooltip |
| `duration-base` | 180ms | Button press, dropdown open |
| `duration-slow` | 300ms | Dialog/sheet enter, tab switch |
| `duration-page` | 400ms | Page transition, flashcard flip |

**Easing:**
| Tên | cubic-bezier | Dùng |
|---|---|---|
| `ease-standard` | `(0.4, 0, 0.2, 1)` | Đa số transition |
| `ease-out-expo` | `(0.22, 1, 0.36, 1)` | Enter/reveal (fade-up, flip-in) — cảm giác "mượt, dội nhẹ" |
| `ease-in` | `(0.4, 0, 1, 1)` | Exit/dismiss |
| `spring` (Framer) | `{ type: "spring", stiffness: 300, damping: 30 }` | Flashcard flip, ProgressRing fill, confetti |

Nguyên tắc: mọi motion đều phải **tắt được** qua `prefers-reduced-motion` (đã set global ở §2.3). Framer Motion: dùng hook `useReducedMotion()`.

---

## 3. Component Inventory

### 3.1. (a) Component shadcn/ui cần cài

> Cài qua CLI: `npx shadcn@latest add <name>`. Danh sách theo nhu cầu MVP:

| Nhóm | Component | Dùng chính ở |
|---|---|---|
| **Core** | `button`, `card`, `badge`, `separator`, `skeleton`, `avatar` | Toàn app |
| **Overlay** | `dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`, `hover-card` | Modal, mobile nav, menu user |
| **Nav / Layout** | `sidebar` (shadcn sidebar mới), `tabs`, `accordion`, `breadcrumb`, `scroll-area`, `collapsible` | App shell, question detail |
| **Form** | `input`, `label`, `form` (RHF + zod), `select`, `checkbox`, `radio-group`, `switch`, `textarea`, `slider` | Quiz, filter, admin |
| **Feedback** | `progress`, `sonner` (toast), `alert`, `alert-dialog` | Quiz, tiến độ, xác nhận xóa |
| **Command** | `command` (⌘K palette) | CommandMenu global |
| **Data** | `table`, `pagination` | Admin, question bank (bảng) |
| **Theme** | (cấu hình `next-themes`, không phải component shadcn nhưng bắt buộc) | Dark mode toggle |

Chi tiết bắt buộc theo yêu cầu đề: `button, card, dialog, sheet, tabs, accordion, badge, progress, tooltip, dropdown-menu, command, sonner, skeleton, avatar, select, input, form, separator, scroll-area` — tất cả đã có trong bảng trên.

### 3.2. (b) Component tự build (domain-specific)

> Đặt tại `components/domain/`. Mỗi component chỉ render UI; logic tách sang `hooks/`, tính toán thuần sang `lib/helpers/`, hằng số sang `lib/constants/`, kiểu dữ liệu sang `types/`.

| Component | Mô tả ngắn | shadcn primitives để ghép |
|---|---|---|
| **QuestionCard** | Card 1 câu hỏi ở list: mã (`JS-014` mono), tiêu đề, `TopicChip`, `DifficultyIndicator`, nút bookmark, trạng thái đã học. | `Card` + `Badge` + `Button`(icon) + `Tooltip` |
| **AnswerReveal** | Khối đáp án chi tiết, mặc định ẩn ("thử tự trả lời trước"), bấm để mở. Render markdown + `CodeBlock`. | `Collapsible`/`Accordion` + `prose` + `Button` |
| **QuizRunner** | Bộ chạy quiz: 1 câu/lần hoặc cuộn, radio đáp án, progress top, nút Next/Prev/Submit, timer optional. | `Card` + `RadioGroup` + `Progress` + `Button` + `Separator` |
| **QuizResult** | Màn kết quả: điểm (`ProgressRing`), số đúng/sai, breakdown theo topic, review từng câu (đúng/sai + giải thích). | `Card` + `Progress` + `Badge` + `Accordion` + `Tabs` |
| **AnswerOption** | 1 lựa chọn trong quiz: state default / selected / correct / incorrect (viền + icon). | `RadioGroup.Item` custom + `lucide` icon |
| **FlashcardDeck** | Bộ thẻ ôn tập SRS: đếm còn lại, nút "Again/Hard/Good/Easy", tiến độ phiên. | `Card` + `Button` + `Progress` |
| **FlashCard (flip)** | Thẻ lật 3D: mặt trước (câu hỏi) / sau (đáp án ngắn). Animation flip. | `Card` + Framer Motion (`rotateY`) |
| **ProgressRing** | Vòng tròn SVG hiển thị % (điểm quiz, tiến độ lộ trình). | SVG thuần + `--chart-*` |
| **StreakBadge** | Badge chuỗi ngày học liên tục (icon lửa amber + số ngày mono). | `Badge` + `lucide Flame` + `--brand-amber` |
| **LevelBadge** | Nhãn cấp độ Junior/Mid/Senior (màu `--diff-*`). | `Badge` variant custom |
| **TopicChip** | Chip chủ đề (JavaScript, React, CSS, System Design...) — filter được. | `Badge` (clickable) / `Toggle` |
| **DifficultyIndicator** | 3 vạch/chấm thể hiện độ khó (junior/mid/senior). | `div` + màu `--diff-*` + `Tooltip` |
| **CodeBlock** | Khối code syntax-highlight (Shiki), nút copy, nhãn ngôn ngữ, số dòng optional. | `div` + Shiki HTML + `Button`(copy) + `sonner` |
| **EmptyState** | Trạng thái rỗng (không kết quả search, chưa có bookmark): icon/illustration + tiêu đề + CTA. | `Card`(ghost) + `lucide` + `Button` |
| **AppSidebar** | Sidebar điều hướng chính, collapsible, nhóm mục + active state. | shadcn `sidebar` + `lucide` |
| **CommandMenu** | Palette `⌘K`: search câu hỏi, nhảy trang, đổi theme, hành động nhanh. | `command` + `Dialog` |
| **ThemeToggle** | Nút chuyển light/dark/system. | `DropdownMenu` + `Button`(icon) + `next-themes` |
| **StatCard** | Ô số liệu dashboard (số câu đã học, độ chính xác...). | `Card` + `lucide` + số mono |
| **RoadmapStepper** | Lộ trình Junior→Senior dạng dọc, các milestone có trạng thái (locked/active/done). | `Card` + `Separator` + `Progress` + `Badge` |
| **BookmarkButton** | Nút lưu/bỏ lưu câu hỏi, optimistic update. | `Button`(icon toggle) + `Tooltip` + `sonner` |
| **SearchBar** | Ô tìm kiếm có phím tắt `/` và `⌘K`, gợi ý. | `Input` + `command` (kết hợp) |
| **FilterSidebar** | Bộ lọc question bank: topic, difficulty, trạng thái, bookmark. | `Accordion` + `Checkbox` + `RadioGroup` + `ScrollArea` |
| **ConfettiBurst** | Hiệu ứng ăn mừng khi hoàn thành quiz điểm cao (optional). | `canvas-confetti` + guard reduced-motion |

---

## 4. Layout & App Shell

### 4.1. App shell (desktop)

```
┌──────────────────────────────────────────────────────────┐
│  Topbar:  [☰] Breadcrumb / Search(⌘K) ......  [🔔][theme][avatar] │  h-14, sticky, border-b, bg-background/80 backdrop-blur
├──────────┬───────────────────────────────────────────────┤
│          │                                                │
│ Sidebar  │   Content area                                 │
│ w-64     │   container max-w-6xl, px-6, py-8              │
│ (collap- │                                                │
│  sible   │   ┌── grid nội dung ──────────────┐            │
│  → w-16) │   │                                │            │
│          │   └────────────────────────────────┘            │
│  Nav:    │                                                │
│  Home    │                                                │
│  Câu hỏi │                                                │
│  Quiz    │                                                │
│  Flashcard│                                               │
│  Lộ trình│                                                │
│  Tiến độ │                                                │
│  ──────  │                                                │
│  Admin*  │                                                │
└──────────┴───────────────────────────────────────────────┘
```

- **Sidebar:** dùng shadcn `sidebar` (rail collapsible). Trạng thái collapse lưu vào cookie/Zustand → nhất quán giữa các phiên. Khi collapsed chỉ hiện icon + tooltip.
- **Topbar:** `sticky top-0 z-40`, `bg-background/80 backdrop-blur border-b`. Chứa trigger sidebar (mobile), search/`⌘K`, ThemeToggle, avatar (DropdownMenu: Hồ sơ / Cài đặt / Đăng xuất).
- **Admin** chỉ hiện khi user có role admin (RLS + kiểm tra role phía UI).

### 4.2. Responsive breakpoints

| Breakpoint | Tailwind | Hành vi |
|---|---|---|
| Mobile | `< 640px` (base) | Sidebar → `Sheet` (drawer trái). Bottom bar 4–5 mục. Content 1 cột, `px-4`. |
| Tablet | `sm 640` / `md 768` | Sidebar collapsed (icon-only) mặc định, mở khi hover/toggle. Grid 2 cột. |
| Laptop | `lg 1024` | Sidebar mở đầy đủ `w-64`. Question bank: filter sidebar + list 2 cột. |
| Desktop | `xl 1280` / `2xl 1400` | Container `max-w-[1400px]`. Có thể 3 vùng (filter / list / preview). |

### 4.3. Mobile navigation

- **Primary:** `Sheet` từ trái (bấm ☰ ở topbar) chứa full nav — dùng cho điều hướng sâu.
- **Secondary (nhanh):** **Bottom Tab Bar** cố định `fixed bottom-0`, `h-16`, 5 mục: Trang chủ / Câu hỏi / Quiz / Flashcard / Tiến độ. Active dùng `--primary` + label nhỏ. Ẩn khi bàn phím mở (input focus) để không che.
- Trong quiz/flashcard fullscreen mobile: ẩn bottom bar, chỉ giữ nút thoát + progress để tập trung.

### 4.4. Grid nội dung

| Trang | Grid |
|---|---|
| Question bank | `lg:grid-cols-[280px_1fr]` (filter | list). List item `flex flex-col gap-3` hoặc `grid sm:grid-cols-2`. |
| Question detail | `max-w-3xl mx-auto` (đọc trung tâm) + cột phụ metadata `xl:grid-cols-[1fr_260px]`. |
| Dashboard | `grid gap-4 md:grid-cols-2 xl:grid-cols-4` cho StatCard; charts `md:grid-cols-2`. |
| Landing | Full-bleed sections, container `max-w-6xl`, feature grid `md:grid-cols-3`. |
| Admin | `max-w-6xl`, table full-width + drawer/dialog edit. |

---

## 5. UI Notes theo từng trang

### 5.1. Landing (`/`)
- **Hero:** tiêu đề `text-5xl/6xl font-extrabold tracking-tight`, sub-headline `text-lg text-muted-foreground max-w-2xl`. CTA đôi: "Bắt đầu miễn phí" (primary) + "Xem ngân hàng câu hỏi" (secondary/ghost). Background: gradient rất nhẹ `from-primary/5 via-background to-background` + grid pattern mờ (dev aesthetic).
- **Social proof strip:** logo công nghệ (React, Next, TS, CSS) dạng mono chip.
- **Feature preview:** 3–4 card (Ngân hàng câu hỏi / Quiz chấm điểm / Flashcard SRS / Lộ trình) — mỗi card icon lucide + mock UI nhỏ (screenshot component thật, ví dụ QuestionCard/ProgressRing).
- **"Xem thử một câu hỏi":** nhúng 1 `QuestionCard` + `AnswerReveal` tương tác được ngay trên landing → tạo "aha".
- **Footer:** link, ngôn ngữ (i18n toggle VI/EN), theme toggle.
- Có ThemeToggle + i18n ở topbar landing (topbar rút gọn, không sidebar).

### 5.2. Question Bank (`/questions`)
- **Layout:** FilterSidebar trái (`Accordion`: Chủ đề / Độ khó / Trạng thái đã học / Đã bookmark), list phải.
- **SearchBar** trên cùng, phím `/` focus, `⌘K` mở CommandMenu. Hiện số kết quả + active filters dạng removable chip.
- **List item = QuestionCard:** mã mono, tiêu đề `text-lg`, TopicChip, DifficultyIndicator, BookmarkButton, dấu tick "đã học".
- **Empty state:** khi filter/search không ra kết quả → EmptyState ("Không tìm thấy câu hỏi phù hợp" + nút "Xóa bộ lọc").
- Loading: `Skeleton` list 6–8 dòng.
- Toggle chế độ xem: list (mặc định) / bảng compact (`Table`).

### 5.3. Question Detail (`/questions/[id]`)
- Bố cục đọc trung tâm `max-w-3xl`: Breadcrumb → tiêu đề → hàng meta (TopicChip, DifficultyIndicator, mã mono, BookmarkButton).
- **Câu hỏi** hiển thị rõ; **AnswerReveal** mặc định đóng, có nút "Hiện đáp án" (khuyến khích tự nghĩ trước — đúng tinh thần phỏng vấn).
- Đáp án render `prose` + **CodeBlock** (Shiki, nút copy). Hỗ trợ nhiều "tầng": TL;DR → giải thích chi tiết → ví dụ code → follow-up questions.
- Cột phụ (xl): "Câu liên quan", "Chủ đề", nút "Thêm vào flashcard", "Đánh dấu đã học".
- Điều hướng Prev/Next trong cùng filter set.

### 5.4. Quiz Runner (`/quiz/[id]` hoặc `/quiz/run`)
- **Focus mode:** ẩn bớt chrome, `Progress` bar mảnh trên cùng (câu X/N), timer optional (mono).
- 1 câu / màn: câu hỏi `text-lg`, 4 `AnswerOption` (RadioGroup). Chọn xong → nút "Câu tiếp" (hoặc auto-advance có delay).
- Cho phép quay lại sửa (Prev) trước khi Submit; đánh dấu câu chưa trả lời.
- Nút "Nộp bài" ở câu cuối → `AlertDialog` xác nhận nếu còn câu trống.
- Mobile: fullscreen, ẩn bottom bar, nút thoát có xác nhận (tránh mất tiến độ).
- State: lưu draft answers vào Zustand (khôi phục nếu reload).

### 5.5. Quiz Result (`/quiz/[id]/result`)
- **Hero kết quả:** `ProgressRing` lớn ở giữa (điểm %), màu theo ngưỡng (≥80 success, 50–79 warning, <50 destructive). Số đúng/tổng dạng mono.
- **ConfettiBurst** nếu ≥ ngưỡng cao (vd ≥90%), tôn trọng reduced-motion.
- **Breakdown theo topic:** thanh `Progress` mỗi chủ đề → chỉ ra điểm yếu.
- **Review:** `Accordion` từng câu — hiện đáp án đã chọn (đúng=success viền, sai=destructive) + đáp án đúng + giải thích (AnswerReveal style).
- CTA: "Làm lại", "Ôn các câu sai bằng Flashcard", "Về Dashboard".

### 5.6. Flashcard Review (`/flashcards`)
- **Trung tâm màn:** FlashCard flip (mặt trước câu hỏi / lật ra đáp án ngắn). Không gian tối giản, tập trung.
- **Nút đánh giá (SRS):** "Again / Hard / Good / Easy" (4 nút màu tăng dần độ khó→dễ), phím tắt 1–4. Cập nhật interval theo thuật toán SRS (SM-2 đơn giản hóa) trong `lib/helpers/srs.ts`.
- **Progress phiên:** còn X thẻ, thanh tiến độ, StreakBadge góc trên.
- Kết thúc phiên: EmptyState tích cực ("Xong hôm nay! Chuỗi +1") + thống kê ngắn.
- Reduced-motion: flip thay bằng cross-fade.

### 5.7. Dashboard (`/dashboard`)
- **Hàng chào + streak:** "Chào [tên]" + StreakBadge lớn + "Đến hạn ôn: N thẻ" (CTA flashcard).
- **StatCard row:** Câu đã học / Độ chính xác quiz / Số quiz hoàn thành / Ngày streak (số mono, icon lucide, trend nhỏ).
- **ProgressRing theo lộ trình:** % hoàn thành Junior / Mid / Senior track.
- **Charts:** đường/cột hoạt động 7–30 ngày (`--chart-*`), phân bố đúng/sai theo topic (radar/bar).
- **RoadmapStepper** rút gọn + "Tiếp tục học" (deep-link về mục đang dở).
- Empty (user mới): onboarding checklist thay cho stats trống.

### 5.8. Admin (`/admin`)
- Chỉ role admin (kiểm tra role + RLS). Layout: `Table` danh sách câu hỏi (search, filter, pagination) + nút "Thêm câu hỏi".
- **Thêm/Sửa:** `Sheet`/`Dialog` với `form` (RHF + zod): tiêu đề, chủ đề (multi-select), độ khó, nội dung câu hỏi (markdown editor + preview), đáp án chi tiết, đáp án quiz (options + đáp án đúng + giải thích), tags.
- **Preview trực tiếp:** render QuestionCard + AnswerReveal như user thấy → đảm bảo chất lượng seed.
- Bulk: import/export JSON để seed dữ liệu mẫu.
- Feedback bằng `sonner` (đã lưu / lỗi), `AlertDialog` khi xóa.

---

## 6. Accessibility

- **Contrast:** mọi cặp text/bg đạt tối thiểu **WCAG AA** (4.5:1 body, 3:1 large/UI). Ví dụ đã kiểm: `foreground` trên `background` (light) ~15:1; `muted-foreground 215 16% 47%` trên white ~4.6:1 (đạt AA). Dark: `foreground 210 40% 98%` trên `background 224 44% 8%` ~16:1. Primary `243 75% 59%` + white foreground ~6:1 (đạt AA cho normal text trên button). Không dùng màu semantic làm *phương tiện duy nhất* — luôn kèm icon/label (đúng/sai có icon ✓/✕).
- **Focus ring:** dùng `--ring`, style nhất quán `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Không bao giờ `outline: none` mà không thay thế.
- **Keyboard navigation:** toàn app dùng được bằng bàn phím. Quiz: chọn đáp án bằng phím số 1–4, Enter next. Flashcard: Space lật, 1–4 đánh giá. `⌘K`/`Ctrl+K` mở CommandMenu, `/` focus search, `Esc` đóng overlay. Focus trap trong Dialog/Sheet (Radix lo sẵn).
- **ARIA:** dùng primitives Radix (shadcn) nên `role`, `aria-*` đúng sẵn. Bổ sung: `aria-live="polite"` cho kết quả quiz/toast; `aria-current="page"` cho nav active; ProgressRing có `role="progressbar"` + `aria-valuenow/min/max`; icon-only button có `aria-label`.
- **prefers-reduced-motion:** đã tắt animation global (§2.3) + `useReducedMotion()` cho Framer (flip → fade, confetti → skip).
- **Dark mode toggle:** `next-themes` với `system` mặc định, lưu lựa chọn; tránh flash (FOUC) bằng `suppressHydrationWarning` + script inline. Toggle có label rõ (light/dark/system).
- **Semantics & i18n:** cấu trúc heading đúng thứ bậc (một `h1`/trang), landmark `nav/main/aside`, `lang` attribute đổi theo VI/EN. Target chạm ≥ 44×44px trên mobile.

---

## 7. Micro-interactions & Polish

- **Button:** hover đổi nền nhẹ + `duration-fast`; press `active:scale-[0.98]`; loading → spinner + `aria-busy`, giữ nguyên width (tránh layout shift).
- **Card hover:** `hover:-translate-y-0.5 hover:shadow-[elev-2]`, border sáng lên nhẹ. Chỉ card clickable mới có.
- **BookmarkButton:** optimistic + micro "pop" (scale 1→1.2→1) + đổi icon fill amber, toast "Đã lưu".
- **AnswerReveal:** mở bằng height animation (`accordion-down`) + fade-up nội dung.
- **AnswerOption (quiz):** khi chấm → đúng: viền `success` + icon ✓ nảy nhẹ; sai: viền `destructive` + icon ✕ + "shake" rất nhẹ (tắt nếu reduced-motion).
- **FlashCard flip:** 3D `rotateY` với `spring`; back-face-visibility hidden.
- **ProgressRing:** stroke-dashoffset animate từ 0 → giá trị khi vào view (spring), số đếm lên (count-up).
- **Page transitions:** fade-up nhẹ khi đổi route (Next `template.tsx` + Framer `AnimatePresence`), 300–400ms.
- **Loading skeletons:** mọi list/card có skeleton khớp layout thật (tránh CLS) thay vì spinner giữa màn.
- **Toast (sonner):** góc trên phải (desktop) / trên (mobile), tự ẩn, có action "Hoàn tác" cho hành động nghịch đảo được.
- **Empty states:** luôn có icon/illustration + 1 câu thân thiện + 1 CTA rõ (không để màn trắng).
- **Streak:** khi +1 streak → StreakBadge phát sáng amber + đếm số; milestone (7/30/100 ngày) có confetti nhỏ.
- **Confetti (optional):** `canvas-confetti` khi quiz điểm cao / hoàn thành milestone lộ trình. Bọc guard reduced-motion.
- **Copy code:** CodeBlock nút copy → đổi icon thành ✓ 1.5s + toast "Đã copy".

---

## 8. Icon, Illustration & Syntax Highlight

- **Icon set:** **lucide-react** (đồng bộ shadcn). Quy ước: stroke 1.5–2, size 16 (`text-sm` context) / 20 (button) / 24 (feature). Gợi ý mapping: `BookOpen` (câu hỏi), `ListChecks` (quiz), `Layers`/`GalleryVerticalEnd` (flashcard), `Route`/`Map` (lộ trình), `LayoutDashboard` (dashboard), `Flame` (streak), `Bookmark`, `Search`, `Command`, `Sun/Moon/Monitor` (theme), `ShieldCheck` (admin), `Sparkles` (highlight).
- **Illustration / empty-state approach:** **không** dùng bộ illustration màu mè có sẵn (lệch tông "developer, calm"). Thay bằng:
  1. **Icon lucide cỡ lớn** (48–64px) trong vòng tròn `bg-muted`, màu `muted-foreground` — nhẹ nhàng, nhất quán, tự động hợp dark mode.
  2. Hoặc **minimal line/duotone SVG** custom một tông primary (đồng bộ brand), export inline.
  3. Nền có thể thêm **subtle grid/dot pattern** (SVG mờ) để giữ chất "studio/editor".
  Tránh 3D/mascot vui nhộn (lệch định vị senior).
- **Syntax highlight cho code:** **Shiki** (khuyên dùng thay Prism) — highlight ở build/server time, không ship runtime lớn, màu chính xác theo TextMate theme.
  - **Light theme:** `github-light` hoặc `min-light` (sạch, tương phản tốt).
  - **Dark theme:** `github-dark-dimmed` hoặc **`vitesse-dark`** / `one-dark-pro` — dịu mắt, hợp deep slate background.
  - Dùng **dual theme** của Shiki (`themes: { light, dark }`) để tự đổi theo `.dark` bằng CSS variables → khớp ThemeToggle không cần re-render.
  - CodeBlock: font `--font-mono`, `text-sm`, `rounded-lg`, `border`, header có nhãn ngôn ngữ + nút copy; `overflow-x-auto` để không vỡ layout ngang trên mobile.

---

### Ghi chú bước THỦ CÔNG (setup design system)

| # | Việc phải làm tay | Nơi |
|---|---|---|
| 1 | `npx create-next-app@latest` (TS strict, App Router, Tailwind) | Local |
| 2 | `npx shadcn@latest init` → chọn base color **Slate**, CSS variables **Yes**, rồi **thay** block `:root`/`.dark` bằng §2.3 | Local |
| 3 | Cài fonts: `npm i geist` (hoặc `next/font` Inter + JetBrains Mono) | Local |
| 4 | Cài phụ trợ: `npm i next-themes framer-motion canvas-confetti shiki` + `tailwindcss-animate @tailwindcss/typography` | Local |
| 5 | `npx shadcn@latest add` các component ở §3.1 | Local |
| 6 | Bọc app bằng `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`) trong `app/layout.tsx` | Local |
| 7 | Kiểm tra contrast (Lighthouse / axe DevTools) sau khi ráp | Browser |

Cấu trúc thư mục đề xuất (tách bạch chuẩn senior):
```
components/ui/         # shadcn primitives (generated)
components/domain/     # QuestionCard, QuizRunner, FlashCard... (chỉ UI)
components/common/     # ThemeToggle, EmptyState, CommandMenu, AppSidebar
hooks/                 # useQuiz, useFlashcardSRS, useBookmark... (chỉ React logic)
lib/helpers/           # srs.ts, format.ts, date.ts, string.ts (hàm thuần, KHÔNG React)
lib/constants/         # topics.ts, difficulty.ts, routes.ts, motion.ts (hằng số, tránh hardcode)
types/                 # question.ts, quiz.ts, user.ts (type-safety)
```