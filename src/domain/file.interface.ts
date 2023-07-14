export interface IFile {
  type: string;
  path: string;
  lastModified: number;
  removed?: boolean;
}

export interface ITagActive {
  tagId: string;
  runId: string;
}
