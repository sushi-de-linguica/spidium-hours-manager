import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ITwitch {
  access_token: string;
  client_id: string;
  expires_in?: number;
  scope?: string;
  broadcaster_id?: string;
}

export interface ITwitchStore {
  state: ITwitch;
  appendState: (newState: Partial<ITwitch>) => void;
  setState: (newState: ITwitch) => void;
  setBroadcasterId: (value: string) => void;
  reset: () => void;
}

const DEFAULT_STATE: ITwitch = {
  access_token: "",
  client_id: "",
  broadcaster_id: "",
};

const useTwitch = create<ITwitchStore, any>(
  persist(
    (set) => ({
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
    }),
    {
      name: "SPIDIUM_TWITCH_STORE",
    }
  )
);

export { useTwitch };
