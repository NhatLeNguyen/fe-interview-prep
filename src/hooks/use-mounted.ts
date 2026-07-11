"use client";

import { useEffect, useState } from "react";

/** Trả về true sau khi component đã mount (tránh hydration mismatch cho UI phụ thuộc client). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
