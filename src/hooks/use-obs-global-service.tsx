import { useObs } from "./use-obs";
import { ECustomEvents } from "@/domain";
import { ObsWebsocketService } from "@/services/obs-service";
import { useObsStore } from "@/stores/slices/obs";

export const useObsGlobalService = () => {
  const {
    listeners: { handleAttachListeners, handleRemoveAttachedListeners },
    setObsIsReady,
  } = useObs();

  const handleReloadPage = () => {
    window.document.location.reload();
  };

  const start = () => {
    const version = useObsStore.getState().state.version;

    console.log("Starting using global obs service", version);
    handleAttachListeners();

    window.addEventListener(ECustomEvents.RELOAD_APPLICATION, handleReloadPage);

    if (!window.obsService) {
      window.obsService = new ObsWebsocketService(version);

      window
        .obsService!.connect()
        .then(() => {
          setObsIsReady(true);
        })
        .catch(() => {
          setObsIsReady(false);
        });
    }
  };

  const destroy = () => {
    handleRemoveAttachedListeners();

    window.removeEventListener(
      ECustomEvents.RELOAD_APPLICATION,
      handleReloadPage
    );
  };

  return {
    start,
    destroy,
  };
};
