import { useConfigurationStore } from "@/stores";

export const useConfiguration = () => {
  const currentConfiguration = useConfigurationStore((store) => store.state);
  const { updateConfiguration, appendConfiguration } = useConfigurationStore();

  return {
    configuration: currentConfiguration,
    updateConfiguration,
    appendConfiguration,
  };
};
