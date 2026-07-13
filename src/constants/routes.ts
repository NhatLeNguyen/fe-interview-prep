/** Nguồn chân lý cho đường dẫn — chống hardcode URL rải rác. */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",

  QUESTIONS: "/questions",
  QUESTION_DETAIL: (slug: string) => `/questions/${slug}`,

  QUIZ: "/quiz",
  QUIZ_CUSTOM: "/quiz/custom",
  QUIZ_RUN: "/quiz/run",
  QUIZ_ATTEMPT: (attemptId: string) => `/quiz/${attemptId}`,
  QUIZ_RESULT: (attemptId: string) => `/quiz/${attemptId}/result`,

  FLASHCARDS: "/flashcards",
  REVIEW: "/review",

  LEARNING_PATH: "/learning-path",
  LEARNING_PATH_DETAIL: (pathSlug: string) => `/learning-path/${pathSlug}`,

  DASHBOARD: "/dashboard",
  BOOKMARKS: "/bookmarks",

  ADMIN: "/admin",
  ADMIN_QUESTIONS: "/admin/questions",
  ADMIN_QUESTION_NEW: "/admin/questions/new",
  ADMIN_QUESTION_EDIT: (id: string) => `/admin/questions/${id}/edit`,
} as const;

/**
 * Route yêu cầu đăng nhập (dùng ở proxy guard).
 * LƯU Ý: /questions, /learning-path là Public* (xem được không cần login — docs/02) nên KHÔNG nằm đây.
 */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/bookmarks",
  "/quiz",
  "/flashcards",
  "/review",
  "/profile",
  "/settings",
  "/admin",
] as const;

/** Route chỉ dành cho khách chưa đăng nhập (đã login thì redirect về dashboard). */
export const GUEST_ONLY_PREFIXES = ["/login", "/signup"] as const;

/** Route chỉ dành cho admin. */
export const ADMIN_PREFIX = "/admin";
