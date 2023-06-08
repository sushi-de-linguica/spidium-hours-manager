import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IObs {
  version: number;
  isConnected: boolean;
}

export interface IObsStore {
  state: IObs;
  setState: (newState: IObs) => void;
  reset: () => void;
}

const DEFAULT_STATE: IObs = {
  isConnected: false,
  version: 4,
};

const useObsStore = create<IObsStore, any>(
  persist(
    (set) => ({
      state: {
        ...DEFAULT_STATE,
      },
      setVersion: (version: number) => {
        set((state) => {
          return {
            ...state,
            state: {
              ...state.state,
              version,
            },
          };
        });
      },
      setState: (newState: IObs) => {
        set((state) => ({
          state: {
            ...newState,
          },
        }));
      },
      reset: () =>
        set((state) => ({
          ...state,
          state: {
            ...DEFAULT_STATE,
          },
        })),
    }),
    {
      name: "SPIDIUM_OBS_STORE",
    }
  )
);

export { useObsStore };
