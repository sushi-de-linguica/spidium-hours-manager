export interface IFile {
  type: string;
  path: string;
  lastModified: number;
  removed?: boolean;
  base64?: string;
}

export interface ITagActive {
  tagId: string;
  runId: string;
}
