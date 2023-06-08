// src/components/ExportFileForm.tsx
import React, { useEffect, useState } from "react";
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
import { IMember } from "@/domain";
import { useMemberStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";

const defaultData: IMember = {
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
  const [streamAtOption, setStreamAtOptions] = useState<string[]>([]);

  const { addMember, updateMember } = useMemberStore((store) => store);

  const [currentMember, setCurrentMember] = useState<IMember>(
    showEditMode && member ? { ...member } : { ...defaultData }
  );

  useEffect(() => {
    handleMapTwitchOptions();
  }, [currentMember]);

  useEffect(() => {
    if (!!member) {
      setCurrentMember(member);
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
    setCurrentMember({ ...defaultData });
    setStreamAtOptions([]);
  };

  const handleChangePronome = (event: any, value: any) => {
    setCurrentMember((prev) => ({ ...prev, gender: value ? value : "" }));
  };

  const handleSubmit = () => {
    const newCurrentMember = { ...currentMember };
    const dontHasStreamAt = newCurrentMember.streamAt === "";
    const hasButNeedRenew =
      !dontHasStreamAt && !streamAtOption.includes(newCurrentMember.streamAt!);

    if (dontHasStreamAt || hasButNeedRenew) {
      newCurrentMember.streamAt = newCurrentMember.primaryTwitch;
    }

    if (showEditMode) {
      updateMember(newCurrentMember);
    } else {
      addMember(newCurrentMember);
    }

    setCurrentMember(defaultData);
    handleClose();
  };

  return (
    <FormControl>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        <AddIcon />
        {showEditMode ? "Editar" : "Adicionar"} membro
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose} fullWidth>
        {(open || showEditMode) && (
          <>
            <DialogTitle>
              {showEditMode ? "Editar" : "Adicionar"} membro
            </DialogTitle>
            <DialogContent
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
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
              />
              <Alert severity="info">
                Caso o link do "Redes sociais" seja o mesmo da{" "}
                <span>Twitch Primária</span> NÃO é necessário preencher esse
                campo
              </Alert>
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

export { MemberForm };
