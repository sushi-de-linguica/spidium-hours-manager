import { IExportFileRun } from "@/domain";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { randomUUID } from "crypto";

export interface IFileStore {
  state: {
    files: IExportFileRun[];
  };
  addFile: (file: IExportFileRun) => void;
  updateFile: (file: IExportFileRun) => void;
  removeFile: (file: IExportFileRun) => void;
  setState: (files: IExportFileRun[]) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  files: [],
};

const useFileStore = create<IFileStore, any>(
  persist(
    (set) => ({
      state: {
        ...DEFAULT_STATE,
      },
      addFile: (file: IExportFileRun) => {
        set((state) => {
          if (!file.id) {
            file.id = randomUUID();
          }

          return {
            ...state,
            state: {
              ...state.state,
              files: [...state.state.files, file],
            },
          };
        });
      },
      updateFile: (file: IExportFileRun) => {
        set((state) => {
          const newState = { ...state };

          const fileIndex = newState.state.files.findIndex(
            ({ id }) => id === file.id
          );

          if (fileIndex === null || fileIndex === undefined) {
            return state;
          }

          newState.state.files[fileIndex] = file;
          newState.state.files = [...newState.state.files];

          return { ...newState };
        });
      },
      removeFile: (file: IExportFileRun) => {
        set((state) => {
          const newState = { ...state };

          newState.state.files = [
            ...state.state.files.filter(({ id }) => id !== file.id),
          ];

          return newState;
        });
      },
      setState: (files: IExportFileRun[]) =>
        set(() => ({
          state: {
            files,
          },
        })),
      reset: () =>
        set(() => ({
          state: {
            ...DEFAULT_STATE,
          },
        })),
    }),
    {
      name: "SPIDIUM_FILE_STORE",
    }
  )
);

export { useFileStore };
