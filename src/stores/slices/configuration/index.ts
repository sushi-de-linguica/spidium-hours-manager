import { IConfiguration } from "@/domain";
import { persistMiddleware } from "@/lib/database";
import { create } from "zustand";

export interface IConfigurationStore {
  state: IConfiguration;
  appendConfiguration: (configuration: Partial<IConfiguration>) => void;
  updateConfiguration: (configuration: IConfiguration) => void;
  updateConfigurationField: (field: keyof IConfiguration, value: any) => void;
  reset: () => void;
}

const DEFAULT_STATE: IConfiguration = {
  path_assets: "",
  nightbot_client_id: "",
  nightbot_client_secret: "",
  nightbot_redirect_uri: "https://usina.spidium.live",
  nightbot_token: "",
  nightbot_runner_command_id: null,
  nightbot_runner_text_singular: "",
  nightbot_runner_text_plural: "",
  nightbot_host_command: null,
  nightbot_host_text_singular: "",
  nightbot_host_text_plural: "",
  nightbot_commentator_command: null,
  nightbot_commentator_text_singular: "",
  nightbot_commentator_text_plural: "",
  obs_ws_address: "127.0.0.1:4455",
  obs_ws_password: "",
  seo_title_template:
    "NOME DO EVENTO - {game} [{category}] por <loop property='runners' separator=', ' prefix='@,'>{runners[primaryTwitch,name]}</loop>",
  twitch_client_id: "",
  twitch_redirect_uri: "https://usina.spidium.live",
  twitch_token: "",
  runs_row_height: 100,
};

export { DEFAULT_STATE as CONFIGURATION_DEFAULT_STATE };

const useConfigurationStore = create<IConfigurationStore, any>(
  persistMiddleware("CONFIGURATION_STORE", (set) => ({
    state: {
      ...DEFAULT_STATE,
    },
    appendConfiguration: (configuration: Partial<IConfiguration>) =>
      set((state) => {
        state.state = {
          ...state.state,
          ...configuration,
        };

        return state;
      }),
    updateConfiguration: (configuration: IConfiguration) =>
      set((state) => {
        state.state = {
          ...configuration,
        };

        return {
          ...state,
        };
      }),
    updateConfigurationField: (field: keyof IConfiguration, value: any) =>
      set((state: any) => {
        state.state[field] = value;

        return state;
      }),
    reset: () =>
      set(() => ({
        state: {
          ...DEFAULT_STATE,
        },
      })),
    setState: (state: IConfiguration) => {
      set(() => ({
        state,
      }));
    },
  }))
);

export { useConfigurationStore };
