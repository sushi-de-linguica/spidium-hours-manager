interface INightbotModel {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface INightbotCommand {
  name: string;
  message: string;
  coolDown: number;
  count: number;
  userLevel: string;
}

export interface INightbotCommandModel
  extends INightbotModel,
    INightbotCommand {}

export interface INightbotApiCommandResponse {
  status: number;
  command: INightbotCommandModel;
}

export interface INightbotApiCommandListResponse {
  _total: number;
  commands: INightbotCommandModel[];
}
