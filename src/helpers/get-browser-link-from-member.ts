import { IMember } from "@/domain";

export const getBrowserLinkFromByMember = (member: IMember) => {
  return `https://player.twitch.tv/?channel=${member.streamAt}&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv`;
};
