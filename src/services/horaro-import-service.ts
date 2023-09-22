import { environment } from "@/application";
import axios, { AxiosInstance } from "axios";

const REGEX = {
  HORARO_URL_EVENT_AND_PATH:
    /https:\/\/horaro.org\/(?<eventSlug>.+)(\/(?<scheduleSlug>[\w\d-_\.]+))\/?/,
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

class HoraroImportService {
  private httpClient: AxiosInstance;
  private eventSlug: string;
  private scheduleSlug: string;

  constructor(horaroLink: string) {
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

    this.httpClient = axios.create({
      baseURL: "https://horaro.org/-/api/v1",
    });
  }

  private getEvent() {
    return this.httpClient!.get(`/events/${this.eventSlug}`);
  }

  private async getScheduleBySlug(
    eventId: string,
    scheduleSlug: string
  ): Promise<IHoraroEventDataResponse | null> {
    const schedulesRequest = await this.httpClient.get(
      `/events/${eventId}/schedules`
    );

    if (schedulesRequest.status !== 200) {
      return null;
    }

    const { data } = schedulesRequest.data;

    const schedule = data.find(
      (schedule: any) => schedule.slug === scheduleSlug
    );

    return schedule;
  }

  async getSchedule(): Promise<IHoraroEventDataResponse | null> {
    // if (environment.isDevelop) {
    //   return Promise.resolve(testMockData);
    // }

    const event = await this.getEvent();
    if (!event) {
      return null;
    }

    if (event.status !== 200) {
      return null;
    }

    const { data } = event.data;

    const schedule = await this.getScheduleBySlug(data.id, this.scheduleSlug);
    return schedule;
  }
}

export { HoraroImportService };
