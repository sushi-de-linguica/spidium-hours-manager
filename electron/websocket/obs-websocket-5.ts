const { default: ObsWebSocket } = require("obs-websocket-js5");

import { IObsWebSocket, IObsWebSocketConnectionProps } from "./interfaces";

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
    return this.obs.callBatch(requests);
  }

  emit(requestType: any, requestData?: any): boolean {
    return this.obs.emit(requestType, requestData);
  }

  disconnect(): void {
    this.obs.disconnect();
  }
}
