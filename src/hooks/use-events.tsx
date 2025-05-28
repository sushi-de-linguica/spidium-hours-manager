import { IEvent } from "@/domain";
import { loadStoreState } from "@/lib/database";
import { IEventStore, useEventStore } from "@/stores";

export const useEvents = () => {
  const {
    state: eventsStore,
    addEvent,
    addRun,
    removeEvent,
    removeRun,
    updateEvent,
    updateRun,
    setCurrentEvent,
    updateFullEventState,
    reset,
  } = useEventStore();

  const getEventById = (id: string): IEvent | undefined => {
    return eventsStore.events.find((event) => event.id === id);
  };

  const init = async () => {
    const data: null | IEventStore = await loadStoreState("EVENT_STORE");
    if (!data) {
      return;
    }

    const currentEventIdExists = data.state.current_event_id && data.state.events?.find((event) => event.id === data.state.current_event_id);
    updateFullEventState(data.state.events, currentEventIdExists ? data.state.current_event_id : null);
  };

  return {
    eventsStore,
    addEvent,
    addRun,
    removeEvent,
    removeRun,
    updateEvent,
    updateRun,
    setCurrentEvent,
    getEventById,
    init,
    resetEvents: reset,
  };
};
