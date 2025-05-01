import Dexie, { Table } from "dexie";
import { StateCreator } from "zustand";

export interface StoreState {
  name: string;
  state: any;
}

class ZustandDB extends Dexie {
  store!: Table<StoreState>;

  constructor() {
    super("zustand-store");
    this.version(1).stores({
      store: "name",
    });
  }
}

export const zustandDB = new ZustandDB();

export async function saveStoreState(name: string, state: any) {
  await zustandDB.store.put({ name, state });
}

export async function loadStoreState(name: string): Promise<any | null> {
  const entry = await zustandDB.store.get(name);
  return entry?.state || null;
}

export function persistMiddleware<T extends object>(
  storeName: string,
  config: StateCreator<T>
): StateCreator<T> {
  return (set, get, api) =>
    config(
      (args) => {
        set(args);

        const state = get();
        const pureState = Object.fromEntries(
          Object.entries(state).filter(
            ([_, value]) => typeof value !== "function"
          )
        );

        saveStoreState(storeName, pureState);
      },
      get,
      api
    );
}
