import { IFileTagActionModule } from "@/domain";

interface IActionTwitch {
  action: IFileTagActionModule;
}

const ActionTwitch = ({ action }: IActionTwitch) => {
  return <>Action Twitch</>;
};

export { ActionTwitch };
