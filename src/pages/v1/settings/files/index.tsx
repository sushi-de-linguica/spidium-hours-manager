import { useState } from "react";
import { IExportFileRun } from "@/domain";
import { useFileStore } from "@/stores";
import { filesToDataGridRows } from "@/helpers/files-to-datagrid-rows";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportFileForm } from "./export-file-form";
import { useToast } from "@/hooks/use-toast";

export const FilesSettings = () => {
  const { files } = useFileStore((store) => store.state);
  const { removeFile } = useFileStore();
  const { toast } = useToast();

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<IExportFileRun | null>(null);
  const [isOpenFormDialog, setIsOpenFormDialog] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<IExportFileRun | null>(null);

  const handleCancelDialog = () => {
    setFileToRemove(null);
    setIsOpenDialog(false);
  };

  const handleCancelFormDialog = () => {
    setFileToEdit(null);
    setIsOpenFormDialog(false);
  };

  const handleAddFile = () => {
    setFileToEdit(null);
    setIsOpenFormDialog(true);
  };

  const rows = filesToDataGridRows(files);

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Arquivos de Exportação</h1>
        <div className="flex w-full sm:w-auto gap-4">
          <Button onClick={handleAddFile} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar arquivo
          </Button>
        </div>
      </div>

      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o ARQUIVO DE EXPORTAÇÃO, essa alteração não pode ser revertida, tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDialog}>
              Não, cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (fileToRemove) {
                  removeFile(fileToRemove);
                  setIsOpenDialog(false);
                  toast({
                    title: "Sucesso",
                    description: `O arquivo ${fileToRemove.name} foi removido`,
                  });
                }
              }}
            >
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportFileForm
        showEditMode={isOpenFormDialog}
        file={fileToEdit}
        onClose={handleCancelFormDialog}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ações</TableHead>
              <TableHead>Nome do arquivo</TableHead>
              <TableHead>Template</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFileToEdit(row);
                        setIsOpenFormDialog(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFileToRemove(row);
                        setIsOpenDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.template}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 