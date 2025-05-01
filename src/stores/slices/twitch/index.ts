import { persistMiddleware } from "@/lib/database";
import { create } from "zustand";

export interface ITwitch {
  access_token: string;
  client_id: string;
  expires_in?: number;
  scope?: string;
  broadcaster_id?: string;
}

export interface ITwitchStore {
  state: ITwitch;
  isConnected: boolean;
  appendState: (newState: Partial<ITwitch>) => void;
  setState: (newState: ITwitch) => void;
  setBroadcasterId: (value: string) => void;
  setIsConnected: (connected: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE: ITwitch = {
  access_token: "",
  client_id: "",
  broadcaster_id: "",
};

const useTwitch = create<ITwitchStore, any>(
  persistMiddleware("TWITCH_STORE", (set) => ({
    isConnected: false,
    state: {
      ...DEFAULT_STATE,
    },
    setBroadcasterId: (broadcaster_id: string) => {
      set((store) => ({
        state: {
          ...store.state,
          broadcaster_id,
        },
      }));
    },
    setState: (newState: ITwitch) => {
      set(() => ({
        state: {
          ...newState,
        },
      }));
    },
    appendState: (newState: Partial<ITwitch>) => {
      set((store) => ({
        ...store,
        state: {
          ...store.state,
          ...newState,
        },
      }));
    },
    reset: () =>
      set(() => ({
        state: {
          ...DEFAULT_STATE,
        },
      })),
    setIsConnected: (connected: boolean) => {
      set((state) => ({
        ...state,
        isConnected: connected,
      }));
    },
  }))
);

export { useTwitch };
