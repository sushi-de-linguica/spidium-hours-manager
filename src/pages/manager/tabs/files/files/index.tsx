import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  ptBR,
} from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Box, Chip } from "@mui/material";
import { IExportFileRun } from "@/domain";
import ExportFileForm from "../../../components/export-file-form";
import { filesToDataGridRows } from "@/helpers/files-to-datagrid-rows";
import { ConfigureForm } from "../../../components/configure";
import { useFileStore } from "@/stores";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../../../components/confirm-dialog";
import { toast } from "react-toastify";

const FilesTabFiles = () => {
  const { files } = useFileStore((store) => store.state);
  const { removeFile } = useFileStore();

  const memoFiles = useMemo(() => filesToDataGridRows(files), [files]);

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<IExportFileRun | null>(null);

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<IExportFileRun | null>(null);

  const handleCancelDialog = () => {
    setFileToRemove(null);
    setIsOpenDialog(false);
  };

  const handleCancelEditDialog = () => {
    setFileToEdit(null);
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
          label="editar"
          icon={<EditIcon />}
          onClick={() => {
            setFileToEdit(params.row);
            setIsOpenEditDialog(true);
          }}
          showInMenu
        />,
        <GridActionsCellItem
          showInMenu
          color="error"
          icon={<DeleteIcon />}
          onClick={() => {
            setFileToRemove(params.row);
            setIsOpenDialog(true);
          }}
          label="remover"
        />,
      ],
    },
    { field: "name", headerName: "Nome do arquivo", flex: 1 },
    { field: "template", headerName: "template", flex: 2 },
  ];

  return (
    <Box>
      <ConfirmDialog
        isOpen={isOpenDialog}
        data={fileToRemove}
        handleConfirm={(data) => {
          removeFile(data);
          setIsOpenDialog(false);
          toast.success(`O arquivo ${data.name} foi removido`);
        }}
        cancelText="não, cancelar"
        confirmText="sim, excluir"
        confirmColor="error"
        handleCancel={handleCancelDialog}
      >
        Você está prestes a excluir o ARQUIVO DE EXPORTAÇÃO, essa alteração não
        pode ser revertida, tem certeza?
      </ConfirmDialog>

      <Box display="flex" columnGap={1}>
        <ExportFileForm
          showEditMode={isOpenEditDialog}
          file={fileToEdit}
          onClose={handleCancelEditDialog}
        />
        <ConfigureForm />
      </Box>

      <Box marginTop="24px">
        <DataGrid
          rowSelection={false}
          rows={memoFiles}
          columns={columns}
          autoHeight
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
};

export { FilesTabFiles };
