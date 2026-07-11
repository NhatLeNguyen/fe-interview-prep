/** Khóa cache tập trung (dùng khi thêm React Query/SWR ở Phase 1). Tránh trùng/lệch key. */

export const QUERY_KEYS = {
  questions: {
    all: ["questions"] as const,
    list: (filters: Record<string, unknown>) => ["questions", "list", filters] as const,
    detail: (slug: string) => ["questions", "detail", slug] as const,
  },
  quiz: {
    attempts: ["quiz", "attempts"] as const,
    attempt: (id: string) => ["quiz", "attempt", id] as const,
  },
  flashcards: {
    due: ["flashcards", "due"] as const,
  },
  learningPath: {
    all: ["learning-path"] as const,
    detail: (slug: string) => ["learning-path", slug] as const,
  },
  progress: {
    dashboard: ["progress", "dashboard"] as const,
  },
} as const;
