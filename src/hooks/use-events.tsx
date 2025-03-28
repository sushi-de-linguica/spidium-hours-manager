import { IEvent } from "@/domain";
import { useEventStore } from "@/stores";

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
  } = useEventStore();

  const getEventById = (id: string): IEvent | undefined => {
    return eventsStore.events.find((event) => event.id === id);
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
  };
};
