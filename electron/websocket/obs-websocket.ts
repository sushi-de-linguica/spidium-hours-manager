import {
  IObsWebSocket,
  IObsWebSocketConnectionProps,
  IObsWsEventSetInputSettings,
} from "./interfaces";
import ObsWebSocket4 from "obs-websocket-js";

import { handleParseEventsToOBSWS4 } from "./parse-events-to-obsws4";

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
    return new Promise(async (resolve) => {
      for (const request of handleParseEventsToOBSWS4(requests)) {
        await this.send(request.requestType, request.requestData);
      }
      resolve(true);
    });
  }

  disconnect(): void {
    this.obs.disconnect();
  }
}
