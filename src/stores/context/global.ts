import { createContext } from "react";

export interface IGlobalContext {
  obsIsReady: boolean;
}

export const GlobalContext = createContext<IGlobalContext>({
  obsIsReady: false,
});
