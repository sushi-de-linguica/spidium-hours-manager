import { IConfiguration } from "./configuration.interface";
import { EExportType } from "./enums";
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

export interface IFileTagActionOptions<T = any> {
  isEnabled: boolean;
  options?: T;
}

export interface IFileTagActions {
  nightbotSetRunnerCommand: IFileTagActionOptions;
  nightbotSetHostCommand: IFileTagActionOptions;
  nightbotSetCommentCommand: IFileTagActionOptions;
  obsSetBrowserSource: IFileTagActionOptions<string>;
  twitchSetTitle: IFileTagActionOptions<string>;
  twitchSetGame: IFileTagActionOptions;
}

export interface IFileTag {
  id?: string;
  label: string;
  description?: string;
  path?: string;
  actions: IFileTagActions[];
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
