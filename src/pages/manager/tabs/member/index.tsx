import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  ptBR,
} from "@mui/x-data-grid";

import { Box } from "@mui/material";
import { useMemberStore } from "@/stores";
import { membersToDataGridRows } from "@/helpers/members-to-datagrid-rows";
import { MemberForm } from "../../components/member-form";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { IMember } from "@/domain";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

const MembersTab = () => {
  const { members } = useMemberStore((store) => store.state);
  const { removeMember } = useMemberStore();

  const memoMembers = useMemo(() => membersToDataGridRows(members), [members]);

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<(() => void) | null>(
    null
  );

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<IMember | null>(null);

  const handleCancelDialog = () => {
    setMemberToRemove(null);
    setIsOpenDialog(false);
  };

  const handleCancelEditDialog = () => {
    setMemberToEdit(null);
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
            setMemberToEdit(params.row);
            setIsOpenEditDialog(true);
          }}
          showInMenu
        />,
        <GridActionsCellItem
          showInMenu
          icon={<DeleteIcon />}
          onClick={() => {
            setMemberToRemove(params.row);
            setIsOpenDialog(true);
          }}
          label="remover"
        />,
      ],
    },
    { field: "name", headerName: "Nickname/Nome", minWidth: 100, flex: 1 },
    { field: "gender", headerName: "Pronome", width: 100 },
    { field: "primaryTwitch", headerName: "Twitch primária", minWidth: 200 },
    {
      field: "secondaryTwitch",
      headerName: "Twitch alternativa",
      minWidth: 200,
    },
    {
      field: "streamAt",
      headerName: "Vai transmitir em",
      minWidth: 200,
    },
    {
      field: "link",
      headerName: "Redes sociais (opcional)",
      minWidth: 300,
      flex: 2,
    },
  ];

  return (
    <Box>
      <ConfirmDialog
        isOpen={isOpenDialog}
        data={memberToRemove}
        handleConfirm={(data) => {
          removeMember(data);
          setIsOpenDialog(false);
          toast.success(`O membro ${data.name} foi removido(a)`);
        }}
        cancelText="não, cancelar"
        confirmText="sim, excluir"
        confirmColor="error"
        handleCancel={handleCancelDialog}
      >
        Você está prestes a excluir o membro, essa alteração não pode ser
        revertida, tem certeza?
      </ConfirmDialog>
      <Box display="flex" columnGap={1}>
        <MemberForm
          showEditMode={isOpenEditDialog}
          member={memberToEdit}
          onClose={handleCancelEditDialog}
        />
      </Box>

      <Box marginTop="24px">
        <DataGrid
          rowSelection={false}
          rows={memoMembers}
          columns={columns}
          autoHeight
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
  );
};

export { MembersTab };
