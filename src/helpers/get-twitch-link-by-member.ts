import { IMember } from "@/domain";

export const getTwitchLinkByMember = (runner: IMember) => {
  if (!runner.link && !runner.primaryTwitch) {
    return "";
  }

  if (!!runner.link) {
    return runner.link;
  }

  if (!!runner.primaryTwitch) {
    return `twitch.tv/${runner.primaryTwitch}`;
  }

  return "";
};
