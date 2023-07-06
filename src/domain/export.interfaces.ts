import { IConfiguration } from "./configuration.interface";
import {
  EExportType,
  EFileTagAction,
  EFileTagActionComponentsNightbot,
  EFileTagActionComponentsObs,
  EFileTagActionComponentsTwitch,
} from "./enums";
import { IEvent } from "./event.interface";
import { IMember } from "./member.interface";

export interface IExportFileRun {
  id?: string;
  type: EExportType;
  name: string;
  template: string;
  maxCharsPerLine?: number;
  tags?: string[];
}

export interface IFileTagActionModule {
  isEnabled: boolean;
  module: EFileTagNightbotModule | EFileTagTwitchModule | EFileTagObsModule;
}

export interface EFileTagNightbotModule {
  action: EFileTagAction.NIGHTBOT;
  component: EFileTagActionComponentsNightbot;
  configurationCommandField: string;
  template: string;
}

export interface EFileTagTwitchModule {
  action: EFileTagAction.TWITCH;
  component: EFileTagActionComponentsTwitch;
  value: string;
}

export interface EFileTagObsModule {
  action: EFileTagAction.OBS;
  component: EFileTagActionComponentsObs;
  data: any;
}

export interface IFileTag {
  id?: string;
  label: string;
  description?: string;
  path?: string;
  actions: IFileTagActionModule[];
}

export interface IExportedJsonFile {
  configuration?: IConfiguration;
  file?: {
    files: IExportFileRun[];
    tags: IFileTag[];
  };
  member?: {
    members: IMember[];
  };
  event?: {
    events: IEvent[];
  };
}
