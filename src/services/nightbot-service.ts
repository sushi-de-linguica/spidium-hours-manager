import {
  INightbotApiCommandListResponse,
  INightbotApiCommandResponse,
  INightbotApiTokenRequest,
  INightbotApiTokenResponse,
  INightbotCommand,
} from "@/domain";
import { useConfigurationStore, useNightbot } from "@/stores";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

const NIGHTBOT_API_URL = "https://api.nightbot.tv/1/";
const NIGHTBOT_OAUTH2_URL = "https://nightbot.tv/oauth2";
const NIGHTBOT_API_OAUTH2_URL = "https://api.nightbot.tv/oauth2";

export const getUrlToGetTokenFromNightbot = ({
  redirect_uri,
  client_id,
}: any) =>
  `${NIGHTBOT_OAUTH2_URL}/authorize?response_type=code&redirect_uri=${redirect_uri}&client_id=${client_id}&state&scope=commands`;

export const parseObjectToUrlEncoded = (obj: Record<any, string>) => {
  return new URLSearchParams(
    Object.entries(obj).map(([key, value]) => [key, value]),
  ).toString();
};

export class NightbotApiService {
  private readonly client: AxiosInstance;

  constructor(baseURL = NIGHTBOT_API_URL) {
    const nightbotStore = useNightbot.getState();
    this.client = axios.create({
      baseURL,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
          const newState = {
            ...nightbotStore.state,
            access_token: "",
          };
          nightbotStore.setState(newState);
        }

        return Promise.reject(error);
      },
    );
  }

  async request<T = unknown>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const configurationStore = useConfigurationStore.getState().state;
    const headers = {
      ...config.headers,
      Authorization: `Bearer ${configurationStore.nightbot_token}`,
    };
    const updatedConfig = { ...config, headers };
    return this.client.request<T>(updatedConfig);
  }

  async getCommands() {
    return this.request<INightbotApiCommandListResponse>({
      url: "/commands",
      method: "GET",
    });
  }

  async testConnection() {
    const nightbotStore = useNightbot.getState();
    try {
      await this.getCommands();
      nightbotStore.setIsConnected(true);
      return true;
    } catch (err) {
      console.error(err);
      nightbotStore.setIsConnected(false);
      return false;
    }
  }

  async updateCustomCommandById(
    commandId: string,
    data: Partial<INightbotCommand>,
  ) {
    return this.request<INightbotApiCommandResponse>({
      method: "PUT",
      url: `/commands/${commandId}`,
      data,
    });
  }

  async getTokenFromCode(data: INightbotApiTokenRequest) {
    console.log("[getTokenFromCode] request:", JSON.stringify(data, null, 2));

    return this.client.request<INightbotApiTokenResponse>({
      method: "POST",
      baseURL: NIGHTBOT_API_OAUTH2_URL,
      url: "/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: parseObjectToUrlEncoded(data as any),
    });
  }
}
