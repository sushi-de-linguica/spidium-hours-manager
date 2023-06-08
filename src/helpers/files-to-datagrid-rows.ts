import { IExportFileRun } from "@/domain";
import { randomUUID } from "crypto";

export const filesToDataGridRows = (files: IExportFileRun[]) => {
  return files.map((file) => ({
    ...file,
    id: file?.id ?? randomUUID(),
  }));
};
