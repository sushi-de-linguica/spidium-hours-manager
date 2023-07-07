import {
  EFileTagNightbotModule,
  IFileTag,
  IFileTagActionModule,
} from "@/domain";

import {
  Button,
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

import DeleteIcon from "@mui/icons-material/Delete";
interface IActionNightbot {
  action: IFileTagActionModule<EFileTagNightbotModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

const ActionNightbot = ({ action, index, fieldArray }: IActionNightbot) => {
  const [template, setTemplate] = useState(action.module.template ?? "");

  const handleChangeSwitch = (_: React.ChangeEvent, value: boolean) => {
    action.isEnabled = value;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (_: React.ChangeEvent, value: string) => {
    action.module.configurationCommandField = value;
    fieldArray.update(index, action);
  };

  const handleBlurTemplate = () => {
    action.module.template = template;
    fieldArray.update(index, action);
  };

  const handleChangeTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate(event.target.value);
  };

  const handleRemove = () => {
    fieldArray.remove(index);
  };

  return (
    <FormGroup>
      <Divider textAlign="right">
        Comando
        <Button
          variant="contained"
          color="error"
          onClick={handleRemove}
          size="small"
          style={{ marginLeft: "12px" }}
        >
          <DeleteIcon />
        </Button>
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
              value={action.module.configurationCommandField}
              onChange={handleChangeRadioButton}
            >
              <FormControlLabel
                value="nightbot_runner_command_id"
                control={<Radio />}
                label="Runner"
              />
              <FormControlLabel
                value="nightbot_host_command"
                control={<Radio />}
                label="Host"
              />
              <FormControlLabel
                value="nightbot_commentator_command"
                control={<Radio />}
                label="Comentários"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid xs={12} item>
          <TextField
            margin="dense"
            label="Template"
            value={template}
            onChange={handleChangeTemplate}
            onBlur={handleBlurTemplate}
            fullWidth
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

export { ActionNightbot };
