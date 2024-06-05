// in your authStore or a new store file
import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

export default useSidebarStore;
