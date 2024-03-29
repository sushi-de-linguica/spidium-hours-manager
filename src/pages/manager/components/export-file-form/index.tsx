// src/components/ExportFileForm.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { IExportFileRun } from "@/domain";
import { useFileStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";

const defaultData: IExportFileRun = {
  name: "",
  template: "",
};

interface IExportFileFormProps {
  showEditMode?: boolean;
  file?: IExportFileRun | null;
  onClose?: () => void;
}

const ExportFileForm = ({
  showEditMode = false,
  onClose,
  file,
}: IExportFileFormProps) => {
  const [open, setOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<IExportFileRun>(defaultData);

  useEffect(() => {
    if (!!file) {
      setCurrentFile(file as IExportFileRun);
    }
  }, [file]);

  const { addFile, updateFile } = useFileStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentFile((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (!value) {
      setCurrentFile((prev) => ({ ...prev, [name]: undefined }));
      return;
    }
    try {
      const numberValue = parseInt(value);
      setCurrentFile((prev) => ({ ...prev, [name]: numberValue }));
    } catch (error) {
      console.log("houve um erro ao tentar converter o numero");
    }
  };

  const handleClose = () => {
    if (!!onClose) {
      onClose();
    }
    setOpen(false);
    setCurrentFile(defaultData);
  };

  const handleSubmit = () => {
    if (showEditMode) {
      updateFile(currentFile);
    } else {
      addFile(currentFile);
    }
    handleClose();
  };

  return (
    <FormControl>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        <AddIcon /> {showEditMode ? "Editar" : "Adicionar"} arquivo de
        exportação
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose}>
        <DialogTitle>
          {showEditMode ? "Editar" : "Adicionar"} arquivo de exportação
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome do arquivo (exemplo: runner.txt)"
            value={currentFile.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            name="template"
            label="Template"
            value={currentFile.template}
            onChange={handleChange}
            multiline
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            name="maxCharsPerLine"
            label="Máximo de caracteres por linha"
            type="number"
            value={currentFile.maxCharsPerLine}
            onChange={handleChangeNumber}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            {showEditMode ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
};

export default ExportFileForm;
