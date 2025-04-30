import { IExportFileRun, IFileTag, ITagActive } from "@/domain";
import { create } from "zustand";
import { randomUUID } from "crypto";
import { persistMiddleware } from "@/lib/database";

interface IFileStoreState {
  files: IExportFileRun[];
  tags: IFileTag[];
  activated: ITagActive[];
}

export interface IFileStore {
  state: IFileStoreState;
  setActiveTag: (tagId: string, runId: string) => void;
  getActiveTagById: (tagId: string) => ITagActive | null;
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
  activated: [],
};

const useFileStore = create<IFileStore, any>(
  persistMiddleware("FILE_STORE", (set) => ({
    state: {
      ...DEFAULT_STATE,
    },
    setActiveTag: (tagId: string, runId: string) => {
      set((store) => {
        let filtered = [];
        if (
          store.state.activated === undefined ||
          store.state.activated === null
        ) {
          store.state.activated = [];
          filtered.push({ runId, tagId });
        } else {
          filtered = store.state.activated.filter(
            (activated) => activated.tagId !== tagId
          );

          filtered.push({ runId, tagId });
        }

        return {
          ...store,
          state: {
            ...store.state,
            activated: [...filtered],
          },
        };
      });
    },
    getActiveTagById: (tagId: string) => {
      let result = null;
      set((store) => {
        if (!store.state.activated) {
          store.state.activated = [];
        }

        result = store.state.activated.find(
          (activated) => activated.tagId === tagId
        );

        return store;
      });

      return result;
    },
    addTag: (tag: IFileTag) => {
      if (!tag.id) {
        tag.id = randomUUID();
      }

      if (!tag.minimumRunnersToShow) {
        tag.minimumRunnersToShow = 0;
      }

      if (typeof tag.minimumRunnersToShow === "string") {
        try {
          const parsedValue = parseInt(tag.minimumRunnersToShow);
          if (parsedValue >= 0) {
            tag.minimumRunnersToShow = parsedValue;
          } else {
            tag.minimumRunnersToShow = 0;
          }
        } catch (err) {
          console.error("error", err);
          tag.minimumRunnersToShow = 0;
        }
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
          ...state.state.tags.filter((currentTag) => currentTag.id !== tag.id),
        ];

        return newState;
      });
    },
    updateTag: (tag: IFileTag) => {
      set((store) => {
        const newState = { ...store };

        const tagIndex = store.state.tags.findIndex(({ id }) => id === tag.id);

        if (tagIndex === null || tagIndex === undefined) {
          return store;
        }

        // store.state.tags = store.state.tags.filter(({ id }) => id !== tag.id);
        // store.state.tags.push(tag);

        const newTags = [...store.state.tags];
        newTags[tagIndex] = tag;

        newState.state.tags = newTags;
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
  }))
);

export { useFileStore };
