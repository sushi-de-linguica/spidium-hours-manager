import { loadStoreState } from "@/lib/database";
import { useMemberStore } from "@/stores";

export const useMembers = () => {
  const {
    state: membersStore,
    addMember,
    removeMember,
    updateMember,
    setState,
  } = useMemberStore();

  const init = async () => {
    await loadStoreState("MEMBER_STORE").then((data) => {
      if (!data) {
        return;
      }

      setState(data?.state?.members ?? []);
    });
  };

  return {
    membersStore,
    addMember,
    removeMember,
    updateMember,
    init,
  };
};
