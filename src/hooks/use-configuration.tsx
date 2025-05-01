import { loadStoreState } from "@/lib/database";
import { useConfigurationStore } from "@/stores";

export const useConfiguration = () => {
  const currentConfiguration = useConfigurationStore((store) => store.state);
  const { updateConfiguration, appendConfiguration } = useConfigurationStore();

  const init = async () => {
    const data = await loadStoreState("CONFIGURATION_STORE");

    if (!data) {
      return;
    }

    updateConfiguration(data.state);
  };

  return {
    configuration: currentConfiguration,
    updateConfiguration,
    appendConfiguration,
    init,
  };
};
