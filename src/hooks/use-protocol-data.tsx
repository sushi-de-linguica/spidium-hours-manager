import { ECustomEvents, EProtocolEvents } from "@/domain";
import { NightbotApiService } from "@/services/nightbot-service";
import { TwitchApiService } from "@/services/twitch-service";
import { useConfigurationStore, useNightbot, useTwitch } from "@/stores";
import { ipcRenderer } from "electron";
import { useEffect } from "react";

export const useProtocolData = () => {
  const nightbotStore = useNightbot();
  const twitchStore = useTwitch();
  const { appendConfiguration } = useConfigurationStore();

  const handleProtocolCallback = (callback: string, value: string) => {
    switch (callback) {
      case "nightbot_token":
        console.log("updating nightbot token from shm protocol callback");

        appendConfiguration({
          nightbot_token: value,
        });

        nightbotStore.appendState({
          access_token: value,
        });

        setTimeout(async () => {
          const service = new NightbotApiService();

          await service.getCommands().finally(() => {
            window.dispatchEvent(
              new CustomEvent(ECustomEvents.RELOAD_APPLICATION)
            );
          });
        }, 1500);

        break;
      case "twitch_token":
        console.log("updating twitch token from shm protocol callback");

        appendConfiguration({
          twitch_token: value,
        });

        twitchStore.appendState({
          access_token: value,
        });

        setTimeout(async () => {
          const service = new TwitchApiService();

          service.updateBroadcastId().finally(() => {
            window.dispatchEvent(
              new CustomEvent(ECustomEvents.RELOAD_APPLICATION)
            );
          });
        }, 1500);

        break;
    }
  };

  const handleShmProtocolData = (_event: any, protocolUrl: any) => {
    console.log("protocolUrl", protocolUrl);
    try {
      const url = new URL(protocolUrl);
      if (!url) {
        return;
      }

      const callback = url.searchParams.get("callback");
      const value = url.searchParams.get("value");

      if (callback && value) {
        handleProtocolCallback(callback, value);
      }
    } catch (error) {
      console.log("[shm protocol error]:", error);
    }
  };

  const handleReloadPage = () => {
    window.document.location.reload();
  };

  useEffect(() => {
    console.log("Starting useProtocolData");

    ipcRenderer.on(EProtocolEvents.SHM_PROTOCOL_DATA, handleShmProtocolData);
    window.addEventListener(ECustomEvents.RELOAD_APPLICATION, handleReloadPage);

    return () => {
      window.removeEventListener(
        ECustomEvents.RELOAD_APPLICATION,
        handleReloadPage
      );
    };
  }, []);

  return <></>;
};
