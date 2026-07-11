import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants/config";
import { createUiSlice, type UiSlice } from "./slices/ui.slice";

/**
 * Root store (Zustand). Phase 0 chỉ có UI slice.
 * Thêm slice mới (vd quiz-session) bằng cách hợp nhất:
 *   (...a) => ({ ...createUiSlice(...a), ...createQuizSessionSlice(...a) })
 */
export type RootStore = UiSlice;

export const useStore = create<RootStore>()(
  persist(createUiSlice, {
    name: STORAGE_KEYS.UI,
    partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
  }),
);
