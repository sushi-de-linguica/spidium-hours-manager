import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { createWriteStream, readdirSync } from "node:fs";
import { PNG } from "pngjs";
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  copyFileSync,
} from "node:fs";
import { update } from "./update";

import { IObsWebSocket } from "../websocket/interfaces";
import { ObsWebSocketV4 } from "../websocket/obs-websocket";
import { ObsWebSocketV5 } from "../websocket/obs-websocket-5";

import { EIpcEvents, EProtocolEvents, EWsEvents } from "../../src/domain/enums";
import { IFile } from "@/domain";

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");
import packageJson from "../../package.json";

app.setAsDefaultProtocolClient("shm");

const filePatterns = ["runner-", "host-", "commentator-", "game"];
const OBS_4_EVENTS = [
  "AuthenticationSuccess",
  "AuthenticationFailure",
  "ConnectionClosed",
  "Exiting",
  "ConnectionOpened",
];
const OBS_5_EVENTS = ["Identified", "ConnectionClosed", "ConnectionError"];
const DEFAULT_EXTENSION = "jpeg";

interface IFileSaveProps {
  file: IFile;
  uuid: string;
  path: string;
}

let websocket: any = null;
let database: any = null;

async function createWindow() {
  win = new BrowserWindow({
    title: `Spidium Hours Manager - SHM v${packageJson.version}`,
    icon: join(process.env.PUBLIC, "icon-144x144.png"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(win);
}

const initElectron = () => {
  console.log("Starting electron main...");

  ipcMain.handle(EIpcEvents.DATABASE_INIT, () => {
    return database;
  });

  app.whenReady().then(createWindow);

  ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      childWindow.loadURL(`${url}#${arg}`);
    } else {
      childWindow.loadFile(indexHtml, { hash: arg });
    }
    ipcMain.emit(EWsEvents.NEW_OBS);
  });
};

const startAppEvents = (app: Electron.App) => {
  app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
  });

  app.on("second-instance", (event, argv) => {
    if (win) {
      const shmProtocol = argv.find((arg) => arg.startsWith("shm://"));
      if (shmProtocol) {
        win.webContents.send(EProtocolEvents.SHM_PROTOCOL_DATA, shmProtocol);
      }

      if (win.isMinimized())
        // Focus on the main window if the user tried to open another
        win.restore();
      win.focus();
    }
  });

  app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      allWindows[0].focus();
    } else {
      createWindow();
    }
  });
};

const handleApplyEventListeners = (
  win: BrowserWindow,
  websocket: IObsWebSocket,
  events: string[]
) => {
  events.forEach((eventName) => {
    websocket?.obs.on(eventName, () => {
      console.log(`Bind listener event: ${eventName}`);
      win?.webContents.send(eventName);
    });
  });
};

const handleAssetsDirectory = (path: string) => {
  console.log("ASSETS_DIRECTORY:", path);
  if (!existsSync(path)) {
    mkdirSync(path);
  }
};

const getGameImagemByUUID = (uuid: string) => {
  return `${uuid}.${DEFAULT_EXTENSION}`;
};

function findFilesWithPattern(folderPath: string, filePattern: string) {
  const files = readdirSync(folderPath);

  const matchingFiles = files.filter((file) => {
    return (
      file.endsWith(`.${DEFAULT_EXTENSION}`) && file.startsWith(filePattern)
    );
  });

  return matchingFiles;
}

const startCustomEvents = () => {
  ipcMain.on(EWsEvents.NEW_OBS, (event, { version }) => {
    if (!version) {
      console.log("Trying new obs but dont has version");
      return;
    }

    if (!!websocket) {
      websocket?.disconnect();
      websocket.obs?.removeAllListeners();
      websocket = null as any;
    }

    switch (version) {
      case 4:
        websocket = new ObsWebSocketV4();
        handleApplyEventListeners(win!, websocket, OBS_4_EVENTS);
        break;

      case 5:
        websocket = new ObsWebSocketV5();
        handleApplyEventListeners(win!, websocket, OBS_5_EVENTS);
        break;
    }
  });

  ipcMain.on(EWsEvents.SEND_BATCH_EVENT_OBS, (event, args: any) => {
    websocket?.sendBatch(args);
  });

  ipcMain.handle(EWsEvents.CONNECT_OBS, async (event, args) => {
    try {
      console.info("[obs] connecting...");
      await websocket?.connect(args);
      return true;
    } catch (error) {
      console.log("[obs] Connection error", error);
      throw error;
    }
  });

  ipcMain.on(EWsEvents.DISCONNECT_OBS, () => {
    websocket?.disconnect();
  });

  ipcMain.handle(
    EIpcEvents.FILE_SAVE,
    (event, { file, uuid, path }: IFileSaveProps) => {
      handleAssetsDirectory(path);

      const fileNameToSave = getGameImagemByUUID(uuid);
      const filePathToSave = `${path}\\${fileNameToSave}`;
      const currentFilePath = file.path;

      try {
        writeFileSync(filePathToSave, readFileSync(currentFilePath));
        return filePathToSave;
      } catch (error) {
        console.error("FILE SAVE ERROR:", error);
        return null;
      }
    }
  );

  ipcMain.handle(EIpcEvents.FILE_REMOVE, (event, { uuid, path_assets }) => {
    try {
      const fileName = getGameImagemByUUID(uuid);
      const filePathToRemove = `${path_assets}\\${fileName}`;
      unlinkSync(filePathToRemove);
    } catch (error) {
      console.error("ERROR AT REMOVE FILE: ", error);
    }
  });

  ipcMain.handle(
    EIpcEvents.COPY_FILE,
    (event, { uuid, path, path_assets, fileName }) => {
      const fileNameWithExtension = getGameImagemByUUID(uuid);
      const filePathToSave = `${path_assets}\\${fileNameWithExtension}`;

      if (existsSync(filePathToSave)) {
        const newFilePath = `${path}\\${fileName}.${DEFAULT_EXTENSION}`;
        copyFileSync(filePathToSave, newFilePath);
      }
    }
  );

  ipcMain.handle(EIpcEvents.RESET_IMAGES, (event, { path }) => {
    filePatterns.forEach((pattern) => {
      const matchingFiles = findFilesWithPattern(path, pattern);

      console.log(`Arquivos correspondentes a "${pattern}":`);
      matchingFiles.forEach((file: any) => {
        const newFilePath = `${path}\\${file}`;
        const png = new PNG({ width: 1, height: 1 });

        png.data[0] = 0;
        png.data[1] = 0;
        png.data[2] = 0;
        png.data[3] = 0;

        png.pack().pipe(createWriteStream(newFilePath));
      });

      console.log("\n");
    });
  });

  ipcMain.handle(EIpcEvents.GET_ASSETS_PATH, () => {
    return path_assets;
  });
};

initElectron();
startAppEvents(app);
startCustomEvents();
