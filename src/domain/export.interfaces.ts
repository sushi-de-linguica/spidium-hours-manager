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

export interface IFileTagActionModule<
  T = EFileTagNightbotModule | EFileTagTwitchModule | EFileTagObsModule
> {
  isEnabled: boolean;
  module: T;
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
  value: string;
  resourceName: string;
}

export interface IFileTag {
  id?: string;
  label: string;
  description?: string;
  path?: string;
  actions: IFileTagActionModule[];
  variant: string;
  color: string;
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
