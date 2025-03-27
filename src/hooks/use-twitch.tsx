import { TwitchApiService } from "@/services/twitch-service";
import { useTwitch as useTwitchStore } from "@/stores";

export const useTwitch = () => {
  const { isConnected, state: twitchStore, appendState } = useTwitchStore();

  const testConnection = () => {
    const service = new TwitchApiService();
    return service.testConnection();
  };

  return {
    isConnected,
    twitchStore,
    appendState,
    testConnection,
  };
};
