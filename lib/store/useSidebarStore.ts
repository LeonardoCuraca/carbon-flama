import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleCollapse: () => set((state) => {
    const nextVal = !state.isCollapsed;
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(nextVal));
    }
    return { isCollapsed: nextVal };
  }),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
