import { IRun } from "@/domain";
import { randomUUID } from "crypto";

const exportRunsToDatagridRows = (runs: IRun[]) => {
  return runs.map((run) => {
    return {
      ...run,
      id: run.id ?? randomUUID(),
      all_runners: run.runners.map((runner) => runner.name).join(", "),
      all_hosts: run.hosts.map((hosts) => hosts.name).join(", "),
      all_comments: run.comments
        .map((commentator) => commentator.name)
        .join(", "),
    };
  });
};

export { exportRunsToDatagridRows };
