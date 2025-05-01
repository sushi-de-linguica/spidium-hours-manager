import { persistMiddleware } from "@/lib/database";
import { create } from "zustand";

export interface IObs {
  version: number;
  isConnected: boolean;
}

export interface IObsStore {
  state: IObs;
  setState: (newState: IObs) => void;
  setFullState: (newState: any) => void;
  setVersion: (version: number) => void;
  setIsConnected: (isConnected: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE: IObs = {
  isConnected: false,
  version: 4,
};

const useObsStore = create<IObsStore, any>(
  persistMiddleware("OBS_STORE", (set) => ({
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
    setIsConnected: (isConnected: boolean) => {
      set((state) => ({
        ...state,
        state: {
          ...state.state,
          isConnected,
        },
      }));
    },
    setState: (newState: IObs) => {
      set((state) => ({
        state: {
          ...newState,
        },
      }));
    },
    setFullState: (newState: any) => {
      set((state) => ({
        ...state,
        ...newState,
      }));
    },
    reset: () =>
      set((state) => ({
        ...state,
        state: {
          ...DEFAULT_STATE,
        },
      })),
  }))
);

export { useObsStore };
