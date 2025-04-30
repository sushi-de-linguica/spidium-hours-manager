import { IMember, IRun } from "@/domain";
import { create } from "zustand";
import { randomUUID } from "crypto";
import { useEventStore } from "@/stores";
import { persistMiddleware } from "@/lib/database";

export interface IMemberStore {
  state: {
    members: IMember[];
  };
  addMember: (run: IMember) => IMember;
  updateMember: (run: IMember) => void;
  removeMember: (run: IMember) => void;
  setState: (files: IMember[]) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  members: [],
};

const useMemberStore = create<IMemberStore, any>(
  persistMiddleware("MEMBER_STORE", (set) => ({
    state: {
      ...DEFAULT_STATE,
    },
    addMember: (member: IMember): IMember => {
      if (!member.id) {
        member.id = randomUUID();
      }

      set((state) => {
        const alreadyExist = state.state.members.find(
          (currentMember) => currentMember.id === member.id
        );

        if (alreadyExist) {
          return state;
        }

        return {
          ...state,
          state: {
            ...state.state,
            members: [...state.state.members, member],
          },
        };
      });

      return member;
    },
    updateMember: (member: IMember) => {
      set((state) => {
        const newState = {
          ...state,
        };

        const newMembers = [...state.state.members];

        const updateIndex = newMembers.findIndex(({ id }) => id === member.id);
        if (updateIndex === null || updateIndex === undefined) {
          return state;
        }

        handleUpdateMembersOnAllRuns(member);

        newState.state.members[updateIndex] = member;
        newState.state.members = [...newState.state.members];

        return { ...newState };
      });
    },
    removeMember: (member: IMember) => {
      handleRemoveMemberOnAllRuns(member);
      set((state) => ({
        ...state,
        state: {
          members: state.state.members.filter(({ id }) => id !== member.id),
        },
      }));
    },
    setState: (members: IMember[]) =>
      set(() => ({
        state: {
          members,
        },
      })),
    reset: () =>
      set(() => ({
        state: {
          ...DEFAULT_STATE,
        },
      })),
  }))
);

const handleUpdateMembersOnAllRuns = (member: IMember) => {
  let updated = 0;
  const eventStore = useEventStore.getState();
  const { updateFullEventState } = eventStore;
  const { events } = eventStore.state;

  const newEventState = [...JSON.parse(JSON.stringify(events))].map((event) => {
    const newRuns = event.runs.map((run: IRun) => {
      const memberIndexAtRunners = run.runners.findIndex(
        ({ id }) => id === member.id
      );
      const memberIndexAtHosts = run.hosts.findIndex(
        ({ id }) => id === member.id
      );
      const memberIndexAtComments = run.comments.findIndex(
        ({ id }) => id === member.id
      );

      if (memberIndexAtRunners !== null && memberIndexAtRunners !== null) {
        updated++;
        run.runners[memberIndexAtRunners] = member;
      }

      if (memberIndexAtHosts !== null && memberIndexAtHosts !== null) {
        updated++;
        run.hosts[memberIndexAtHosts] = member;
      }

      if (memberIndexAtComments !== null && memberIndexAtComments !== null) {
        updated++;
        run.comments[memberIndexAtComments] = member;
      }

      return { ...run };
    });

    return {
      ...event,
      runs: [...newRuns],
    };
  });

  if (updated > 0) {
    updateFullEventState(newEventState);
  }
};

const handleRemoveMemberOnAllRuns = (member: IMember) => {
  let removed = 0;

  const eventStore = useEventStore.getState();
  const { updateFullEventState } = eventStore;
  const { events } = eventStore.state;

  const newEventState = [...JSON.parse(JSON.stringify(events))].map((event) => {
    const newRuns = event.runs.map((run: IRun) => {
      const memberIndexAtRunners = run.runners.findIndex(
        ({ id }) => id === member.id
      );
      const memberIndexAtHosts = run.hosts.findIndex(
        ({ id }) => id === member.id
      );
      const memberIndexAtComments = run.comments.findIndex(
        ({ id }) => id === member.id
      );

      const filterExceptMemberId = (runMember: IMember) =>
        runMember.id !== member.id;

      if (memberIndexAtRunners !== null && memberIndexAtRunners !== null) {
        removed++;
        run.runners = run.runners.filter(filterExceptMemberId);
      }

      if (memberIndexAtHosts !== null && memberIndexAtHosts !== null) {
        removed++;
        run.hosts = run.hosts.filter(filterExceptMemberId);
      }

      if (memberIndexAtComments !== null && memberIndexAtComments !== null) {
        removed++;
        run.comments = run.comments.filter(filterExceptMemberId);
      }

      return { ...run };
    });

    return {
      ...event,
      runs: [...newRuns],
    };
  });

  if (removed > 0) {
    updateFullEventState(newEventState);
  }
};

export { useMemberStore };
