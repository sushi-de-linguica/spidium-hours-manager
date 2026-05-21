import {
  IObsWebSocket,
  IObsWebSocketConnectionProps,
  IObsWsEventSetInputSettings,
} from "./interfaces";

import ObsWebSocket4 from "obs-websocket-js";

import { handleParseEventsToOBSWS4 } from "./parse-events-to-obsws4";

import { toggleAudioMuteV4 } from "./toggle-audio-mute";
import {
  processObsBatchRequests,
  toggleSceneItemVisibilityV4,
} from "./toggle-scene-item-visibility";

export class ObsWebSocketV4 implements IObsWebSocket<ObsWebSocket4> {
  public readonly obs: ObsWebSocket4;

  constructor(props?: IObsWebSocketConnectionProps) {
    console.log("new instance of ObsWebSocket4");

    this.obs = new ObsWebSocket4();

    if (props) {
      this.connect(props);
    }
  }

  async connect({
    address,

    password,
  }: IObsWebSocketConnectionProps): Promise<any> {
    return this.obs.connect({
      address,

      password,
    });
  }

  async send(requestType: any, requestData?: any): Promise<any> {
    return this.obs.send(requestType, requestData);
  }

  emit(requestType: any, requestData?: any): boolean {
    return this.obs.emit(requestType, requestData);
  }

  async sendBatch(requests: IObsWsEventSetInputSettings[]): Promise<any> {
    return processObsBatchRequests(requests, {
      useV4: true,

      onToggleVisibilityV4: (data) =>
        toggleSceneItemVisibilityV4(
          (requestType, requestData) => this.send(requestType, requestData),

          data,
        ),

      onToggleVisibilityV5: async () => undefined,

      onToggleAudioMuteV4: (data) =>
        toggleAudioMuteV4(
          (requestType, requestData) => this.send(requestType, requestData),
          data
        ),

      onToggleAudioMuteV5: async () => ({ inputMuted: false }),

      onBatchable: async (batchable) => {
        const parsed = handleParseEventsToOBSWS4(
          batchable as IObsWsEventSetInputSettings[],
        );

        for (const request of parsed) {
          await this.send(request.requestType, request.requestData);
        }

        return true;
      },
    });
  }

  disconnect(): void {
    this.obs.disconnect();
  }
}
