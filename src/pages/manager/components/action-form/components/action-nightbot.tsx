import { IFileTagActionModule } from "@/domain";
import { Button, FormGroup, Switch } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface IActionNightbot {
  action: IFileTagActionModule;
}

const ActionNightbot = ({ action }: IActionNightbot) => {
  const { register } = useFormContext();
  const [isDisabled, setIsDisabled] = useState(!action?.isEnabled ?? false);

  const handleChangeSwitch = (_: React.ChangeEvent, value: boolean) => {
    setIsDisabled(!value);
  };

  const handleSubmit = (data: React.FormEvent) => {
    console.log("data", data);
  };

  return (
    <>
      <FormGroup onSubmit={handleSubmit}>
        <Switch checked={!isDisabled} onChange={handleChangeSwitch} />
        {isDisabled ? "disabled" : "enabled"}
        <Button type="submit">Enviar</Button>
      </FormGroup>
    </>
  );
};

export { ActionNightbot };
