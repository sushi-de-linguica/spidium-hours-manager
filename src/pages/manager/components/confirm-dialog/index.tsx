import {
  Button,
  Color,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface IConfirmDialogProps {
  handleConfirm: (data: any) => void;
  handleCancel: () => void;
  data: any;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: any;
  cancelColor?: any;
  isOpen: boolean;
}

const ConfirmDialog = ({
  isOpen,
  data,
  cancelText = "cancelar",
  confirmText = "confirmar",
  confirmColor,
  cancelColor,
  title = "Tem certeza?",
  handleCancel,
  handleConfirm,
  children,
}: React.PropsWithChildren<IConfirmDialogProps>) => {
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {children}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color={cancelColor} onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onClick={() => handleConfirm(data)}
            variant="contained"
            autoFocus
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { ConfirmDialog };
