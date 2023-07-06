import { IFileTagActionModule } from "@/domain";

interface IActionObs {
  action: IFileTagActionModule;
}

const ActionObs = ({ action }: IActionObs) => {
  return <>Action OBS</>;
};

export { ActionObs };
