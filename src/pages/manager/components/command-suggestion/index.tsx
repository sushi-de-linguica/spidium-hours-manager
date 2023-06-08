import { IMember, IRun } from "@/domain";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ClipboardCopy } from "../clipboard-copy";
import { useMemo, useState } from "react";
import { TextGenerator } from "@/services/file-exporter-service";
import { useConfigurationStore } from "@/stores";

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

  const makeTitle = () => {
    const hasCustomTemplate = run?.seoTitle && run?.seoTitle?.length > 0;

    return TextGenerator.generate(
      hasCustomTemplate ? run.seoTitle! : seo_title_template,
      run
    );
  };

  const getGame = () => {
    const hasCustomGame = run.seoGame && run?.seoGame?.length > 0;

    return hasCustomGame ? run.seoGame! : run.game;
  };

  const titleMemo = useMemo(() => {
    return `!title ${makeTitle()}`;
  }, [run]);

  const gameMemo = useMemo(() => {
    return `!game ${getGame()}`;
  }, [run]);

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
