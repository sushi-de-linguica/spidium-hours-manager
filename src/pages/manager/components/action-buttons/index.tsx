import { randomUUID } from "crypto";
import { useFileStore } from "@/stores";
import { Box, Chip } from "@mui/material";
import Icon from "@mui/icons-material/CheckOutlined";
import { IFileTag, IFileTagActionModule, IRun } from "@/domain";
import { useMemo } from "react";
import { ActionRunnerService } from "@/services/action-runner";

interface IActionButtonsProps {
  row: IRun;
}

const ActionButtons = ({ row }: IActionButtonsProps) => {
  const { tags, activated } = useFileStore((store) => store.state);
  const { setActiveTag } = useFileStore();

  const handleActions = (tag: IFileTag) => {
    try {
      const enabledActions = tag.actions.filter((action) => action.isEnabled);

      const runnerService = new ActionRunnerService(enabledActions, row);
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
            onClick={() => handleActions(tag)}
            icon={isActivatedButton ? <Icon /> : <></>}
            key={`${tag.id}-${memorizedTagButtonActives.length}`}
          />
        );
      })}
    </Box>
  );
};

export { ActionButtons };
