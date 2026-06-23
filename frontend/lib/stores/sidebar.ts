import { create } from "zustand";

interface SidebarStore {
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  mobileOpen: false,
  open: () => set({ mobileOpen: true }),
  close: () => set({ mobileOpen: false }),
}));
