import { create } from "zustand";
import { randomUUID } from "crypto";
import { IEvent, IRun } from "@/domain";
import { persistMiddleware } from "@/lib/database";

interface IAddOrUpdateRunAtEventProps {
  run: IRun;
  eventId: string;
}
interface IUpdateFullRunsAtEventProps {
  runs: IRun[];
  eventId: string;
}

export interface IEventStore {
  state: {
    events: IEvent[];
    current_event_id: string | null;
  };
  addEvent: (data: IEvent) => void;
  updateEvent: (data: IEvent) => void;
  updateFullEventState: (data: IEvent[], current_event_id: string | null) => void;
  removeEvent: (eventId: string) => void;
  setCurrentEvent: (eventId: string | null) => void;
  updateFullRunStateToEvent: (options: IUpdateFullRunsAtEventProps) => void;
  addRun: (options: IAddOrUpdateRunAtEventProps) => void;
  updateRun: (options: IAddOrUpdateRunAtEventProps) => void;
  removeRun: (options: IAddOrUpdateRunAtEventProps) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  events: [],
  current_event_id: null,
};

const useEventStore = create<IEventStore, any>(
  persistMiddleware("EVENT_STORE", (set) => ({
    state: {
      ...DEFAULT_STATE,
    },
    addEvent: (event: IEvent) =>
      set((store) => {
        if (!event.id) {
          event.id = randomUUID();
        }

        if (!event.created_at) {
          event.created_at = new Date();
          event.updated_at = event.created_at;
          event.deleted_at = null;
        }

        const runs = event.runs.map((run) => {
          if (run.id) {
            return run;
          }

          return {
            id: randomUUID(),
            ...run,
          };
        });

        event.runs = runs;

        return {
          ...store,
          state: {
            ...store.state,
            events: [...store.state.events, event],
          },
        };
      }),
    updateEvent: (event: IEvent) =>
      set((store) => {
        const updateEventIndex = store.state.events.findIndex(
          ({ id }) => id === event.id
        );

        if (updateEventIndex === null || updateEventIndex === undefined) {
          return store;
        }

        event.updated_at = new Date();

        const newStore = {
          state: {
            ...store.state,
            events: [...store.state.events],
          },
        };

        newStore.state.events[updateEventIndex] = event;
        newStore.state.events = [...newStore.state.events];

        return { ...store, ...newStore };
      }),
    updateFullEventState: (events: IEvent[], current_event_id: string | null) =>
      set(() => ({
        state: {
          ...DEFAULT_STATE,
          current_event_id: current_event_id ? current_event_id : DEFAULT_STATE.current_event_id,
          events,
        },
      })),
    removeEvent: (eventId: string) =>
      set((store) => {
        const newEvents = store.state.events.filter(({ id }) => id !== eventId);

        if (newEvents.length === store.state.events.length) {
          return store;
        }

        const newStore = {
          ...store,
          state: {
            ...store.state,
            events: [...newEvents],
          },
        };

        return newStore;
      }),
    setCurrentEvent: (eventId: string | null) =>
      set((store) => ({
        ...store,
        state: {
          ...store.state,
          current_event_id: eventId,
        },
      })),
    updateFullRunStateToEvent: ({ eventId, runs }) =>
      set((store) => {
        const eventIndex = store.state.events.findIndex(
          ({ id }) => id === eventId
        );
        if (eventIndex === undefined || eventIndex === null) {
          return store;
        }

        const newStore = {
          state: {
            ...store.state,
            events: [...store.state.events],
          },
        };

        newStore.state.events[eventIndex].runs = [...runs];

        return {
          ...store,
          ...newStore,
        };
      }),
    addRun: ({ eventId, run }) =>
      set((store) => {
        const eventIndexToUpdate = store.state.events.findIndex(
          ({ id }) => id === eventId
        );
        if (eventIndexToUpdate === undefined || eventIndexToUpdate === null) {
          return store;
        }

        const newStore = { ...store };
        if (!run.id) {
          run.id = randomUUID();
        }

        newStore.state.events[eventIndexToUpdate].runs = [
          ...newStore.state.events[eventIndexToUpdate].runs,
          run,
        ];

        newStore.state.events[eventIndexToUpdate].updated_at = new Date();

        return { ...newStore };
      }),
    updateRun: ({ eventId, run }) =>
      set((store) => {
        const eventIndex = store.state.events.findIndex(
          ({ id }) => id === eventId
        );
        if (eventIndex === undefined || eventIndex === null) {
          return store;
        }

        const newStore = {
          state: {
            ...store.state,
            events: [...store.state.events],
          },
        };

        newStore.state.events = [...newStore.state.events];
        const event = newStore.state.events[eventIndex];

        const runIndex = event.runs.findIndex(({ id }) => id === run.id);
        if (runIndex === undefined || runIndex === null) {
          return store;
        }

        newStore.state.events[eventIndex].runs[runIndex] = {
          ...run,
        };

        return {
          ...newStore,
        };
      }),
    removeRun: ({ eventId, run }) =>
      set((store) => {
        const eventIndex = store.state.events.findIndex(
          ({ id }) => id === eventId
        );
        if (eventIndex === undefined || eventIndex === null) {
          return store;
        }

        const newStore = {
          state: {
            ...store.state,
            events: [...store.state.events],
          },
        };

        const event = newStore.state.events[eventIndex];
        if (!event) {
          return store;
        }

        const newRuns = event.runs.filter(({ id }) => id !== run.id);
        newStore.state.events[eventIndex].runs = [...newRuns];

        return { ...store, ...newStore };
      }),
    reset: () =>
      set(() => ({
        state: {
          ...DEFAULT_STATE,
        },
      })),
  }))
);

export { useEventStore };
