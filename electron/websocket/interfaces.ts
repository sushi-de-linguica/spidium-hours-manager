export interface IObsWebSocketConnectionProps {
  address: string;
  password?: string;
  secure?: boolean;
}

interface IObsWsRequestDataV4 {
  sourceName: string;
  sourceSettings: any;
}
interface IObsWsRequestDataV5 {
  inputName: string;
  inputSettings: any;
}

export interface IObsWsEventSetInputSettings<T = IObsWsRequestDataV5> {
  requestType: string;
  requestData: T;
}

export interface IObsWebSocket<T = any> {
  obs: T;
  connect: (data: IObsWebSocketConnectionProps) => Promise<void>;
  send: (requestType: string, requestData?: any) => Promise<any>;
  emit: (requestType: string, requestData?: any) => boolean;
  sendBatch: (requests: IObsWsEventSetInputSettings[]) => Promise<any>;
  disconnect: () => void;
}
