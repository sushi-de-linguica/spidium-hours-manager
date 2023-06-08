import { IMember } from "@/domain";
import { randomUUID } from "crypto";

export const membersToDataGridRows = (members: IMember[]) => {
  return members.map((member) => ({
    id: member.id ?? randomUUID(),
    ...member,
  }));
};
