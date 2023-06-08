export interface IFile {
  type: string;
  path: string;
  lastModified: number;
  removed?: boolean;
}
