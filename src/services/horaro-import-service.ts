import { environment } from "@/application";
import axios, { AxiosInstance } from "axios";

export const REGEX = {
  HORARO_URL_EVENT_AND_PATH:
    /https:\/\/horaro.(org|net)\/(?<eventSlug>.+)(\/(?<scheduleSlug>[\w\d-_\.]+))\/?/,
};

interface IHoraroEventItem {
  length: string;
  data: string[];
}
export interface IHoraroEventDataResponse {
  id: string;
  name: string;
  columns: string[];
  items: IHoraroEventItem[];
}

export interface IHoraroScheduleJsonResponse {
  meta: Record<string, any>;
  schedule: IHoraroEventDataResponse;
}

class HoraroImportService {
  private httpClient: AxiosInstance;
  private eventSlug: string;
  private scheduleSlug: string;
  private hiddenKey?: string;

  constructor(horaroLink: string, hiddenKey?: string) {
    const result = REGEX.HORARO_URL_EVENT_AND_PATH.exec(horaroLink);

    if (!result) {
      throw new Error("invalid regex execution");
    }

    const { eventSlug, scheduleSlug } = result.groups as any;

    if (!eventSlug || !scheduleSlug) {
      throw new Error("dont have correctly props");
    }

    this.eventSlug = eventSlug;
    this.scheduleSlug = scheduleSlug;
    this.hiddenKey = hiddenKey?.trim() || undefined;

    this.httpClient = axios.create({
      baseURL: "https://horaro.net",
    });
  }

  private getEvent() {
    return this.httpClient!.get(`/-/api/v1/events/${this.eventSlug}`);
  }

  private async getScheduleBySlug(
    eventId: string,
    scheduleSlug: string,
  ): Promise<IHoraroEventDataResponse | null> {
    const url = this.hiddenKey
      ? `/-/api/events/${eventId}/schedules/${scheduleSlug}?hiddenkey=${encodeURIComponent(this.hiddenKey)}`
      : `/-/api/events/${eventId}/schedules`;

    const schedulesRequest = await this.httpClient.get(url);

    if (schedulesRequest.status !== 200) {
      return null;
    }

    const { data } = schedulesRequest.data;

    if (this.hiddenKey && !Array.isArray(data)) {
      return data as IHoraroEventDataResponse;
    }

    const schedule = (Array.isArray(data) ? data : []).find(
      (s: any) => s.slug === scheduleSlug,
    );

    return schedule ?? null;
  }

  async getSchedule(): Promise<IHoraroEventDataResponse | null> {
    if (this.hiddenKey) {
      return this.getScheduleBySlug(this.eventSlug, this.scheduleSlug);
    }

    const event = await this.getEvent();
    if (!event) {
      return null;
    }

    if (event.status !== 200) {
      return null;
    }

    const { data } = event.data;
    return this.getScheduleBySlug(data.id, this.scheduleSlug);
  }

  async getScheduleJson(): Promise<IHoraroEventDataResponse | null> {
    let url = `/${this.eventSlug}/${this.scheduleSlug}.json`;
    if (this.hiddenKey) {
      url += `?hiddenkey=${encodeURIComponent(this.hiddenKey)}`;
    }

    try {
      const response =
        await this.httpClient.get<IHoraroScheduleJsonResponse>(url);

      return response.data.schedule;
    } catch (error) {
      console.error("Error importing from Horaro:", error);
      return null;
    }
  }
}

export { HoraroImportService };
