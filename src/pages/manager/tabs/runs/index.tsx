import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import * as os from "os";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";

import { ptBR } from "@mui/x-data-grid";

import { exportRunsToDatagridRows } from "@/helpers/runs-to-datagrid-rows";
import RunForm from "../../components/run-form";
import { useEffect, useMemo, useState } from "react";
import { useConfigurationStore, useEventStore } from "@/stores";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { IRun } from "@/domain";
import { toast } from "react-toastify";
import { CommandSuggestionDialog } from "../../components/command-suggestion";
import { RunsOrderDialog } from "../../components/runs-order";
import { CommandSuggestionService } from "@/services/command-suggestion";
import { downloadFile } from "@/services/download-file";
import { ConfigureForm } from "../../components/configure";
import { ActionButtons } from "../../components/action-buttons";

const RunsTab = () => {
  const { path_run, path_setup, path_assets, runs_row_height } =
    useConfigurationStore((store) => store.state);

  const { updateConfigurationField } = useConfigurationStore();

  const configurationState = useConfigurationStore((store) => store.state);

  const showPathConfigureWarning = useMemo(() => {
    return path_run === "" || path_setup === "" || path_assets === "";
  }, [configurationState, path_run, path_setup, path_assets]);

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

  const handleCancelDialog = () => {
    setRunToRemove(null);
    setIsOpenDialog(false);
  };

  const handleCancelEditDialog = () => {
    setRunToEdit(null);
    setIsOpenEditDialog(false);
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      align: "center",
      getActions: (params: GridRowParams) => [
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
      width: 210,
      renderCell: ({ row }) => {
        return <ActionButtons row={row} />;
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

  const handleCloseCommandSuggestion = () => {
    setCommandSuggestionDialogOpen(false);
  };

  const { seo_title_template } = useConfigurationStore((store) => store.state);

  const handleExportRunsTitleAndGame = () => {
    const datagridData = getDatagridDataByEventId(current_event_id);
    if (datagridData.length === 0) {
      toast.warning("Não existem runs para exportar os titulos de live");
      return;
    }

    const data = datagridData.map((row) => {
      const title = CommandSuggestionService.getTitleByRun(
        seo_title_template,
        row
      );
      const game = CommandSuggestionService.getGameByRun(row);

      return `!title ${title};!game ${game}`;
    });

    const dataWithLineBreaks = data.join(os.EOL);
    downloadFile("title-e-game.txt", dataWithLineBreaks);
  };

  const [rowHeightLocal, setRowHeightLocal] = useState<number>(
    runs_row_height ?? 100
  );

  useEffect(() => {
    updateConfigurationField("runs_row_height", rowHeightLocal);
  }, [rowHeightLocal]);

  return (
    <Box gap={"8px"} display={"flex"} flexDirection={"column"}>
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
      {showPathConfigureWarning && (
        <>
          <Alert
            severity="warning"
            style={{
              alignItems: "center",
            }}
          >
            Para poder exportar suas runs, é necessário configurar destino de
            exportação de arquivos. <br />
            <ConfigureForm />
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

            <Button
              variant="contained"
              color="success"
              onClick={handleExportRunsTitleAndGame}
            >
              Exportar comandos de title e game
            </Button>

            <RunsOrderDialog eventId={current_event_id} />
          </div>

          <TextField
            margin="dense"
            label="Tamanho da linha"
            value={rowHeightLocal}
            onChange={(event) => {
              setRowHeightLocal(parseInt(event.target.value));
            }}
            type="number"
          />

          <Box marginTop={"24px"}>
            <DataGrid
              rowSelection={false}
              rows={getDatagridDataByEventId(current_event_id)}
              rowHeight={runs_row_height}
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
    </Box>
  );
};

export { RunsTab };
