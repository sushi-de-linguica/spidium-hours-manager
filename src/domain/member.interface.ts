import { IFile } from "./file.interface";

export interface IMember {
  id?: string;
  gender: string;
  name: string;
  primaryTwitch?: string;
  secondaryTwitch?: string;
  streamAt?: string;
  link: string;
  imageFile?: IFile | null;
}
