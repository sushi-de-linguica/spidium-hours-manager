import { IFile } from "./file.interface";
import { IMember } from "./member.interface";

export interface IRunImage {
  id: string;
  name: string;
  file: IFile;
}

export interface IRun {
  id?: string;
  runners: IMember[];
  hosts: IMember[];
  comments: IMember[];
  estimate: string;
  game: string;
  category: string;
  platform: string;
  year?: string;
  images: IRunImage[];
  seoTitle?: string;
  seoGame?: string;

  [key: string]: any;
}
