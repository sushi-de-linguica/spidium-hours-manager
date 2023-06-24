import { IRun } from "@/domain";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ClipboardCopy } from "../clipboard-copy";
import { useMemo } from "react";
import { useConfigurationStore } from "@/stores";
import { CommandSuggestionService } from "@/services/command-suggestion";

interface ICommandsSuggestDialogProps {
  run: IRun | null;
  open: boolean;
  onClose: () => void;
}
const CommandSuggestionDialog = ({
  run,
  open,
  onClose,
}: ICommandsSuggestDialogProps) => {
  if (!run) {
    return <></>;
  }

  const { seo_title_template } = useConfigurationStore((store) => store.state);

  const titleMemo = useMemo(() => {
    const title = CommandSuggestionService.getTitleByRun(
      seo_title_template,
      run
    );

    return `!title ${title}`;
  }, [run, seo_title_template]);

  const gameMemo = useMemo(() => {
    const game = CommandSuggestionService.getGameByRun(run);
    return `!game ${game}`;
  }, [run, seo_title_template]);

  return (
    <>
      <Dialog open={open} fullWidth>
        <DialogTitle>Sugestões de !title e !game</DialogTitle>
        <DialogContent>
          <Box display={"flex"} gap="24px" flexDirection={"column"}>
            <ClipboardCopy copyText={titleMemo} />
            <ClipboardCopy copyText={gameMemo} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { CommandSuggestionDialog };
