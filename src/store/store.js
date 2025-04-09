import { create } from "zustand";

export const useGameStore = create((set) => ({
  playerPosition: null,
  setPlayerPosition: (position) => set({ playerPosition: position }),
  playerAnimation: 'idle',
  setPlayerAnimation: (animation) => set({ playerAnimation: animation }),
}));
