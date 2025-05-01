import { IFile } from "./file.interface";

export interface IMemberImage {
  id: string;
  name: string;
  file: IFile;
}

export interface IMember {
  id?: string;
  gender: string;
  name: string;
  primaryTwitch?: string;
  secondaryTwitch?: string;
  streamAt?: string;
  link?: string;
  images?: IMemberImage[];
}
