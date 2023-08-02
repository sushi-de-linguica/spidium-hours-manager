import {
  IFileTag,
  IFileTagActionModule,
  IFileTagExportFilesModule,
} from "@/domain";
import {
  Alert,
  Chip,
  Divider,
  FormGroup,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";

interface IActionExportFilesProps {
  action: IFileTagActionModule<IFileTagExportFilesModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

const ActionExportFiles = ({
  action,
  index,
  fieldArray,
}: IActionExportFilesProps) => {
  const [value, setValue] = useState(action.module.value ?? "");
  const handleChangeSwitch = (_: React.ChangeEvent, value: boolean) => {
    action.isEnabled = value;
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
          label="Exportar arquivos"
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

        <Grid xs={12} item>
          <TextField
            margin="dense"
            disabled={!action.isEnabled}
            label={"Endereço da pasta destino"}
            value={value}
            error={value === ""}
            helperText={
              value === ""
                ? "Você precisa fornecer um caminho (exemplo: D:\\SPIDIUM) para que os arquivos sejam exportados"
                : ""
            }
            placeholder={"Endereço da pasta destino"}
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            fullWidth
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

export { ActionExportFiles };
