import { useTwitch } from "@/stores/slices/twitch";
import axios, { AxiosInstance } from "axios";

const DEFAULT_SCOPE =
  "channel:manage:polls+channel:manage:broadcast+channel:manage:predictions";

export const getUrlToGetTokenFromTwitch = ({ client_id, redirect_uri }: any) =>
  `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${DEFAULT_SCOPE}`;

export interface ITwitchChoice {
  title: string;
}

export interface ITwitchCreatePollRequest {
  title: string;
  choices: ITwitchChoice[];
  duration: number;
}

export interface ITwitchCreatePredictionRequest {
  title: string;
  choices: ITwitchChoice[];
  duration: number;
}

export interface ITwitchUpdateChannelRequest {
  title?: string;
  category_id?: string;
  category_name?: string;
  game_id?: string;
}

class TwitchApiService {
  private readonly client: AxiosInstance;
  readonly access_token: string;
  readonly client_id: string;
  broadcaster_id: string;

  constructor(broadcaster_id?: string) {
    const { access_token, client_id } = useTwitch.getState().state;
    this.access_token = access_token;
    this.client_id = client_id;
    this.broadcaster_id = broadcaster_id ?? "";

    this.client = axios.create({
      baseURL: "https://api.twitch.tv/helix",
      headers: {
        "Client-ID": this.client_id,
        Authorization: `Bearer ${this.access_token}`,
      },
    });

    if (!this.broadcaster_id) {
      this.updateBroadcastId();
    }
  }

  async updateBroadcastId() {
    const { data } = await this.getUserData();

    if (data) {
      const twitchState = useTwitch.getState();
      const broadcaster_id = data?.data[0]?.id;
      this.broadcaster_id = broadcaster_id;

      if (broadcaster_id !== twitchState.state.broadcaster_id) {
        twitchState.setBroadcasterId(broadcaster_id);
      }
      return broadcaster_id;
    }

    return null;
  }

  async getUserData() {
    return this.client.get("/users");
  }

  private getRequestDataWithBroadcast(data: any) {
    return {
      broadcaster_id: this.broadcaster_id,
      ...data,
    };
  }

  async updateChannel(data: ITwitchUpdateChannelRequest) {
    return this.client.patch(
      "/channels",
      this.getRequestDataWithBroadcast(data)
    );
  }

  async createPoll(data: ITwitchCreatePollRequest) {
    return this.client.post("/polls", this.getRequestDataWithBroadcast(data));
  }

  async createPredictions(data: ITwitchCreatePredictionRequest) {
    return this.client.post(
      "/predictions",
      this.getRequestDataWithBroadcast(data)
    );
  }

  async getGameByName(name: string) {
    return this.client.get("/games", {
      params: {
        name,
      },
    });
  }

  async updateChannelGameByName(gameName: string) {}
}

export { TwitchApiService };
