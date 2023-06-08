import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";

interface IClipboardCopyProps {
  copyText: string;
}

const ClipboardCopy = ({ copyText }: IClipboardCopyProps) => {
  const [isCopied, setIsCopied] = useState(false);

  // This is the function we wrote earlier
  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    }

    return document.execCommand("copy", true, text);
  }

  const handleCopyClick = () => {
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Grid display="grid" gap="8px" gridTemplateColumns={"2fr 1fr"}>
      <TextField size="medium" type="text" value={copyText} disabled />
      <Button
        onClick={handleCopyClick}
        variant="contained"
        color={isCopied ? "success" : "primary"}
      >
        <span>{isCopied ? "Copiado!" : "Copiar"}</span>
      </Button>
    </Grid>
  );
};

export { ClipboardCopy };
