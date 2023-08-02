import {
  EFileTagActionComponentsObs,
  IFileTagObsModule,
  IFileTag,
  IFileTagActionModule,
} from "@/domain";
import {
  FormGroup,
  Divider,
  Grid,
  Switch,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Chip,
} from "@mui/material";
import { UseFieldArrayReturn } from "react-hook-form";
import { useState } from "react";

interface IActionObsProps {
  action: IFileTagActionModule<IFileTagObsModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

const ActionObs = ({ action, index, fieldArray }: IActionObsProps) => {
  const [value, setValue] = useState(action.module.value ?? "");
  const [resourceName, setResourceName] = useState(
    action.module.resourceName ?? ""
  );

  const handleChangeSwitch = (_: React.ChangeEvent, value: boolean) => {
    action.isEnabled = value;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (_: React.ChangeEvent, value: string) => {
    action.module.component =
      value === EFileTagActionComponentsObs.CHANGE_SCENE
        ? EFileTagActionComponentsObs.CHANGE_SCENE
        : EFileTagActionComponentsObs.SET_BROWSER_SOURCE;
    fieldArray.update(index, action);
  };

  const handleBlurValue = () => {
    action.module.value = value;
    fieldArray.update(index, action);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlurResourceName = () => {
    action.module.resourceName = resourceName;
    fieldArray.update(index, action);
  };

  const handleChangeResourceName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setResourceName(event.target.value);
  };

  const handleRemove = () => {
    fieldArray.remove(index);
  };

  return (
    <FormGroup>
      <Divider textAlign="right">
        <Chip
          variant="outlined"
          color="secondary"
          label="OBS"
          onDelete={handleRemove}
        />
      </Divider>
      <Grid container spacing={2}>
        <Grid
          item
          xs={2}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Switch checked={action.isEnabled} onChange={handleChangeSwitch} />
        </Grid>

        <Grid item xs={10}>
          <FormControl
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RadioGroup
              row
              value={action.module.component}
              onChange={handleChangeRadioButton}
            >
              <FormControlLabel
                value={EFileTagActionComponentsObs.SET_BROWSER_SOURCE}
                control={<Radio />}
                disabled={!action.isEnabled}
                label="Atualizar navegador"
              />
              <FormControlLabel
                value={EFileTagActionComponentsObs.CHANGE_SCENE}
                control={<Radio />}
                disabled={!action.isEnabled}
                label="Trocar cena"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid xs={12} item>
          <TextField
            margin="dense"
            disabled={!action.isEnabled}
            label={
              action.module.component ===
              EFileTagActionComponentsObs.SET_BROWSER_SOURCE
                ? "Template da URL do Browser (opcional)"
                : "Nome da cena"
            }
            value={value}
            placeholder={
              action.module.component ===
              EFileTagActionComponentsObs.SET_BROWSER_SOURCE
                ? "Por padrão é usado o multitwitch player"
                : "Digite o nome da cena no OBS"
            }
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            fullWidth
          />
        </Grid>

        {action.module.component ===
          EFileTagActionComponentsObs.SET_BROWSER_SOURCE && (
          <Grid xs={12} item>
            <TextField
              margin="dense"
              disabled={!action.isEnabled}
              label={"Nome do elemento do browser"}
              value={resourceName}
              placeholder={"Nome do elemento do browser"}
              onChange={handleChangeResourceName}
              onBlur={handleBlurResourceName}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </FormGroup>
  );
};

export { ActionObs };
