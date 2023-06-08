// src/components/RunForm.tsx
import React, { useEffect, useState } from "react";
import { randomUUID } from "crypto";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { IEvent } from "@/domain";
import { useEventStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";

const defaultData: IEvent = {
  id: "",
  name: "",
  runs: [],
  created_at: new Date(),
  updated_at: null,
  deleted_at: null,
};

interface IRunFormProps {
  showEditMode: boolean;
  event: IEvent | null;
  onClose?: () => void;
}

const EventForm = ({ showEditMode, event, onClose }: IRunFormProps) => {
  const [open, setOpen] = useState(false);
  const { addEvent, updateEvent } = useEventStore();

  const [currentData, setCurrentData] = useState<IEvent>(
    showEditMode && event ? { ...event } : { ...defaultData }
  );

  useEffect(() => {
    if (!!event) {
      setCurrentData(event);
    }
  }, [event]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (!!onClose) {
      onClose();
    }
    setOpen(false);
    setCurrentData(defaultData);
  };

  const handleSubmit = async () => {
    const uuid = currentData.id ?? randomUUID();
    const dataToSave: IEvent = {
      ...currentData,
      id: uuid,
    };

    if (showEditMode) {
      updateEvent(dataToSave);
    } else {
      addEvent(dataToSave);
    }

    handleClose();
  };

  return (
    <FormControl>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        <AddIcon /> Adicionar Evento
      </Button>
      <Dialog open={open || showEditMode} onClose={handleClose} fullWidth>
        {(open || showEditMode) && (
          <>
            <DialogTitle>
              {showEditMode
                ? `Editar Evento - ${currentData.name}`
                : "Adicionar Evento"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Nome do evento"
                value={currentData.name}
                onChange={handleChange}
                fullWidth
              />
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

export default EventForm;
