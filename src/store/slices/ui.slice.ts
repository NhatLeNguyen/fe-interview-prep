import type { StateCreator } from "zustand";

/** UI state toàn cục (không thuộc riêng feature nào). Theme do next-themes quản lý. */
export interface UiSlice {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
});
