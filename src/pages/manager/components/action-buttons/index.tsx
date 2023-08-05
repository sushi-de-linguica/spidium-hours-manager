import { useFileStore } from "@/stores";
import { Box, Chip } from "@mui/material";
import Icon from "@mui/icons-material/CheckOutlined";
import { IFileTag, IRun } from "@/domain";
import { useMemo, useState } from "react";
import { ActionRunnerService } from "@/services/action-runner";
import { ConfirmDialog } from "../confirm-dialog";
import { toast } from "react-toastify";

interface IActionButtonsProps {
  row: IRun;
}

const ActionButtons = ({ row }: IActionButtonsProps) => {
  const { tags, activated } = useFileStore((store) => store.state);
  const { setActiveTag, state } = useFileStore();
  const [tagToHandler, setTagToHandler] = useState<null | IFileTag>(null);

  const handleActions = (tag: IFileTag) => {
    try {
      const enabledActions = tag.actions.filter((action) => action.isEnabled);

      const runnerService = new ActionRunnerService(
        enabledActions,
        row,
        state.files
      );
      runnerService.execute();

      setActiveTag(tag.id as string, row.id as string);
    } catch (err) {
      console.error(err);
    }
  };

  const memorizedTagButtonActives = useMemo(() => {
    const active = tags
      .filter((tag) => {
        const tagActive = activated.find((act) => act.tagId === tag.id);
        if (!tagActive) {
          return false;
        }

        return tagActive.runId === (row.id as string);
      })
      .map((tag) => tag.id);

    return active;
  }, [activated, tags, row]);

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap">
        {tags.map((tag: IFileTag) => {
          const showByMembers = row.runners.length >= tag.minimumRunnersToShow;
          const showTagButton = tag.isShow;
          if (showTagButton === false || showByMembers === false) {
            return;
          }

          const isActivatedButton = memorizedTagButtonActives.includes(tag.id);

          return (
            <Chip
              color={tag.color as any}
              variant={isActivatedButton ? "filled" : "outlined"}
              label={tag.label}
              size="small"
              onClick={() => {
                if (tag.isRequiredConfirmation) {
                  setTagToHandler(tag);
                  return;
                }

                handleActions(tag);
              }}
              icon={isActivatedButton ? <Icon /> : <></>}
              key={`${tag.id}-${memorizedTagButtonActives.length}`}
            />
          );
        })}
      </Box>

      <ConfirmDialog
        isOpen={tagToHandler !== null}
        data={tagToHandler}
        handleConfirm={(data) => {
          handleActions(data);
          setTagToHandler(null);
          toast.success(`Executando: ${data.label}`);
        }}
        cancelText="não, cancelar"
        confirmText={`executar ${tagToHandler?.label}`}
        confirmColor={tagToHandler?.color}
        handleCancel={() => {
          setTagToHandler(null);
        }}
      >
        Você está prestes a executar a ação [{tagToHandler?.label}], tem
        certeza?
      </ConfirmDialog>
    </>
  );
};

export { ActionButtons };
