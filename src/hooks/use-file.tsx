import { loadStoreState } from "@/lib/database";
import { useFileStore } from "@/stores";

export const useFile = () => {
  const {
    state: filesStore,
    setState,
    addTag,
    updateTag,
    removeTag,
    updateTagOrder,
  } = useFileStore();

  const init = async () => {
    const data = await loadStoreState("FILE_STORE");

    if (!data) {
      return;
    }

    setState(data.state);
  };

  return {
    filesStore,
    addTag,
    updateTag,
    removeTag,
    updateTagOrder,
    init,
  };
};
