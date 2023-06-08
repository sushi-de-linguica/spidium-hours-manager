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
}

export interface IExportedJsonFile {
  configuration?: IConfiguration;
  file?: {
    files: IExportFileRun[];
  };
  member?: {
    members: IMember[];
  };
  event?: {
    events: IEvent[];
  };
}
