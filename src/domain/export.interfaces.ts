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
  T = IFileTagNightbotModule | IFileTagTwitchModule | IFileTagObsModule
> {
  isEnabled: boolean;
  module: T;
}

export interface IFileTagNightbotModule {
  action: EFileTagAction.NIGHTBOT;
  component: EFileTagActionComponentsNightbot;
  configurationCommandField: string;
  template: string;
}

export interface IFileTagTwitchModule {
  action: EFileTagAction.TWITCH;
  component: EFileTagActionComponentsTwitch;
  value: string;
}

export interface IFileTagObsModule {
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
  minimumRunnersToShow: number;
  isShow: boolean;
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
