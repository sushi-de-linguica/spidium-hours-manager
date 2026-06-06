const { default: ObsWebSocket } = require("obs-websocket-js5");

import { IObsWebSocket, IObsWebSocketConnectionProps } from "./interfaces";
import { toggleAudioMuteV5 } from "./toggle-audio-mute";
import {
  processObsBatchRequests,
  setSceneItemVisibilityV5,
  toggleSceneItemVisibilityV5,
} from "./toggle-scene-item-visibility";

export class ObsWebSocketV5 implements IObsWebSocket<any> {
  public readonly obs: any;

  constructor(props?: IObsWebSocketConnectionProps) {
    console.log("new instance of ObsWebSocket5");
    this.obs = new ObsWebSocket();

    if (props) {
      this.connect(props);
    }
  }

  async connect({
    address,
    password,
  }: IObsWebSocketConnectionProps): Promise<any> {
    return this.obs.connect(`ws://${address}`, password);
  }

  async send(requestType: any, requestData?: any): Promise<any> {
    return this.obs.call(requestType, requestData);
  }

  async sendBatch(requests: any[]): Promise<any> {
    return processObsBatchRequests(requests, {
      useV4: false,
      onToggleVisibilityV5: (data) =>
        toggleSceneItemVisibilityV5(
          (requestType, requestData) => this.obs.call(requestType, requestData),
          data
        ),
      onToggleVisibilityV4: async (): Promise<never> => {
        throw new Error("OBS v5 client does not use v4 visibility handler");
      },
      onSetVisibilityV5: (data) =>
        setSceneItemVisibilityV5(
          (requestType, requestData) => this.obs.call(requestType, requestData),
          data
        ),
      onSetVisibilityV4: async (): Promise<never> => {
        throw new Error("OBS v5 client does not use v4 set visibility handler");
      },
      onToggleAudioMuteV5: (data) =>
        toggleAudioMuteV5(
          (requestType, requestData) => this.obs.call(requestType, requestData),
          data
        ),
      onToggleAudioMuteV4: async (): Promise<never> => {
        throw new Error("OBS v5 client does not use v4 audio mute handler");
      },
      onBatchable: (batchable) =>
        this.obs.callBatch(batchable, { haltOnFailure: true }),
    });
  }

  emit(requestType: any, requestData?: any): boolean {
    return this.obs.emit(requestType, requestData);
  }

  disconnect(): void {
    this.obs.disconnect();
  }
}
