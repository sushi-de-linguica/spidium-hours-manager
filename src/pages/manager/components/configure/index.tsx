// src/components/ExportFileForm.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { IConfiguration } from "@/domain";
import { CONFIGURATION_DEFAULT_STATE, useConfigurationStore } from "@/stores";
import SettingsIcon from "@mui/icons-material/Settings";

const ConfigureForm = ({}) => {
  const [open, setOpen] = useState(false);

  const configuration = useConfigurationStore((store) => store.state);
  const { updateConfiguration } = useConfigurationStore((store) => store);

  const [currentConfiguration, setCurrentConfiguration] =
    useState<IConfiguration>(configuration ?? CONFIGURATION_DEFAULT_STATE);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentConfiguration((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    updateConfiguration(currentConfiguration);
    handleClose();
  };

  return (
    <FormControl>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon /> Configurações
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Atualizar configurações</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="path_run"
            label="Destino de arquivos - Tela de RUN"
            value={currentConfiguration.path_run}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            name="path_setup"
            label="Destino de arquivos - Tela de SETUP"
            value={currentConfiguration.path_setup}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            name="path_assets"
            label="Destino de arquivos - Imagens dos jogos (assets)"
            value={currentConfiguration.path_assets}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
};

export { ConfigureForm };
