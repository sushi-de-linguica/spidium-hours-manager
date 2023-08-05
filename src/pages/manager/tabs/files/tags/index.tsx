import { DataGrid, GridColDef, ptBR } from "@mui/x-data-grid";

import { Box, Button, Chip } from "@mui/material";
import { IExportFileRun, IFile, IFileTag } from "@/domain";
import { useFileStore } from "@/stores";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { tagsToDatagridRows } from "@/helpers/tags-to-datagrid-rows";
import { ActionForm } from "@/pages/manager/components/action-form";

const FilesTabTags = () => {
  const { tags } = useFileStore((store) => store.state);

  const memoTags = useMemo(() => tagsToDatagridRows(tags), [tags]);

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [editContent, setEditContent] = useState<IFileTag | null>(null);

  const handleCancelEditDialog = () => {
    setEditContent(null);
    setIsOpenEditDialog(false);
  };

  const handleOpenEditDialog = (data: IFileTag) => {
    setEditContent(data);
    setIsOpenEditDialog(true);
  };

  const columns: GridColDef[] = [
    {
      field: "edit",
      headerName: "#",
      renderCell: (params) => {
        return (
          <Button onClick={() => handleOpenEditDialog(params.row)}>
            Editar
          </Button>
        );
      },
    },
    {
      field: "label",
      headerName: "Nome da tag",
      renderCell: ({ row }) => {
        return (
          <Chip
            label={row.label}
            color={row.color as any}
            variant="outlined"
            size="small"
          />
        );
      },
      flex: 1,
    },
    { field: "description", headerName: "Descrição", flex: 3 },
  ];

  return (
    <Box>
      <Box display="flex" columnGap={1}>
        <ActionForm
          showEditMode={isOpenEditDialog}
          action={editContent}
          onClose={handleCancelEditDialog}
        />
      </Box>
      <Box marginTop="24px">
        <DataGrid
          rowSelection={false}
          rows={memoTags}
          columns={columns}
          autoHeight
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
};

export { FilesTabTags };
