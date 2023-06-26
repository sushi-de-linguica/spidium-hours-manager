// src/components/RunForm.tsx
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { randomUUID } from "crypto";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { EIpcEvents, IFile, IMember, IRun } from "@/domain";
import { useConfigurationStore, useEventStore, useMemberStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";
import { TabPanel } from "../tab-panel";

import { toast } from "react-toastify";
import { readFileSync, existsSync } from "node:fs";
import { ipcRenderer } from "electron";

const defaultData: IRun = {
  runners: [],
  hosts: [],
  comments: [],
  estimate: "",
  game: "",
  category: "",
  platform: "",
  seoGame: "",
  seoTitle: "",
};

interface IRunFormProps {
  showEditMode: boolean;
  run: IRun | null;
  eventId: string | null;
  onClose?: () => void;
}

const RunForm = ({ showEditMode, run, eventId, onClose }: IRunFormProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [file, setFile] = useState<IFile | null>(null);
  const [unavailableFile, setUnavailableFile] = useState(false);

  const [open, setOpen] = useState(false);
  const { addRun, updateRun } = useEventStore();
  const { path_assets } = useConfigurationStore((store) => store.state);

  const imageBase64: null | string = useMemo(() => {
    if (!file || file?.removed) {
      return null;
    }

    const existFile = existsSync(file.path);

    if (!existFile) {
      setUnavailableFile(true);
      return null;
    }

    const base64String = readFileSync(file.path, "base64");
    return `data:${file.type};base64,${base64String}`;
  }, [file]);

  const { members } = useMemberStore((store) => store.state);

  const [currentRun, setCurrentRun] = useState<IRun>(
    showEditMode && run ? { ...run } : { ...defaultData }
  );

  useEffect(() => {
    if (!!run) {
      setCurrentRun(run);
      if (!!run.imageFile) {
        setFile(run.imageFile);
      }
    }
  }, [run]);

  const handleChangeSelectTab = (event: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentRun((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadFile = (uuid: string): Promise<string | null> => {
    return ipcRenderer.invoke(EIpcEvents.FILE_SAVE, {
      file,
      uuid,
      path: path_assets,
    });
  };

  const handleClose = () => {
    if (!!onClose) {
      onClose();
    }
    setOpen(false);
    setCurrentRun(defaultData);
    setFile(null);
    setSelectedTab(0);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files as FileList;
    if (!file) {
      toast.info("nenhum arquivo foi selecionado");
      return;
    }
    const { path, type, lastModified } = file;

    setFile({
      path,
      type,
      lastModified,
    });
  };

  const handleSubmit = async () => {
    if (!eventId) {
      return;
    }

    const uuid = currentRun.id ?? randomUUID();
    const runToSave: IRun = {
      ...currentRun,
      id: uuid,
    };

    if (file && !file.removed) {
      const hasFileToAttach = file !== null && !runToSave.imageFile;
      const needRenewFileData =
        file !== null &&
        runToSave.imageFile &&
        file.lastModified !== runToSave.imageFile.lastModified;

      if (hasFileToAttach || needRenewFileData) {
        const filePath = await handleUploadFile(uuid);

        if (filePath) {
          runToSave.imageFile = {
            path: filePath,
            type: file.type,
            lastModified: file.lastModified,
          };
        }
      }
    } else if (file && file.removed) {
      runToSave.imageFile = null;
      ipcRenderer.invoke(EIpcEvents.FILE_REMOVE, { uuid, path_assets });
    }

    if (showEditMode) {
      updateRun({
        eventId,
        run: runToSave,
      });
    } else {
      addRun({
        eventId,
        run: runToSave,
      });
    }
    handleClose();
  };

  const handleChangeMultipleSelect = (field: any, values: any[]) => {
    setCurrentRun((prev) => ({ ...prev, [field]: values }));
  };

  return (
    <FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        disabled={eventId === null}
      >
        <AddIcon /> Adicionar RUN
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose} fullWidth>
        {(open || showEditMode) && (
          <>
            <DialogTitle>
              {showEditMode
                ? `Editar RUN - ${currentRun?.game}`
                : "Adicionar RUN"}
            </DialogTitle>
            <DialogContent>
              <Tabs value={selectedTab} onChange={handleChangeSelectTab}>
                <Tab label="Jogo" />
                <Tab label="Membros" />
                <Tab label="Templates" />
              </Tabs>

              <TabPanel value={selectedTab} index={0}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="game"
                  label="Jogo"
                  value={currentRun.game}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  name="category"
                  label="Categoria"
                  value={currentRun.category}
                  onChange={handleChange}
                  fullWidth
                />
                <Grid container columnGap={1}>
                  <TextField
                    margin="dense"
                    name="platform"
                    label="Plataforma (PC,SNES,GBA, etc...)"
                    value={currentRun.platform}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    name="estimate"
                    label="Estimativa de tempo (HH:MM:SS)"
                    value={currentRun.estimate}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid
                  padding="8px 0"
                  style={{
                    minHeight: "240px",
                  }}
                >
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    multiple={false}
                    style={{
                      marginBottom: "12px",
                    }}
                    accept="image/jpeg,image/jpg,image/gif,image/png"
                  />
                  <br />
                  {!imageBase64 && file && file.removed && (
                    <Alert severity="info">
                      Você precisa salvar\atualizar para que seja removida a
                      imagem!
                    </Alert>
                  )}
                  <br />

                  {imageBase64 && (
                    <>
                      <img src={imageBase64} width={"auto"} height={200} />
                      <br />

                      <Button
                        onClick={() => {
                          if (!!file) {
                            setFile({ ...file, removed: true });
                          }
                        }}
                      >
                        Remover arquivo
                      </Button>
                    </>
                  )}
                  <br />
                  {!imageBase64 && unavailableFile && file && !file.removed && (
                    <>
                      <Button
                        onClick={() => {
                          if (!!file) {
                            setFile({ ...file, removed: true });
                          }
                        }}
                      >
                        Remover arquivo
                      </Button>
                    </>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                <Grid display="flex" flexDirection={"column"} gap="12px">
                  <Autocomplete
                    multiple
                    fullWidth
                    options={members as IMember[]}
                    onChange={(_, values) =>
                      handleChangeMultipleSelect("runners", values)
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={currentRun?.runners}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoFocus
                        variant="filled"
                        name="runners"
                        label="Runner(s)"
                        placeholder="Runner(s)"
                      />
                    )}
                  />

                  <Autocomplete
                    multiple
                    fullWidth
                    options={members as IMember[]}
                    onChange={(_, values) =>
                      handleChangeMultipleSelect("hosts", values)
                    }
                    value={currentRun?.hosts}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        name="hosts"
                        label="Host(s)"
                        placeholder="Host(s)"
                      />
                    )}
                  />
                  <Autocomplete
                    multiple
                    fullWidth
                    options={members as IMember[]}
                    value={currentRun?.comments}
                    onChange={(_, values) =>
                      handleChangeMultipleSelect("comments", values)
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        name="comments"
                        label="Comentarista(s)"
                        placeholder="Comentarista(s)"
                      />
                    )}
                  />
                </Grid>
              </TabPanel>

              <TabPanel value={selectedTab} index={2}>
                <Grid display="flex" flexDirection="column">
                  <TextField
                    autoFocus
                    margin="dense"
                    name="seoTitle"
                    label="Titulo para Live nesta RUN"
                    value={currentRun.seoTitle}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    margin="dense"
                    name="seoGame"
                    label="Game para Live nesta RUN"
                    value={currentRun.seoGame}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit}>
                {showEditMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </FormControl>
  );
};

export default RunForm;
