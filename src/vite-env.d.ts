/// <reference types="vite/client" />

import { ObsWebsocketService } from "./services/obs-service";

export {};

declare global {
  interface Window {
    obsService: ObsWebsocketService | null;
  }
}
