import { loadStoreState } from "@/lib/database";
import { NightbotApiService } from "@/services/nightbot-service";
import { useNightbot as useNightbotStore } from "@/stores";
import { useEffect } from "react";

export const useNightbot = () => {
  const {
    state: nightbotState,
    isConnected,
    setFullState,
  } = useNightbotStore();

  const testConnection = () => {
    const service = new NightbotApiService();
    return service.testConnection().finally(() =>
      window.dispatchEvent(new Event("status-update"))
    );
  };

  const init = async () => {
    const data = await loadStoreState("NIGHTBOT_STORE");

    if (!data) {
      return;
    }

    setFullState(data.state);
  };

  const getCommands = async () => {
    const service = new NightbotApiService();
    return service.getCommands();
  };

  return {
    nightbotState,
    isConnected,
    testConnection,
    getCommands,
    init,
  };
};
