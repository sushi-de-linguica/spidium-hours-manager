import { loadStoreState } from "@/lib/database";
import { TwitchApiService } from "@/services/twitch-service";
import { useTwitch as useTwitchStore } from "@/stores";

export const useTwitch = () => {
  const { isConnected, state: twitchStore, appendState } = useTwitchStore();

  const testConnection = () => {
    const service = new TwitchApiService();
    return service.testConnection().finally(() =>
      window.dispatchEvent(new Event("status-update"))
    );
  };

  const init = async () => {
    const data = await loadStoreState("TWITCH_STORE");

    if (!data) {
      return;
    }

    appendState(data.state);
  };

  return {
    isConnected,
    twitchStore,
    appendState,
    testConnection,
    init,
  };
};
