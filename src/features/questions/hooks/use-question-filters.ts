"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DEBOUNCE_MS } from "@/constants/config";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ALL_VALUE, DEFAULT_SORT, QUESTION_PARAM } from "../constants";

/** Quản lý bộ lọc câu hỏi qua URL search params (share/bookmark link được). Search debounce. */
export function useQuestionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value && value !== ALL_VALUE) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Search: input cục bộ -> debounce -> đồng bộ URL (?q=).
  const [searchInput, setSearchInput] = useState(searchParams.get(QUESTION_PARAM.search) ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);

  useEffect(() => {
    const current = searchParams.get(QUESTION_PARAM.search) ?? "";
    if (debouncedSearch !== current) {
      setParam(QUESTION_PARAM.search, debouncedSearch || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đồng bộ khi giá trị debounce đổi
  }, [debouncedSearch]);

  const clearAll = useCallback(() => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    values: {
      search: searchInput,
      level: searchParams.get(QUESTION_PARAM.level) ?? ALL_VALUE,
      type: searchParams.get(QUESTION_PARAM.type) ?? ALL_VALUE,
      category: searchParams.get(QUESTION_PARAM.category) ?? ALL_VALUE,
      topic: searchParams.get(QUESTION_PARAM.topic) ?? ALL_VALUE,
      sort: searchParams.get(QUESTION_PARAM.sort) ?? DEFAULT_SORT,
    },
    setSearch: setSearchInput,
    setLevel: (v: string | null) => setParam(QUESTION_PARAM.level, v),
    setType: (v: string | null) => setParam(QUESTION_PARAM.type, v),
    setCategory: (v: string | null) => setParam(QUESTION_PARAM.category, v),
    setSort: (v: string | null) => setParam(QUESTION_PARAM.sort, v),
    clearAll,
  };
}
