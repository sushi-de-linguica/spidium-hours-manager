import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface INightbot {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface INightbotStore {
  isValidToken: boolean;
  state: INightbot;
  appendState: (newState: Partial<INightbot>) => void;
  setState: (newState: INightbot) => void;
  reset: () => void;
}

const DEFAULT_STATE: INightbot = {
  access_token: "",
  expires_in: 0,
  refresh_token: "",
  scope: "",
  token_type: "",
};

const useNightbot = create<INightbotStore, any>(
  persist(
    (set) => ({
      isValidToken: false,
      state: {
        ...DEFAULT_STATE,
      },
      appendState: (newState: Partial<INightbot>) => {
        set((state) => ({
          ...state,
          state: {
            ...state.state,
            ...newState,
          },
        }));
      },
      setState: (newState: INightbot) => {
        set((state) => ({
          ...state,
          isValidToken: newState.access_token !== "",
          state: {
            ...newState,
          },
        }));
      },
      reset: () =>
        set((state) => ({
          ...state,
          isValidToken: state.state.access_token !== "",
          state: {
            ...DEFAULT_STATE,
          },
        })),
    }),
    {
      name: "SPIDIUM_NIGHTBOT_STORE",
    }
  )
);

export { useNightbot };
