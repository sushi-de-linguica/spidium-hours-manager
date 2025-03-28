import { useMemberStore } from "@/stores";

export const useMembers = () => {
  const {
    state: membersStore,
    addMember,
    removeMember,
    updateMember,
  } = useMemberStore();

  return {
    membersStore,
    addMember,
    removeMember,
    updateMember,
  };
};
