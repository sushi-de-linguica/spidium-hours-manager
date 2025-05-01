import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IConfirmDialogProps {
  isOpen: boolean;
  data: any;
  handleConfirm: (data: any) => void;
  handleCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  children: React.ReactNode;
}

export const ConfirmDialog = ({
  isOpen,
  data,
  handleConfirm,
  handleCancel,
  title = "Tem certeza?",
  confirmText = "confirmar",
  cancelText = "cancelar",
  confirmColor = "primary",
  children,
}: IConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            onClick={() => handleConfirm(data)}
            className={`bg-${confirmColor}-500 hover:bg-${confirmColor}-600 text-white`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 