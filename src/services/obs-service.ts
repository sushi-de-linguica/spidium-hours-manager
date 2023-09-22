import { ipcRenderer } from "electron";
import { useConfigurationStore } from "../stores";
import { EWsEvents } from "@/domain/enums";
import { toast } from "react-toastify";

export class ObsWebsocketService {
  constructor(version: number) {
    ipcRenderer.send(EWsEvents.NEW_OBS, {
      version,
    });
    this.connect();
  }

  async connect() {
    try {
      const { obs_ws_address, obs_ws_password } =
        useConfigurationStore.getState().state;

      console.log("CONNECT START", obs_ws_address, obs_ws_password);

      return await ipcRenderer.invoke(EWsEvents.CONNECT_OBS, {
        address: obs_ws_address,
        password: obs_ws_password,
        secure: false,
      });
    } catch (error) {
      console.error("[OBS] error: ", error);
      return Promise.reject(error);
    }
  }

  disconnect() {
    ipcRenderer.send(EWsEvents.DISCONNECT_OBS);
  }
}
