import { create } from "zustand";

interface UIState {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  focusMode: false,
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setFocusMode: (value) => set({ focusMode: value }),
}));
