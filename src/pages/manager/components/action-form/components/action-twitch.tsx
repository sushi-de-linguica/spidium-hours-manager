import { EFileTagObsModule, IFileTag, IFileTagActionModule } from "@/domain";
import { UseFieldArrayReturn } from "react-hook-form";

interface IActionTwitchProps {
  action: IFileTagActionModule<EFileTagObsModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

const ActionTwitch = ({ action, index, fieldArray }: IActionTwitchProps) => {
  return <>Action Twitch</>;
};

export { ActionTwitch };
