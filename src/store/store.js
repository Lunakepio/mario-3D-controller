import { Vector3 } from "three";
import { create } from "zustand";

export const useGameStore = create((set) => ({
  playerPosition: null,
  setPlayerPosition: (position) => set({ playerPosition: position }),
  playerAnimation: "idle",
  setPlayerAnimation: (animation) => set({ playerAnimation: animation }),
  joystick: {x: 0, y: 0, distance: 0},
  setJoystick: (joystick) => set({ joystick: joystick }),
  jumpButtonPressed: false,
  setJumpButtonPressed: (pressed) => set({ jumpButtonPressed: pressed }),
  lookAtCharacter: new Vector3(),
  setLookAtCharacter: (lookAtCharacter) => set({ lookAtCharacter: lookAtCharacter }),
  star: null,
  setStar: (star) => set({ star: star}),
  isTwirling: null,
  setIsTwirling: (isTwirling) => set({ isTwirling : isTwirling}),
  curvePointData: null,
  setCurvePointData: (curvePointData) => set({ curvePointData: curvePointData }),
}));
