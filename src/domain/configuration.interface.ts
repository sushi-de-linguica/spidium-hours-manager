import { INightbotCommandModel } from "./extensions";

export interface IConfiguration {
  path_assets: string;
  nightbot_client_id: string;
  nightbot_client_secret: string;
  nightbot_redirect_uri: string;
  nightbot_token: string;
  nightbot_runner_command_id: INightbotCommandModel | null;
  nightbot_runner_text_singular: string;
  nightbot_runner_text_plural: string;
  nightbot_host_command: INightbotCommandModel | null;
  nightbot_host_text_singular: string;
  nightbot_host_text_plural: string;
  nightbot_commentator_command: INightbotCommandModel | null;
  nightbot_commentator_text_singular: string;
  nightbot_commentator_text_plural: string;
  obs_ws_address: string;
  obs_ws_password: string;
  obs_browser_cam_input_name: string;
  obs_browser_game_input_name: string;
  seo_title_template: string;
  twitch_client_id: string;
  twitch_redirect_uri: string;
  twitch_token: string;
  runs_row_height: number;
}
