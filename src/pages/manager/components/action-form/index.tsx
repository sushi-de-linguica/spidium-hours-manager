// src/components/RunForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { randomUUID } from "crypto";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  EFileTagAction,
  EFileTagActionComponentsNightbot,
  EFileTagActionComponentsObs,
  EFileTagActionComponentsTwitch,
  IFileTag,
} from "@/domain";
import { useFileStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { ActionNightbot } from "./components/action-nightbot";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { ActionObs } from "./components/action-obs";
import { ActionTwitch } from "./components/action-twitch";
import { TabPanel } from "../tab-panel";

import Icon from "@mui/icons-material/CheckOutlined";

const defaultData: IFileTag = {
  id: "",
  actions: [],
  label: "",
  description: "",
  path: "",
  variant: "outlined",
  color: "primary",
  minimumRunnersToShow: 0,
  isShow: true,
};

interface IRunFormProps {
  showEditMode: boolean;
  action: IFileTag | null;
  onClose?: () => void;
}

const ActionForm = ({ showEditMode, action, onClose }: IRunFormProps) => {
  const [open, setOpen] = useState(false);
  const { addTag, updateTag } = useFileStore();

  const [selectedTab, setSelectedTab] = useState(0);

  const handleChangeSelectTab = (_: any, newValue: number) => {
    setSelectedTab(newValue);
  };

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
    setSelectedTab(0);
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
            resourceName: "",
          },
        });
        break;
      case action === EFileTagAction.TWITCH:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.TWITCH,
            component: EFileTagActionComponentsTwitch.UPDATE_TITLE,
            value: "",
          },
        });
        break;
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
                <Tabs value={selectedTab} onChange={handleChangeSelectTab}>
                  <Tab label="Dados" />
                  <Tab label="Estilo do botão" />
                  <Tab label="Ações" />
                </Tabs>

                <TabPanel value={selectedTab} index={0}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Nome do botão"
                    {...formContext.register("label")}
                    fullWidth
                  />

                  <TextField
                    autoFocus
                    margin="dense"
                    label="Descrição (opcional)"
                    {...formContext.register("description")}
                    fullWidth
                  />

                  <TextField
                    autoFocus
                    margin="dense"
                    type="number"
                    helperText={
                      "Exemplo: mostrar apenas para runs com mais de 4 runners"
                    }
                    label="Minimo de runners para mostrar o botão"
                    {...formContext.register("minimumRunnersToShow")}
                    fullWidth
                  />

                  <Controller
                    name="isShow"
                    control={formContext.control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        {...field}
                        checked={field.value}
                        control={<Switch />}
                        onChange={(_, checked) => {
                          formContext.setValue("isShow", checked);
                        }}
                        label="Mostrar botão"
                      />
                    )}
                  />
                </TabPanel>

                <TabPanel value={selectedTab} index={1}>
                  <Box
                    display="flex"
                    flexDirection={"column"}
                    gap="12px"
                    marginTop={"8px"}
                    marginBottom={"12px"}
                  >
                    <FormControl style={{ display: "none" }} fullWidth>
                      <InputLabel id="label-id-variant">Variante</InputLabel>
                      <Controller
                        name="variant"
                        control={formContext.control}
                        render={({ field }) => (
                          <Select
                            labelId="label-id-variant"
                            id="id-variant"
                            label="Variante"
                            margin="dense"
                            fullWidth
                            {...field}
                            onChange={(event) => {
                              field.onChange(event as any);
                            }}
                          >
                            <MenuItem value={"contained"}>preenchido</MenuItem>
                            <MenuItem value={"text"}>texto</MenuItem>
                            <MenuItem value={"outlined"}>
                              texto com borda
                            </MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel id="label-id-color">Cor</InputLabel>
                      <Controller
                        name="color"
                        control={formContext.control}
                        render={({ field }) => (
                          <Select
                            labelId="label-id-color"
                            id="id-color"
                            label="Cor"
                            {...field}
                            onChange={(event) => {
                              field.onChange(event as any);
                            }}
                          >
                            <MenuItem value={"error"}>Vermelho</MenuItem>
                            <MenuItem value={"info"}>Azul claro</MenuItem>
                            <MenuItem value={"primary"}>Azul</MenuItem>
                            <MenuItem value={"secondary"}>Roxo</MenuItem>
                            <MenuItem value={"success"}>Verde</MenuItem>
                            <MenuItem value={"warning"}>Laranja</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Box>

                  <Divider />

                  <Paper elevation={0} style={{ padding: "12px 0" }}>
                    <Typography>Inativo</Typography>
                    <Chip
                      // variant={formContext.watch("variant") as any}
                      variant={"outlined"}
                      size="small"
                      color={formContext.watch("color") as any}
                      label={formContext.watch("label")}
                      onClick={() => {}}
                    />
                  </Paper>
                  <Paper elevation={0}>
                    <Typography>Ativo</Typography>
                    <Chip
                      // variant={formContext.watch("variant") as any}
                      variant={"filled"}
                      size="small"
                      color={formContext.watch("color") as any}
                      label={formContext.watch("label")}
                      onClick={() => {}}
                      icon={<Icon />}
                    />
                  </Paper>
                </TabPanel>

                <TabPanel value={selectedTab} index={2}>
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

                  <Button
                    variant="outlined"
                    onClick={() => handleAddAction(EFileTagAction.TWITCH)}
                  >
                    +1 Ação da Twitch
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
                          key={field.id}
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
                </TabPanel>
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
