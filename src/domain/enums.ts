export enum EWsEvents {
  NEW_OBS = "NEW_OBS",
  CONNECT_OBS = "CONNECT_OBS",
  DISCONNECT_OBS = "DISCONNECT_OBS",
  SEND_BATCH_EVENT_OBS = "SEND_BATCH_EVENT_OBS",
}

export enum EExportType {
  RUN_SCREEN = "RUN_SCREEN",
  SETUP_SCREEN = "SETUP_SCREEN",
}

export enum EIpcEvents {
  FILE_SAVE = "IPC:FILE_SAVE",
  FILE_REMOVE = "IPC:FILE_REMOVE",
  COPY_FILE = "IPC:COPY_FILE",
  RESET_IMAGES = "IPC:RESET_IMAGES",
}

export enum ECustomEvents {
  RELOAD_APPLICATION = "APP:RELOAD_APPLICATION",
}

export enum EProtocolEvents {
  SHM_PROTOCOL_DATA = "SHM-PROTOCOL-DATA",
}

export enum EFileTagAction {
  NIGHTBOT = "NIGHTBOT",
  OBS = "OBS",
  TWITCH = "TWITCH",
  EXPORT_FILES = "EXPORT_FILES",
}

export enum EFileTagActionComponentsNightbot {
  UPDATE_COMMAND = "UPDATE_COMMAND",
}

export enum EFileTagActionComponentsObs {
  CHANGE_SCENE = "CHANGE_SCENE",
  SET_BROWSER_SOURCE = "SET_BROWSER_SOURCE",
}

export enum EFileTagActionComponentsTwitch {
  UPDATE_TITLE = "UPDATE_TITLE",
  UPDATE_GAME = "UPDATE_GAME",
}

export enum EFileTagActionComponentsExportFiles {
  EXPORT_ALL = "EXPORT_ALL",
}
