import { ipcRenderer } from "electron";
import { useConfigurationStore } from "../stores";
import { EWsEvents } from "@/domain/enums";

export class ObsWebsocketService {
  constructor(version: number) {
    ipcRenderer.send(EWsEvents.NEW_OBS, {
      version,
    });
    this.connect();
  }

  async connect() {
    try {
      const {
        obs_ws_address,
        obs_ws_password,
        obs_browser_cam_input_name,
        obs_browser_game_input_name,
      } = useConfigurationStore.getState().state;

      if (!obs_browser_cam_input_name && !obs_browser_game_input_name) {
        console.log(
          "[ObsWebsocketService] Dont has input name for game or cam..."
        );

        return Promise.resolve();
      }

      console.log("CONNECT", obs_ws_address, obs_ws_password);

      return ipcRenderer.invoke(EWsEvents.CONNECT_OBS, {
        address: obs_ws_address,
        password: obs_ws_password,
        secure: false,
      });
    } catch (error) {
      console.error("[OBS] error: ", error);
      throw error;
    }
  }

  disconnect() {
    ipcRenderer.send(EWsEvents.DISCONNECT_OBS);
  }
}
