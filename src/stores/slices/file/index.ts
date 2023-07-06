import { IExportFileRun, IFileTag } from "@/domain";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { randomUUID } from "crypto";

interface IFileStoreState {
  files: IExportFileRun[];
  tags: IFileTag[];
}

export interface IFileStore {
  state: IFileStoreState;
  addTag: (tag: IFileTag) => void;
  updateTag: (tag: IFileTag) => void;
  removeTag: (tag: IFileTag) => void;
  addFile: (file: IExportFileRun) => void;
  updateFile: (file: IExportFileRun) => void;
  removeFile: (file: IExportFileRun) => void;
  setState: (newState: Partial<IFileStoreState>) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  files: [],
  tags: [],
};

const useFileStore = create<IFileStore, any>(
  persist(
    (set) => ({
      state: {
        ...DEFAULT_STATE,
      },
      addTag: (tag: IFileTag) => {
        if (!tag.id) {
          tag.id = randomUUID();
        }

        set((store) => {
          return {
            ...store,
            state: {
              ...store.state,
              tags: [...store.state.tags, tag],
            },
          };
        });
      },
      removeTag: (tag: IFileTag) => {
        set((state) => {
          const newState = { ...state };

          newState.state.tags = [
            ...state.state.tags.filter(
              (currentTag) => currentTag.id !== tag.id
            ),
          ];

          return newState;
        });
      },
      updateTag: (tag: IFileTag) => {
        set((store) => {
          const newState = { ...store };

          const tagIndex = store.state.tags.findIndex(
            ({ id }) => id === tag.id
          );

          if (tagIndex === null || tagIndex === undefined) {
            return store;
          }

          store.state.tags = store.state.tags.filter(({ id }) => id !== tag.id);
          store.state.tags.push(tag);

          newState.state = { ...store.state };

          return { ...newState };
        });
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
      setState: (newState: Partial<IFileStoreState>) =>
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            ...newState,
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
