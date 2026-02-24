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
  extends INightbotModel, INightbotCommand {}

export interface INightbotApiCommandResponse {
  status: number;
  command: INightbotCommandModel;
}

export interface INightbotApiCommandListResponse {
  _total: number;
  commands: INightbotCommandModel[];
}

export interface INightbotApiTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface INightbotApiTokenRequest {
  grant_type: string;
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}
