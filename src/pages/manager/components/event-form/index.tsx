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
  Switch,
  TextField,
} from "@mui/material";
import { IEvent, IMember } from "@/domain";
import { useEventStore, useMemberStore } from "@/stores";
import AddIcon from "@mui/icons-material/Add";
import { eventFormTestId } from "./options";
import { HoraroImportService } from "@/services/horaro-import-service";
import { toast } from "react-toastify";
import { convertTime } from "@/helpers/convert-time";
import { getMDString } from "@/helpers/get-md-string";
import { sanitizeString } from "@/helpers/sanitize-string";
import { defaultMemberData } from "../member-form";

const defaultData: IEvent = {
  id: "",
  name: "",
  scheduleLink: "",
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
  const [isAllowedPopulateMembers, setIsAllowedPopulateMembers] =
    useState(true);
  const [open, setOpen] = useState(false);
  const { addEvent, updateEvent } = useEventStore();
  const { members } = useMemberStore((store) => store.state);
  const { addMember } = useMemberStore();

  const [currentData, setCurrentData] = useState<IEvent>(
    showEditMode && event ? { ...event } : { ...defaultData }
  );

  const isDisabledToImport = useMemo(() => {
    if (showEditMode) {
      return true;
    }

    return (
      !currentData.scheduleLink ||
      !currentData?.scheduleLink.startsWith("https://horaro.org/")
    );
  }, [currentData, showEditMode]);

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
    setIsAllowedPopulateMembers(true);
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
      if (dataToSave.runs.length > 0) {
        dataToSave.runs.forEach((run) => {
          run.runners.forEach(addMember);
        });
      }
      addEvent(dataToSave);
    }

    handleClose();
  };

  const handleImportRunsFromHoraro = async () => {
    const horaroService = new HoraroImportService(currentData.scheduleLink!);

    const schedule: any = await horaroService
      .getSchedule()
      .catch(() =>
        toast.error("não foi possível importar dados do horaro.org :(")
      );

    if (!schedule) {
      toast.error("não foi possível importar dados do horaro.org :(");
      return;
    }

    const runnerColumnIndex = schedule.columns.findIndex(
      (column: string) => column.toLowerCase() === "runner"
    );
    const gameColumnIndex = schedule.columns.findIndex((column: string) =>
      ["jogo", "game"].includes(column.toLowerCase())
    );
    const categoryColumnIndex = schedule.columns.findIndex((column: string) =>
      ["categoria", "category"].includes(column.toLowerCase())
    );

    const isValidColumns =
      runnerColumnIndex >= 0 &&
      gameColumnIndex >= 0 &&
      categoryColumnIndex >= 0;

    if (!isValidColumns) {
      toast.error(
        "Parace que as colunas necessárias 'Runner', 'Jogo' ou 'Categoria' não foram identificadas"
      );
      return;
    }

    const getRunnersFromMDMapped = (mappedRunners: any[]) => {
      let createdRunners: IMember[] = [];

      if (mappedRunners.length > 0) {
        const foundRunners: IMember[] = [];
        const runnersToCreate: Pick<
          IMember,
          "name" | "primaryTwitch" | "streamAt"
        >[] = [];

        mappedRunners.map((mappedRunner) => {
          const isMemberWithTwitch = mappedRunner.value !== null;

          const findPrimaryTwitch = isMemberWithTwitch
            ? mappedRunner.value.split("twitch.tv/")[1]
            : mappedRunner.text;

          const runner = members
            .filter((member) => member.primaryTwitch)
            .find(
              (member) =>
                sanitizeString(findPrimaryTwitch).toLowerCase() ===
                member.primaryTwitch?.toLowerCase()
            );

          if (!runner) {
            isAllowedPopulateMembers &&
              runnersToCreate.push({
                primaryTwitch: isMemberWithTwitch ? findPrimaryTwitch : "",
                streamAt: isMemberWithTwitch ? findPrimaryTwitch : "",
                name: mappedRunner.text,
              });
            return;
          }

          foundRunners.push(runner);
        });

        if (isAllowedPopulateMembers && runnersToCreate.length > 0) {
          createdRunners = runnersToCreate.map((runnerStartData) => {
            const newMember = {
              ...defaultMemberData,
              ...runnerStartData,
            };
            return newMember;
          });
        }
        return [...foundRunners, ...createdRunners];
      }

      return [];
    };

    const runs = schedule.items.map((run: any) => {
      const estimate = convertTime(run.length);
      const game = run.data[gameColumnIndex];
      const category = run.data[categoryColumnIndex];
      const runnersData = run.data[runnerColumnIndex];
      const mappedRunners = getMDString(runnersData);
      const runners = getRunnersFromMDMapped(mappedRunners);

      return {
        id: randomUUID(),
        runners,
        hosts: [],
        comments: [],
        estimate: estimate,
        game,
        category,
        platform: "",
        seoGame: "",
        seoTitle: "",
      };
    });

    setCurrentData({ ...currentData, runs });
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
                data-testid={eventFormTestId.NAME_FIELD}
                fullWidth
              />

              <TextField
                autoFocus
                margin="dense"
                name="scheduleLink"
                label="URL do horaro (opcional)"
                value={currentData.scheduleLink}
                onChange={handleChange}
                data-testid={eventFormTestId.SCHEDULE_LINK_FIELD}
                fullWidth
              />

              {!showEditMode && (
                <Grid
                  marginTop={"16px"}
                  gap="8px"
                  display="flex"
                  flexDirection={"column"}
                  justifyContent={"center"}
                  alignContent={"center"}
                  alignItems={"center"}
                  gridTemplateColumns={"1fr 1fr"}
                >
                  <FormGroup>
                    <FormControlLabel
                      onChange={(_, checked) => {
                        setIsAllowedPopulateMembers(checked);
                      }}
                      value={isAllowedPopulateMembers}
                      control={<Switch defaultChecked />}
                      label="Criar membros não existentes na base de dados"
                    />
                  </FormGroup>

                  <Button
                    onClick={handleImportRunsFromHoraro}
                    color="primary"
                    variant="contained"
                    disabled={isDisabledToImport}
                    data-testid={eventFormTestId.SAVE_AND_UPDATE_BUTTON}
                  >
                    Importar do horaro
                  </Button>

                  {true && (
                    <Chip
                      color="success"
                      variant="outlined"
                      label={`${currentData.runs.length} run(s) localizadas`}
                    />
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                data-testid={eventFormTestId.CANCEL_BUTTON}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                data-testid={eventFormTestId.SAVE_AND_UPDATE_BUTTON}
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

export default EventForm;
