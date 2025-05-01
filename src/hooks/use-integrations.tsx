import { useNightbot } from "./use-nightbot";
import { useObs } from "./use-obs";
import { useTwitch } from "./use-twitch";

export const useIntegrations = () => {
  const { testConnection: testNightbotConnection } = useNightbot();
  const { testConnection: testTwitchConnection } = useTwitch();
  const { testConnection: testObsConnection } = useObs();

  const testAllConnections = async () => {
    await testNightbotConnection();
    await testTwitchConnection();
    testObsConnection();

    setTimeout(() => {
      window.dispatchEvent(new Event("status-update"));
    }, 3000);
  }

  return {
    testAllConnections,
  }
}
