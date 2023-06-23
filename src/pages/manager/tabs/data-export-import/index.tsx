import {
  CONFIGURATION_DEFAULT_STATE,
  useConfigurationStore,
  useEventStore,
  useFileStore,
  useMemberStore,
} from "@/stores";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useMemo, useState, createRef } from "react";
import { randomUUID } from "crypto";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import DownloadIcon from "@mui/icons-material/Download";

import { ConfirmDialog } from "../../components/confirm-dialog";
import { IExportedJsonFile } from "@/domain";

import { toast } from "react-toastify";

enum ERemoveType {
  EVENT = "EVENT",
  MEMBER = "MEMBER",
  FILE = "FILE",
  CONFIGURATION = "CONFIGURATION",
  ALL = "ALL",
}

const DataExportImportTab = () => {
  const eventStore = useEventStore();
  const configurationStore = useConfigurationStore();
  const memberStore = useMemberStore();
  const fileStore = useFileStore();
  const inputImportRef = createRef<any>();
  const [exportCredentials, setExportCredentials] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenImportDialog, setIsOpenImportDialog] = useState(false);
  const [removeType, setRemoveType] = useState(ERemoveType.ALL);
  const [warningMessage, setWarningMessage] = useState("");

  const exportData = useMemo(
    () => ({
      event: eventStore.state,
      configuration: configurationStore.state,
      member: memberStore.state,
      file: fileStore.state,
    }),
    [eventStore, configurationStore, memberStore, fileStore]
  );

  const handleImportDataFromText = () => {
    const handleSetStatesFromJson = (json: IExportedJsonFile) => {
      if (json.event && json.event?.events?.length > 0) {
        const newEventData = json.event.events.map((event) => {
          const { runs } = event;
          const newRuns =
            runs.length > 0
              ? runs.map((run) => {
                  return {
                    ...run,
                    id: run?.id ? run.id : randomUUID(),
                  };
                })
              : [];
          return {
            ...event,
            runs: newRuns,
            id: event.id ? event.id : randomUUID(),
          };
        });
        eventStore.updateFullEventState(newEventData);
      }

      if (json.configuration) {
        configurationStore.updateConfiguration({
          ...CONFIGURATION_DEFAULT_STATE,
          ...configurationStore.state,
          ...json.configuration,
        });
      }

      if (json.file && json.file?.files?.length > 0) {
        fileStore.setState(json.file.files);
      }

      if (json.member && json.member.members.length > 0) {
        memberStore.setState(json.member.members);
      }
    };

    try {
      const jsonFile = JSON.parse(inputImportRef.current.value);
      handleSetStatesFromJson(jsonFile);
      inputImportRef.current.value = "";
      toast.success("Importação realizada com sucesso!");
    } catch (error) {
      console.log("error", error);
      toast.error("Ocorreu um erro ao importar os dados");
    }
    setIsOpenImportDialog(false);
  };

  const handleDownloadJson = () => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getFullYear().toString()}`;

    const getExportDataStringify = () => {
      if (exportCredentials) {
        return JSON.stringify(exportData);
      }
      const newExportData = {
        ...exportData,
        configuration: {
          ...exportData.configuration,
          obs_ws_password: "",
          nightbot_client_id: "",
          nightbot_client_secret: "",
          nightbot_token: "",
        },
      };

      return JSON.stringify(newExportData);
    };

    const jsonData = getExportDataStringify();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `SHM-${formattedDate}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    switch (removeType) {
      case ERemoveType.ALL:
        eventStore.reset();
        memberStore.reset();
        fileStore.reset();
        toast.success("Todos as RUNS, MEMBROS e ARQUIVOS foram removidos");
        break;

      case ERemoveType.EVENT:
        eventStore.reset();
        toast.success("Todos as RUNS foram removidas");
        break;

      case ERemoveType.FILE:
        fileStore.reset();
        toast.success("Todos os ARQUIVOS foram removidos");
        break;

      case ERemoveType.MEMBER:
        memberStore.reset();
        toast.success("Todos os MEMBROS foram removidos");
        break;
    }

    setIsOpen(false);
  };

  return (
    <>
      <ConfirmDialog
        data={null}
        isOpen={isOpen}
        handleConfirm={handleReset}
        handleCancel={() => setIsOpen(false)}
        confirmText="sim, taca fogo em tudo"
        cancelText="não, ta doido?"
        confirmColor="error"
        title="Você tem certeza que deseja apagar?"
      >
        Esta ação excluira {warningMessage}, e esta ação não pode ser revertida,
        tem certeza?
      </ConfirmDialog>
      <ConfirmDialog
        data={null}
        isOpen={isOpenImportDialog}
        handleConfirm={handleImportDataFromText}
        handleCancel={() => setIsOpenImportDialog(false)}
        confirmText="sim, importar"
        cancelText="não, ta doido?"
        confirmColor="success"
        title="Você tem certeza que deseja importar?"
      >
        A importação afetará todos os dados da aplicação
      </ConfirmDialog>

      <Grid gridTemplateColumns="1fr 2fr" display="grid">
        <Box
          display="flex"
          flexDirection="column"
          alignContent="center"
          justifyContent="center"
          paddingRight={"12px"}
          gap="16px"
        >
          <Typography>Importar</Typography>
          <TextField
            inputRef={inputImportRef}
            minRows={8}
            maxRows={8}
            multiline
          />
          <Button
            onClick={() => setIsOpenImportDialog(true)}
            color="success"
            variant="contained"
          >
            <DoneIcon /> Importar dados
          </Button>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignContent="center"
          justifyContent="center"
          paddingLeft={"12px"}
          gap="16px"
        >
          <Button
            onClick={handleDownloadJson}
            color="success"
            variant="contained"
          >
            <DownloadIcon /> Baixar dados
          </Button>

          <Button onClick={() => setExportCredentials(!exportCredentials)}>
            Exportar credenciais\secrets: {exportCredentials ? "SIM" : "NÃO"}
          </Button>

          <Box
            display="grid"
            flexDirection="column"
            alignContent="center"
            gridTemplateColumns="1fr 1fr 1fr"
            justifyContent="center"
            paddingLeft={"12px"}
            gap="16px"
            marginTop="48px"
          >
            <Button
              onClick={() => {
                setWarningMessage("TODOS EVENTOS");
                setRemoveType(ERemoveType.EVENT);
                setIsOpen(true);
              }}
              color="error"
              variant="outlined"
            >
              Limpar todos eventos
            </Button>

            <Button
              onClick={() => {
                setWarningMessage("TODOS MEMBROS");
                setRemoveType(ERemoveType.MEMBER);
                setIsOpen(true);
              }}
              color="error"
              variant="outlined"
            >
              Limpar todos membros
            </Button>

            <Button
              onClick={() => {
                setWarningMessage("TODOS ARQUIVOS");
                setRemoveType(ERemoveType.FILE);
                setIsOpen(true);
              }}
              color="error"
              variant="outlined"
            >
              Limpar todos arquivos
            </Button>
          </Box>

          <Button
            onClick={() => {
              setWarningMessage(
                "TODOS MEMBROS, RUNS, ARQUIVOS e CONFIGURAÇÕES"
              );
              setRemoveType(ERemoveType.ALL);
              setIsOpen(true);
            }}
            color="error"
            variant="contained"
          >
            <DeleteForeverIcon /> Limpar TUDO (panic button)
          </Button>
        </Box>
      </Grid>
    </>
  );
};

export { DataExportImportTab };
