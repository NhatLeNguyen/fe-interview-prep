"use client";

import { useEffect, useState } from "react";

/** Trả về true sau khi component đã mount (tránh hydration mismatch cho UI phụ thuộc client). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- pattern "mounted": set 1 lần sau mount, an toàn
  useEffect(() => setMounted(true), []);
  return mounted;
}
