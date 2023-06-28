import { IConfiguration } from "@/domain";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IConfigurationStore {
  state: IConfiguration;
  updateConfiguration: (configuration: IConfiguration) => void;
  updateConfigurationField: (field: keyof IConfiguration, value: any) => void;
  updateLastRunId: (runId: string) => void;
  updateLastSetupId: (runId: string) => void;
  updateLastTitleId: (runId: string) => void;
  reset: () => void;
}

const DEFAULT_STATE: IConfiguration = {
  path_run: "",
  path_setup: "",
  path_assets: "",
  last_selected_run_id: "",
  last_selected_setup_id: "",
  last_selected_title_id: "",
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
  obs_browser_cam_input_name: "",
  obs_browser_game_input_name: "",
  seo_title_template:
    "NOME DO EVENTO - {game} [{category}] por <loop property='runners' separator=', '>@{runners[primaryTwitch]}</loop>",
  twitch_client_id: "",
  twitch_redirect_uri: "https://usina.spidium.live",
  twitch_token: "",
};

export { DEFAULT_STATE as CONFIGURATION_DEFAULT_STATE };

const useConfigurationStore = create<IConfigurationStore, any>(
  persist(
    (set) => ({
      state: {
        ...DEFAULT_STATE,
      },
      updateConfiguration: (configuration: IConfiguration) =>
        set((state) => {
          state.state = {
            ...configuration,
          };

          return state;
        }),
      updateConfigurationField: (field: keyof IConfiguration, value: any) =>
        set((state) => {
          state.state[field] = value;

          return state;
        }),
      updateLastRunId: (id: string) =>
        set((state) => ({
          ...state,
          state: {
            ...state.state,
            last_selected_run_id: id,
          },
        })),
      updateLastSetupId: (id: string) =>
        set((state) => ({
          ...state,
          state: {
            ...state.state,
            last_selected_setup_id: id,
          },
        })),
      updateLastTitleId: (id: string) =>
        set((state) => ({
          ...state,
          state: {
            ...state.state,
            last_selected_title_id: id,
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
      name: "SPIDIUM_CONFIGURATION_STORE",
    }
  )
);

export { useConfigurationStore };
