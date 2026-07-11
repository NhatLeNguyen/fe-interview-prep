/** Nguồn chân lý cho đường dẫn — chống hardcode URL rải rác. */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",

  QUESTIONS: "/questions",
  QUESTION_DETAIL: (slug: string) => `/questions/${slug}`,

  QUIZ: "/quiz",
  QUIZ_CUSTOM: "/quiz/custom",
  QUIZ_RUN: "/quiz/run",
  QUIZ_ATTEMPT: (attemptId: string) => `/quiz/${attemptId}`,
  QUIZ_RESULT: (attemptId: string) => `/quiz/${attemptId}/result`,

  FLASHCARDS: "/flashcards",

  LEARNING_PATH: "/learning-path",
  LEARNING_PATH_DETAIL: (pathSlug: string) => `/learning-path/${pathSlug}`,

  DASHBOARD: "/dashboard",

  ADMIN: "/admin",
  ADMIN_QUESTIONS: "/admin/questions",
} as const;

/** Các route yêu cầu đăng nhập (dùng ở middleware). */
export const PROTECTED_PREFIXES = [
  "/questions",
  "/quiz",
  "/flashcards",
  "/learning-path",
  "/dashboard",
  "/admin",
] as const;

/** Route chỉ dành cho admin. */
export const ADMIN_PREFIX = "/admin";
