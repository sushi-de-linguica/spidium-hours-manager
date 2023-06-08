import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";

import { Box, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { exportEventsToDatagridRows } from "@/helpers/events-to-datagrid-rows";
import { useEventStore } from "@/stores";
import EventForm from "../../components/event-form";
import { IEvent } from "@/domain";

const EventsTab = () => {
  const { events } = useEventStore((store) => store.state);

  const memoEvents = useMemo(
    () => exportEventsToDatagridRows(events),
    [events]
  );

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setToEdit(params.row);
              setIsOpenEditDialog(true);
            }}
          >
            Editar
          </Button>
        );
      },
    },
    { field: "name", headerName: "Nome", flex: 1 },
    {
      field: "runs",
      headerName: "Runs",
      width: 80,
      renderCell: (data) => data.row.runs.length,
    },
    {
      field: "created_at",
      headerName: "Criado em",
      width: 250,
      renderCell: (params) => {
        // params.row.created_at.toISOString()
        return "";
      },
    },
    {
      field: "updated_at",
      headerName: "Ultima atualização",
      width: 250,
      renderCell: (params) => {
        // params.row.updated_at?.toISOString()
        return "";
      },
    },
  ];

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [dataToEdit, setToEdit] = useState<IEvent | null>(null);

  const handleCancelEditDialog = () => {
    setToEdit(null);
    setIsOpenEditDialog(false);
  };

  return (
    <Box>
      <div style={{ display: "flex", gap: "12px" }}>
        <EventForm
          event={dataToEdit}
          showEditMode={isOpenEditDialog}
          onClose={handleCancelEditDialog}
        />
      </div>

      <Box marginTop={"24px"}>
        <DataGrid
          rowSelection={false}
          rows={memoEvents}
          columns={columns}
          autoHeight
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
};

export { EventsTab };
