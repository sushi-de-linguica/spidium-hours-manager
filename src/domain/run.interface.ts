import { IFile } from "./file.interface";
import { IMember } from "./member.interface";

export interface IRun {
  id?: string;
  runners: IMember[];
  hosts: IMember[];
  comments: IMember[];
  estimate: string;
  game: string;
  category: string;
  platform: string;
  imageFile?: IFile | null;

  seoTitle?: string;
  seoGame?: string;

  [key: string]: any;
}
