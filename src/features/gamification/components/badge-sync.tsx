"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { syncBadges } from "../actions";

/** Xét & trao badge khi mở trang (side-effect nằm NGOÀI render của RSC). */
export function BadgeSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    syncBadges()
      .then((n) => {
        if (n > 0) router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
