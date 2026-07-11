/** Metadata & cấu hình tĩnh của ứng dụng. */
export const siteConfig = {
  name: "FE Interview Prep",
  shortName: "FE Prep",
  description:
    "Nền tảng luyện phỏng vấn Front-end song ngữ Việt–Anh, từ junior đến senior: ngân hàng câu hỏi, quiz, flashcard ôn tập ngắt quãng.",
  url: "https://fe-interview-prep.vercel.app",
  locale: "vi",
} as const;

export type SiteConfig = typeof siteConfig;
