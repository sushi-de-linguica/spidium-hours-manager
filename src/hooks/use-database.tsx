import { useEvents } from "./use-events";
import { useMembers } from "./use-members";
import { useObs } from "./use-obs";
import { useConfiguration } from "./use-configuration";
import { useNightbot } from "./use-nightbot";
import { useTwitch } from "./use-twitch";
import { useFile } from "./use-file";

export const useDatabase = () => {
  const configuration = useConfiguration();
  const members = useMembers();
  const events = useEvents();

  const obs = useObs();
  const nightbot = useNightbot();
  const twitch = useTwitch();
  const file = useFile();

  const init = async () => {
    console.log("Initializing database...");

    const promisses = [
      configuration
        .init()
        .then(() => console.log("Configurations initialized")),
      members.init().then(() => console.log("Members initialized")),
      events.init().then(() => console.log("Events initialized")),
      obs.init().then(() => console.log("OBS initialized")),
      nightbot.init().then(() => console.log("Nightbot initialized")),
      twitch.init().then(() => console.log("Twitch initialized")),
      file.init().then(() => console.log("File initialized")),
    ];

    return await Promise.allSettled(promisses);
  };

  return {
    init,
  };
};
