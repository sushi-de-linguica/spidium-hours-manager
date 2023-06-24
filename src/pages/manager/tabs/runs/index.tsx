import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from "@mui/x-data-grid";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";
import VideocamIcon from "@mui/icons-material/Videocam";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";

import { ptBR } from "@mui/x-data-grid";

import { exportRunsToDatagridRows } from "@/helpers/runs-to-datagrid-rows";
import RunForm from "../../components/run-form";
import { useMemo, useState } from "react";
import { useConfigurationStore, useEventStore, useFileStore } from "@/stores";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { EExportType, IMember, IRun } from "@/domain";
import { FileExporter } from "@/services/file-exporter-service";
import { NightbotApiService } from "@/services/nightbot-service";
import { toast } from "react-toastify";
import { ipcRenderer } from "electron";
import { EIpcEvents, EWsEvents } from "@/domain/enums";
import { CommandSuggestionDialog } from "../../components/command-suggestion";
import { RunsOrderDialog } from "../../components/runs-order";

const RunsTab = () => {
  const {
    last_selected_run_id,
    last_selected_setup_id,
    path_run,
    path_setup,
    path_assets,
  } = useConfigurationStore((store) => store.state);

  const { files } = useFileStore((state) => state.state);
  const {
    nightbot_runner_command_id,
    nightbot_host_command,
    nightbot_commentator_command,
    nightbot_runner_text_singular,
    nightbot_runner_text_plural,
    nightbot_host_text_singular,
    nightbot_host_text_plural,
    nightbot_commentator_text_singular,
    nightbot_commentator_text_plural,
    obs_browser_cam_input_name,
    obs_browser_game_input_name,
  } = useConfigurationStore((store) => store.state);

  const hasBrowserInputsForObs = useMemo(() => {
    if (!obs_browser_cam_input_name && !obs_browser_game_input_name) {
      return false;
    }
    return true;
  }, [obs_browser_cam_input_name, obs_browser_game_input_name]);

  const { updateLastRunId, updateLastSetupId } = useConfigurationStore();
  const { current_event_id, events } = useEventStore((store) => store.state);
  const { setCurrentEvent, removeRun } = useEventStore();

  const getDatagridDataByEventId = (eventId: string | null) => {
    if (!eventId) {
      return [];
    }

    const activeEvent = events.find(({ id }) => id === eventId);
    if (!activeEvent) {
      return [];
    }

    return exportRunsToDatagridRows(activeEvent.runs);
  };

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [runToRemove, setRunToRemove] = useState<(() => void) | null>(null);

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [runToEdit, setRunToEdit] = useState<IRun | null>(null);

  const [commandSuggestionDialogOpen, setCommandSuggestionDialogOpen] =
    useState(false);
  const [runToSuggestion, setRunToSuggestion] = useState<IRun | null>(null);

  const [isOpenSetupAlert, setIsOpenSetupAlert] = useState(false);
  const [isOpenRunAlert, setIsOpenRunAlert] = useState(false);

  const [runToExport, setRunToExport] = useState<IRun | null>(null);

  const handleCancelDialog = () => {
    setRunToRemove(null);
    setIsOpenDialog(false);
  };

  const handleCancelEditDialog = () => {
    setRunToEdit(null);
    setIsOpenEditDialog(false);
  };

  const handleCancelAlert = () => {
    setRunToExport(null);
    setIsOpenRunAlert(false);
    setIsOpenSetupAlert(false);
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      align: "center",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<VideoSettingsIcon color="primary" />}
          label="mandar para SETUP"
          onClick={() => {
            setRunToExport(params.row);
            setIsOpenRunAlert(false);
            setIsOpenSetupAlert(true);
          }}
          showInMenu
        />,
        <GridActionsCellItem
          label="mandar para tela de RUN"
          icon={<VideocamIcon color="error" />}
          onClick={() => {
            setRunToExport(params.row);
            setIsOpenSetupAlert(false);
            setIsOpenRunAlert(true);
          }}
          showInMenu
          divider
        />,
        <GridActionsCellItem
          label="sugestões de !title e !game"
          icon={<ContentCopyIcon />}
          onClick={() => {
            setRunToSuggestion(params.row);
            setCommandSuggestionDialogOpen(true);
          }}
          showInMenu
        />,
        <GridActionsCellItem
          label="editar"
          icon={<EditIcon />}
          onClick={() => {
            setRunToEdit(params.row);
            setIsOpenEditDialog(true);
          }}
          showInMenu
        />,
        <GridActionsCellItem
          showInMenu
          icon={<DeleteIcon />}
          onClick={() => {
            setRunToRemove(params.row);
            setIsOpenDialog(true);
          }}
          label="remover"
        />,
      ],
    },
    {
      field: "",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        return (
          <Box display="flex" gap={1}>
            <Chip
              variant={
                params.row.id === last_selected_run_id ? "filled" : "outlined"
              }
              size="small"
              color="success"
              label="LIVE"
              onClick={() => {
                setRunToExport(params.row);
                setIsOpenSetupAlert(false);
                setIsOpenRunAlert(true);
              }}
            />
            <Chip
              variant={
                params.row.id === last_selected_setup_id ? "filled" : "outlined"
              }
              size="small"
              color="info"
              label="SETUP"
              onClick={() => {
                setRunToExport(params.row);
                setIsOpenRunAlert(false);
                setIsOpenSetupAlert(true);
              }}
            />
          </Box>
        );
      },
    },
    { field: "game", headerName: "Jogo", flex: 2 },
    { field: "category", headerName: "Categoria", flex: 1 },
    { field: "platform", headerName: "Plataforma", width: 100 },
    { field: "estimate", headerName: "Estimativa", width: 130 },
    {
      field: "all_runners",
      renderCell: (options) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: options.row.all_runners_nodes,
            }}
          />
        );
      },
      headerName: "Runner(s)",
      flex: 1,
    },
    { field: "all_hosts", headerName: "Host(s)", minWidth: 200 },
    { field: "all_comments", headerName: "Comentarista(s)", minWidth: 200 },
  ];

  const getLinkByMember = (runner: IMember) => {
    if (!runner.link && !runner.primaryTwitch) {
      return "ih rapaz, arruma ai mods...";
    }

    if (!!runner.link) {
      return runner.link;
    }

    if (!!runner.primaryTwitch) {
      return `https://www.twitch.tv/${runner.primaryTwitch}`;
    }

    return "";
  };

  const getBrowserLinkToObsByMember = (member: IMember) => {
    return `https://player.twitch.tv/?channel=${member.streamAt}&muted=false&parent=multitwitch.tv&parent=www.multitwitch.tv`;
  };

  const handleCloseCommandSuggestion = () => {
    setCommandSuggestionDialogOpen(false);
  };

  const handleConfirmExport = async (data: IRun) => {
    const handleCopyRunImage = () => {
      if (!data.imageFile) {
        return;
      }

      const path = isOpenSetupAlert ? path_setup : path_run;

      try {
        ipcRenderer.invoke(EIpcEvents.COPY_FILE, {
          uuid: data.id,
          fileName: "game",
          path_assets,
          path,
        });
      } catch (error) {
        console.error("copy file error", error);
      }
    };

    const handleUpdateNightbotRunner = () => {
      const needUpdateNightbotRunnerCommand =
        nightbot_runner_command_id && data?.runners?.length > 0;

      if (needUpdateNightbotRunnerCommand) {
        try {
          const nightbotService = new NightbotApiService();
          let message = "";
          if (data.runners.length === 1) {
            const [firstRunner] = data.runners;
            message = `${nightbot_runner_text_singular ?? ""}`;
            message += getLinkByMember(firstRunner);
          } else {
            const mappedLinks = data.runners.map((runner) =>
              getLinkByMember(runner)
            );
            message = `${nightbot_runner_text_plural ?? ""}`;
            message += mappedLinks.join(" | ");
          }

          nightbotService
            .updateCustomCommandById(nightbot_runner_command_id._id, {
              message,
            })
            .then(() => {
              toast.success(
                `O comando ${nightbot_runner_command_id.name} foi atualizado no nightbot`
              );
            });

          console.log("atualizou comando com:", message);
        } catch (error) {
          console.error("error nightbot", error);
        }
      }
    };

    const handleUpdateNightbotHost = () => {
      const needUpdateNightbotHost =
        nightbot_host_command && data?.hosts?.length > 0;

      if (needUpdateNightbotHost) {
        try {
          const nightbotService = new NightbotApiService();
          let message = "";

          if (data.hosts.length === 1) {
            const [firstHost] = data.hosts;
            message = `${nightbot_host_text_singular ?? ""}`;
            message += getLinkByMember(firstHost);
          } else {
            const mappedLinks = data.hosts.map((host) => getLinkByMember(host));
            message = `${nightbot_host_text_plural ?? ""}`;
            message += mappedLinks.join(" | ");
          }

          nightbotService
            .updateCustomCommandById(nightbot_host_command._id, {
              message,
            })
            .then(() => {
              toast.success(
                `O comando ${nightbot_host_command.name} foi atualizado no nightbot`
              );
            });

          console.log("atualizou comando com:", message);
        } catch (error) {
          console.error("error nightbot", error);
        }
      }
    };

    const handleUpdateNightbotCommentator = () => {
      const needUpdateNightbotCommentator =
        nightbot_commentator_command && data?.comments?.length > 0;

      if (needUpdateNightbotCommentator) {
        try {
          const nightbotService = new NightbotApiService();
          let message = "";

          if (data.comments.length === 1) {
            const [firstHost] = data.comments;
            message = `${nightbot_commentator_text_singular ?? ""}`;
            message += getLinkByMember(firstHost);
          } else {
            const mappedLinks = data.comments.map((host) =>
              getLinkByMember(host)
            );
            message = `${nightbot_commentator_text_plural ?? ""}`;
            message += mappedLinks.join(" | ");
          }

          nightbotService
            .updateCustomCommandById(nightbot_commentator_command._id, {
              message,
            })
            .then(() => {
              toast.success(
                `O comando ${nightbot_commentator_command.name} foi atualizado no nightbot`
              );
            });

          console.log("atualizou comando com:", message);
        } catch (error) {
          console.error("error nightbot", error);
        }
      }
    };

    const handleUpdateBrowserSources = async () => {
      const [runner] = data.runners;
      console.log("runner", runner);
      console.log("------");
      if (
        runner &&
        runner.streamAt &&
        hasBrowserInputsForObs &&
        window.obsService
      ) {
        const batchCall: any[] = [
          obs_browser_cam_input_name,
          obs_browser_game_input_name,
        ]
          .filter((value) => !!value)
          .map((field) => ({
            requestType: "SetInputSettings",
            requestData: {
              inputName: field,
              inputSettings: {
                url: getBrowserLinkToObsByMember(runner),
              },
            },
          }));
        console.log(batchCall);
        if (batchCall.length > 0) {
          ipcRenderer.send(EWsEvents.SEND_BATCH_EVENT_OBS, batchCall);
        }
      }
    };

    const pathToExport = isOpenSetupAlert ? path_setup : path_run;
    const exportType = isOpenSetupAlert
      ? EExportType.SETUP_SCREEN
      : EExportType.RUN_SCREEN;

    const filesToExport = files.filter((file) => file.type === exportType);

    if (isOpenSetupAlert) {
      updateLastSetupId(data.id!);
      FileExporter.exportFilesToPath(filesToExport, pathToExport, data);
      toast.success(
        `A Run do game: ${data.game} foi enviada para tela de SETUP !`
      );
    } else {
      updateLastRunId(data.id!);
      FileExporter.exportFilesToPath(filesToExport, path_run, data);
      toast.success(
        `A Run do game: ${data.game} foi enviada para tela de RUN !`
      );

      handleUpdateBrowserSources();
      handleUpdateNightbotRunner();
      handleUpdateNightbotHost();
      handleUpdateNightbotCommentator();
    }

    handleCopyRunImage();

    setIsOpenRunAlert(false);
    setIsOpenSetupAlert(false);
  };

  return (
    <Box>
      {events.length === 0 && (
        <>
          <Alert
            severity="warning"
            style={{
              alignItems: "center",
            }}
          >
            Não existem eventos cadastrados. Vá para a aba "Eventos" e cadastre
            seu primeiro evento!
          </Alert>
        </>
      )}
      {events.length > 0 && (
        <Paper
          elevation={0}
          style={{
            padding: "32px 0",
            marginBottom: "0 12px",
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="event-selector-label" htmlFor="event-selector">
              Selecione o evento
            </InputLabel>
            <Select
              label="Selecione o evento"
              id="event-selector"
              labelId="event-selector-label"
              value={current_event_id ?? null}
              onChange={(event) => {
                setCurrentEvent(event.target?.value ?? null);
              }}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {current_event_id !== null && (
        <Paper
          variant="outlined"
          style={{
            padding: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <RunForm
              run={runToEdit}
              eventId={current_event_id}
              showEditMode={isOpenEditDialog}
              onClose={handleCancelEditDialog}
            />

            <RunsOrderDialog eventId={current_event_id} />
          </div>

          <Box marginTop={"24px"}>
            <DataGrid
              rowSelection={false}
              rows={getDatagridDataByEventId(current_event_id)}
              columns={columns}
              autoHeight
              localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>
        </Paper>
      )}

      <CommandSuggestionDialog
        open={commandSuggestionDialogOpen}
        run={runToSuggestion}
        onClose={handleCloseCommandSuggestion}
      />

      <ConfirmDialog
        isOpen={isOpenDialog}
        data={runToRemove}
        handleConfirm={(data) => {
          if (!current_event_id) {
            setIsOpenDialog(false);
            return;
          }

          removeRun({
            eventId: current_event_id,
            run: data,
          });

          setIsOpenDialog(false);
          toast.success(`A run de ${data.game} foi removida`);
        }}
        cancelText="não, cancelar"
        confirmText="sim, excluir"
        confirmColor="error"
        handleCancel={handleCancelDialog}
      >
        Você está prestes a excluir a RUN, essa alteração não pode ser
        revertida, tem certeza?
      </ConfirmDialog>

      {isOpenSetupAlert || isOpenRunAlert ? (
        <ConfirmDialog
          isOpen={isOpenSetupAlert || isOpenRunAlert}
          data={runToExport}
          handleConfirm={handleConfirmExport}
          cancelText="não, cancelar"
          confirmText={`sim, mandar pra ${isOpenSetupAlert ? "SETUP" : "RUN"}`}
          confirmColor={isOpenSetupAlert ? "secondary" : "success"}
          handleCancel={handleCancelAlert}
        >
          {isOpenSetupAlert &&
            `Você está prestes a alterar todos os TEXTOS da tela de SETUP para os dados da run de: ${runToExport?.game} - ${runToExport?.category}`}
          {isOpenRunAlert &&
            `Você está prestes a alterar todos Textos da tela de RUN para os dados da run de: ${runToExport?.game} - ${runToExport?.category}`}
        </ConfirmDialog>
      ) : null}
    </Box>
  );
};

export { RunsTab };
