import { IRun } from "./run.interface";

export interface IEvent {
  id?: string;
  name?: string;
  runs: IRun[];
  created_at: Date;
  updated_at?: Date | null;
  deleted_at: Date | null;
}
