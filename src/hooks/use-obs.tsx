import { loadStoreState } from "@/lib/database";
import { GlobalContext } from "@/stores/context/global";
import { IObsStore, useObsStore } from "@/stores/slices/obs";
import { ipcRenderer } from "electron";
import { useContext, useState } from "react";

export const useObs = () => {
  const globalContext = useContext(GlobalContext);
  const [listenersAttached, setListenersAttached] = useState(false);
  const {
    setState: setObsStoreState,
    setFullState,
    state: obsStoreState,
  } = useObsStore();

  const handleObsReady = () => {
    globalContext.obsIsReady = true;
  };
  const handleObsNotReady = () => {
    globalContext.obsIsReady = false;
  };

  const handleAttachListeners = () => {
    if (!listenersAttached) {
      ipcRenderer.on("AuthenticationSuccess", handleObsReady);
      ipcRenderer.on("AuthenticationFailure", handleObsNotReady);
      ipcRenderer.on("ConnectionOpened", handleObsReady);
      ipcRenderer.on("ConnectionClosed", handleObsNotReady);
      ipcRenderer.on("Identified", handleObsReady);
      ipcRenderer.on("error", handleObsNotReady);

      ipcRenderer.on("DESTROY_OBS", () => {
        handleObsNotReady();
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

  const init = async () => {
    const data: null | IObsStore = await loadStoreState("OBS_STORE");
    if (!data) {
      return;
    }

    console.log("initial DATA FULL from storage", data);
    console.log("initial data from storage", data.state.version);

    setFullState(data);
  };

  const setObsIsReady = (isReady: boolean) => {
    globalContext.obsIsReady = isReady;
  };

  return {
    obsIsReady: globalContext.obsIsReady,
    setObsIsReady,
    version: obsStoreState.version,
    setObsStoreState,
    obsStoreState,
    init,
    listeners: {
      handleRemoveAttachedListeners,
      handleAttachListeners,
    },
  };
};
