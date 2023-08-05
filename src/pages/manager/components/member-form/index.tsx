// src/components/ExportFileForm.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { EIpcEvents, IFile, IMember } from "@/domain";
import { useConfigurationStore, useMemberStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";
import { readFileSync, existsSync } from "node:fs";

import { memberFormTestId } from "./options";
import { ipcRenderer } from "electron";
import { toast } from "react-toastify";

export const defaultMemberData: IMember = {
  gender: "",
  name: "",
  primaryTwitch: "",
  secondaryTwitch: "",
  streamAt: "",
  link: "",
};

interface IMemberFormProps {
  showEditMode: boolean;
  member: IMember | null;
  onClose?: () => void;
}

const MemberForm = ({ showEditMode, member, onClose }: IMemberFormProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<IFile | null>(null);
  const [unavailableFile, setUnavailableFile] = useState(false);
  const [streamAtOption, setStreamAtOptions] = useState<string[]>([]);

  const { addMember, updateMember } = useMemberStore((store) => store);
  const { path_assets } = useConfigurationStore((store) => store.state);

  const [currentMember, setCurrentMember] = useState<IMember>(
    showEditMode && member ? { ...member } : { ...defaultMemberData }
  );

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

  const handleUploadFile = (uuid: string): Promise<string | null> => {
    return ipcRenderer.invoke(EIpcEvents.FILE_SAVE, {
      file,
      uuid,
      path: path_assets,
    });
  };

  useEffect(() => {
    handleMapTwitchOptions();
  }, [currentMember]);

  useEffect(() => {
    if (!!member) {
      setCurrentMember(member);
      if (!!member.imageFile) {
        setFile(member.imageFile);
      }
    }
  }, [member]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeStreamAt = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setCurrentMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapTwitchOptions = () => {
    const newValues: string[] = [
      currentMember.primaryTwitch as string,
      currentMember.secondaryTwitch as string,
    ];

    setStreamAtOptions([...newValues]);
  };

  const handleClose = () => {
    if (!!onClose) {
      onClose();
    }
    setOpen(false);
    setFile(null);
    setCurrentMember({ ...defaultMemberData });
    setStreamAtOptions([]);
  };

  const handleChangePronome = (event: any, value: any) => {
    setCurrentMember((prev) => ({ ...prev, gender: value ? value : "" }));
  };

  const handleSubmit = async () => {
    const newCurrentMember = { ...currentMember };
    const dontHasStreamAt = newCurrentMember.streamAt === "";
    const hasButNeedRenew =
      !dontHasStreamAt && !streamAtOption.includes(newCurrentMember.streamAt!);

    newCurrentMember.id = newCurrentMember.id ?? randomUUID();
    const uuid = newCurrentMember.id;

    if (dontHasStreamAt || hasButNeedRenew) {
      newCurrentMember.streamAt = newCurrentMember.primaryTwitch;
    }

    if (file && !file.removed) {
      const hasFileToAttach = file !== null && !newCurrentMember.imageFile;
      const needRenewFileData =
        file !== null &&
        newCurrentMember.imageFile &&
        file.lastModified !== newCurrentMember.imageFile.lastModified;

      if (hasFileToAttach || needRenewFileData) {
        const filePath = await handleUploadFile(uuid);

        if (filePath) {
          newCurrentMember.imageFile = {
            path: filePath,
            type: file.type,
            lastModified: file.lastModified,
          };
        }
      }
    } else if (file && file.removed) {
      newCurrentMember.imageFile = null;
      await ipcRenderer.invoke(EIpcEvents.FILE_REMOVE, { uuid, path_assets });
    }

    if (showEditMode) {
      updateMember(newCurrentMember);
    } else {
      addMember(newCurrentMember);
    }

    setCurrentMember(defaultMemberData);
    handleClose();
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

  return (
    <FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        data-testid={memberFormTestId.NEW_BUTTON}
      >
        <AddIcon />
        Adicionar membro
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose} fullWidth>
        {(open || showEditMode) && (
          <>
            <DialogTitle data-testid={memberFormTestId.DIALOG_TITLE}>
              {showEditMode ? "Editar" : "Adicionar"} membro
            </DialogTitle>
            <DialogContent
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
              data-testid={memberFormTestId.DIALOG_CONTENT}
            >
              <Grid gap="8px" display={"grid"} gridTemplateColumns={"1fr 2fr"}>
                <Autocomplete
                  fullWidth
                  options={["ele/dele", "ela/dela", "elu/delu"]}
                  value={currentMember?.gender}
                  onChange={handleChangePronome}
                  onInputChange={handleChangePronome}
                  style={{
                    padding: "8px 0",
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoFocus
                      name="gender"
                      label="Pronomes"
                      placeholder="Pronomes"
                      data-testid={memberFormTestId.PRONOUN_FIELD}
                    />
                  )}
                />
                <TextField
                  margin="dense"
                  name="name"
                  label="Nickname"
                  value={currentMember.name}
                  onChange={handleChange}
                  fullWidth
                  data-testid={memberFormTestId.NICKNAME_FIELD}
                />
              </Grid>
              <Grid gap="8px" display={"grid"} gridTemplateColumns={"2fr 2fr"}>
                <TextField
                  margin="dense"
                  name="primaryTwitch"
                  label="Twitch primária (ex: ld_speedruns)"
                  value={currentMember.primaryTwitch}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span style={{ color: "#6034b2" }}>twitch.tv/</span>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  data-testid={memberFormTestId.PRIMARY_TWITCH}
                />

                <TextField
                  margin="dense"
                  name="secondaryTwitch"
                  label="Twitch alternativa (ex: ld_speedruns)"
                  value={currentMember.secondaryTwitch}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span style={{ color: "#6034b2" }}>twitch.tv/</span>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  data-testid={memberFormTestId.SECONDARY_TWITCH}
                />
              </Grid>
              <FormControl fullWidth>
                <InputLabel id="twitch-stream-at">Vai transmitir em</InputLabel>
                <Select
                  labelId="twitch-stream-at"
                  label="Vai transmitir em:"
                  name="streamAt"
                  value={currentMember?.streamAt}
                  onChange={handleChangeStreamAt}
                  data-testid={memberFormTestId.STREAM_AT_FIELD}
                >
                  {streamAtOption.map((option, index) => (
                    <MenuItem key={`${index}-${option}`} value={option}>
                      twitch.tv/{option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="link"
                label="Redes sociais (opcional)"
                value={currentMember.link}
                onChange={handleChange}
                multiline
                fullWidth
                data-testid={memberFormTestId.SOCIALS_FIELD}
              />

              <Alert severity="info">
                Caso o link do "Redes sociais" seja o mesmo da{" "}
                <span>Twitch Primária</span> NÃO é necessário preencher esse
                campo
              </Alert>

              <input
                type="file"
                onChange={handleFileInputChange}
                multiple={false}
                style={{
                  marginBottom: "12px",
                }}
                accept="image/jpeg,image/jpg,image/gif,image/png"
              />

              {!imageBase64 && file && file.removed && (
                <Alert severity="info">
                  Você precisa salvar\atualizar para que seja removida a imagem!
                </Alert>
              )}
              <br />
              {imageBase64 && (
                <>
                  <img src={imageBase64} width={300} height={"auto"} />
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
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                data-testid={memberFormTestId.CANCEL_BUTTON}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                color="success"
                variant="contained"
                data-testid={memberFormTestId.SAVE_AND_UPDATE_BUTTON}
              >
                {showEditMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </FormControl>
  );
};

export { MemberForm };
