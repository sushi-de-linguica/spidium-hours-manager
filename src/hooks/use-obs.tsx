import { ECustomEvents } from "@/domain";
import { ObsWebsocketService } from "@/services/obs-service";
import { useObsStore } from "@/stores/slices/obs";
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

export const useObs = () => {
  const [obsIsReady, setObsIsReady] = useState(false);
  const [listenersAttached, setListenersAttached] = useState(false);
  const { version } = useObsStore((store) => store.state);

  const handleObsReady = () => setObsIsReady(true);
  const handleObsNotReady = () => setObsIsReady(false);

  const handleAttachListeners = () => {
    if (!listenersAttached) {
      ipcRenderer.on("AuthenticationSuccess", handleObsReady);
      ipcRenderer.on("AuthenticationFailure", handleObsNotReady);
      ipcRenderer.on("ConnectionOpened", handleObsReady);
      ipcRenderer.on("ConnectionClosed", handleObsNotReady);
      ipcRenderer.on("Identified", handleObsReady);
      ipcRenderer.on("error", handleObsNotReady);

      ipcRenderer.on("DESTROY_OBS", () => {
        setObsIsReady(false);
      });

      setListenersAttached(true);
    }
  };

  const handleRemoveAttachedListeners = () => {
    ipcRenderer.removeListener("AuthenticationSuccess", handleObsReady);
    ipcRenderer.removeListener("ConnectionOpened", handleObsReady);
    ipcRenderer.removeListener("AuthenticationFailure", handleObsNotReady);
    ipcRenderer.removeListener("ConnectionClosed", handleObsNotReady);
    ipcRenderer.removeListener("error", handleObsNotReady);
    setListenersAttached(false);
  };

  const handleReloadPage = () => {
    window.document.location.reload();
  };

  useEffect(() => {
    console.log("Starting useObs", version);
    handleAttachListeners();

    window.addEventListener(ECustomEvents.RELOAD_APPLICATION, handleReloadPage);

    if (!window.obsService) {
      window.obsService = new ObsWebsocketService(version);
    }

    return () => {
      handleRemoveAttachedListeners();

      window.removeEventListener(
        ECustomEvents.RELOAD_APPLICATION,
        handleReloadPage
      );
    };
  }, []);

  return {
    obsIsReady,
    version,
  };
};
