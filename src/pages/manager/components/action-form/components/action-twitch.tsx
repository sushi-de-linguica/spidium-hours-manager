import {
  EFileTagActionComponentsTwitch,
  IFileTagTwitchModule,
  IFileTag,
  IFileTagActionModule,
} from "@/domain";
import {
  Alert,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";

interface IActionTwitchProps {
  action: IFileTagActionModule<IFileTagTwitchModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

const ActionTwitch = ({ action, index, fieldArray }: IActionTwitchProps) => {
  const [value, setValue] = useState(action.module.value ?? "");
  const handleChangeSwitch = (_: React.ChangeEvent, value: boolean) => {
    action.isEnabled = value;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (_: React.ChangeEvent, value: string) => {
    action.module.component =
      value === EFileTagActionComponentsTwitch.UPDATE_TITLE
        ? EFileTagActionComponentsTwitch.UPDATE_TITLE
        : EFileTagActionComponentsTwitch.UPDATE_GAME;
    fieldArray.update(index, action);
  };

  const handleBlurValue = () => {
    action.module.value = value;
    fieldArray.update(index, action);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
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
          label="Twitch"
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
                value={EFileTagActionComponentsTwitch.UPDATE_TITLE}
                control={<Radio />}
                disabled={!action.isEnabled}
                label="Titulo"
              />
              <FormControlLabel
                value={EFileTagActionComponentsTwitch.UPDATE_GAME}
                control={<Radio />}
                disabled={!action.isEnabled}
                label="Jogo"
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
              EFileTagActionComponentsTwitch.UPDATE_TITLE
                ? "Template para alteração do titulo"
                : "Template para alteração do jogo"
            }
            value={value}
            placeholder={
              action.module.component ===
              EFileTagActionComponentsTwitch.UPDATE_TITLE
                ? "Template para alteração do titulo"
                : "Template para alteração do jogo"
            }
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            fullWidth
          />
        </Grid>

        {value === "" && (
          <Grid xs={12} item>
            <Alert color="warning">
              Ao deixar em branco, será utilizado o template padrão existente em
              "Extensões / Templates padrões"
            </Alert>
          </Grid>
        )}
      </Grid>
    </FormGroup>
  );
};

export { ActionTwitch };
