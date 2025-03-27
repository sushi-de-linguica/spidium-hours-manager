import { NightbotApiService } from "@/services/nightbot-service";
import { useNightbot as useNightbotStore } from "@/stores";
import { useEffect } from "react";

export const useNightbot = () => {
  const { state: nightbotState, isConnected } = useNightbotStore();

  const testConnection = () => {
    const service = new NightbotApiService();
    return service.testConnection();
  };

  useEffect(() => {
    console.log("testConnection", isConnected);
  }, [isConnected]);

  return {
    nightbotState,
    isConnected,
    testConnection,
  };
};
