// src/components/RunForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { randomUUID } from "crypto";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import {
  EFileTagAction,
  EFileTagActionComponentsNightbot,
  EFileTagActionComponentsObs,
  IFileTag,
} from "@/domain";
import { useFileStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { ActionNightbot } from "./components/action-nightbot";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ActionObs } from "./components/action-obs";
import { ActionTwitch } from "./components/action-twitch";

const defaultData: IFileTag = {
  id: "",
  actions: [],
  label: "",
  description: "",
  path: "",
};

interface IRunFormProps {
  showEditMode: boolean;
  action: IFileTag | null;
  onClose?: () => void;
}

const ActionForm = ({ showEditMode, action, onClose }: IRunFormProps) => {
  const [open, setOpen] = useState(false);
  const { addTag, updateTag } = useFileStore();

  const formContext = useForm<IFileTag>({
    defaultValues: defaultData,
  });

  const fieldArray = useFieldArray({
    name: "actions",
    control: formContext.control,
  });

  useEffect(() => {
    if (!!action) {
      formContext.reset(action);
      return;
    }
    formContext.reset();
  }, [action]);

  const handleClose = () => {
    if (!!onClose) {
      onClose();
    }
    setOpen(false);
    formContext.reset(defaultData);
  };

  const onSubmit = (data: IFileTag) => {
    if (!data.id) {
      data.id = randomUUID();
    }

    if (showEditMode) {
      updateTag(data);
      handleClose();
      return;
    }

    addTag(data);
    handleClose();
  };

  const handleAddAction = (action: EFileTagAction) => {
    switch (true) {
      case action === EFileTagAction.NIGHTBOT:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.NIGHTBOT,
            component: EFileTagActionComponentsNightbot.UPDATE_COMMAND,
            configurationCommandField: "",
            template: "",
          },
        });
        break;
      case action === EFileTagAction.OBS:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.OBS,
            component: EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
            value: "",
          },
        });
    }
  };

  return (
    <FormProvider {...formContext}>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        <AddIcon /> Adicionar botão de ação
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose} fullWidth>
        <form onSubmit={formContext.handleSubmit(onSubmit)}>
          {(open || showEditMode) && (
            <>
              <DialogTitle>
                {showEditMode
                  ? `Editar botão de ação`
                  : "Adicionar botão de ação"}
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nome do botão"
                  fullWidth
                  {...formContext.register("label")}
                />

                <TextField
                  autoFocus
                  margin="dense"
                  label="Descrição (opcional)"
                  {...formContext.register("description")}
                  fullWidth
                />

                <Button
                  variant="outlined"
                  onClick={() => handleAddAction(EFileTagAction.NIGHTBOT)}
                >
                  +1 Ação do Nightbot
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => handleAddAction(EFileTagAction.OBS)}
                >
                  +1 Ação do OBS
                </Button>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {fieldArray.fields.map((field, index) => (
                      <Paper
                        elevation={2}
                        style={{
                          padding: "16px",
                          marginBottom: "12px",
                        }}
                      >
                        {field.module.action === EFileTagAction.NIGHTBOT && (
                          <ActionNightbot
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                            key={randomUUID()}
                          />
                        )}
                        {field.module.action === EFileTagAction.OBS && (
                          <ActionObs
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                            key={randomUUID()}
                          />
                        )}
                        {field.module.action === EFileTagAction.TWITCH && (
                          <ActionTwitch
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                            key={randomUUID()}
                          />
                        )}
                      </Paper>
                    ))}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button color="success" variant="contained" type="submit">
                  {showEditMode ? "Atualizar" : "Salvar"}
                </Button>
              </DialogActions>
            </>
          )}
        </form>
      </Dialog>
    </FormProvider>
  );
};

export { ActionForm };
