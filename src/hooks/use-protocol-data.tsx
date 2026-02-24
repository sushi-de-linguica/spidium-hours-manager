import { ECustomEvents, EProtocolEvents } from "@/domain";
import { NightbotApiService } from "@/services/nightbot-service";
import { TwitchApiService } from "@/services/twitch-service";
import { useConfigurationStore, useNightbot, useTwitch } from "@/stores";
import { ipcRenderer } from "electron";
import { useEffect } from "react";
import axios from "axios";

export const useProtocolData = () => {
  const handleProtocolCallback = (callback: string, value: string) => {
    switch (callback) {
      case "nightbot_code":
        console.log(
          "updating nightbot token from shm protocol callback",
          callback,
          value,
        );
        const configuration = useConfigurationStore.getState().state;
        const service = new NightbotApiService();

        service
          .getTokenFromCode({
            grant_type: "authorization_code",
            code: value,
            client_id: configuration.nightbot_client_id,
            client_secret: configuration.nightbot_client_secret,
            redirect_uri: configuration.nightbot_redirect_uri,
          })
          .then((response) => {
            console.log(
              "[getTokenFromCode] response:",
              JSON.stringify(response.data, null, 2),
            );
            useConfigurationStore
              .getState()
              .updateConfigurationField(
                "nightbot_token",
                response.data.access_token,
              );

            useNightbot.getState().appendState({
              access_token: value,
            });

            setTimeout(async () => {
              await service.getCommands().finally(() => {
                window.dispatchEvent(
                  new CustomEvent(ECustomEvents.RELOAD_APPLICATION),
                );
              });
            }, 1500);
          });

        break;
      case "twitch_token":
        console.log("updating twitch token from shm protocol callback");
        useConfigurationStore
          .getState()
          .updateConfigurationField("twitch_token", value);
        useTwitch.getState().appendState({
          access_token: value,
        });

        setTimeout(async () => {
          const service = new TwitchApiService();

          service.updateBroadcastId().finally(() => {
            window.dispatchEvent(
              new CustomEvent(ECustomEvents.RELOAD_APPLICATION),
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

    (window as any).setNightbotToken = (token: string) => {
      handleProtocolCallback("nightbot_code", token);
    };

    (window as any).setTwitchToken = (token: string) => {
      handleProtocolCallback("twitch_token", token);
    };

    return () => {
      window.removeEventListener(
        ECustomEvents.RELOAD_APPLICATION,
        handleReloadPage,
      );
    };
  }, []);

  return <></>;
};
