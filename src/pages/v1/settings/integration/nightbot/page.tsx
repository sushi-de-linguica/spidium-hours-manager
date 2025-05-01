import NightbotIntegration from "./nightbot-card";
import { NightbotCommands } from "./nightbot-commands";
import { useNightbot } from "@/hooks/use-nightbot";

export const IntegrationNightbotPage = () => {
  const { isConnected } = useNightbot();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <NightbotIntegration />
      {isConnected && <NightbotCommands />}
    </div>
  );
};
