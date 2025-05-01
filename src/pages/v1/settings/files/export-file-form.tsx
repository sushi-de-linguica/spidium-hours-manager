import { useState, useEffect } from "react";
import { IExportFileRun } from "@/domain";
import { useFileStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { randomUUID } from "crypto";

interface ExportFileFormProps {
  showEditMode: boolean;
  file: IExportFileRun | null;
  onClose: () => void;
}

export const ExportFileForm = ({ showEditMode, file, onClose }: ExportFileFormProps) => {
  const { addFile, updateFile } = useFileStore();
  const [name, setName] = useState(file?.name || "");
  const [template, setTemplate] = useState(file?.template || "");
  const [maxCharsPerLine, setMaxCharsPerLine] = useState<number | undefined>(file?.maxCharsPerLine);
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      setName(file.name);
      setTemplate(file.template);
      setMaxCharsPerLine(file.maxCharsPerLine);
    } else {
      setName("");
      setTemplate("");
      setMaxCharsPerLine(undefined);
    }
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showEditMode && file) {
      updateFile({
        ...file,
        name,
        template,
        maxCharsPerLine,
      });
      toast({
        title: "Sucesso",
        description: "Arquivo atualizado com sucesso",
      });
    } else {
      addFile({
        id: randomUUID(),
        name,
        template,
        maxCharsPerLine,
      });
      toast({
        title: "Sucesso",
        description: "Arquivo adicionado com sucesso",
      });
    }

    onClose();
  };

  return (
    <Dialog open={showEditMode} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showEditMode ? "Editar arquivo" : "Novo arquivo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do arquivo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do arquivo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Input
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Digite o template"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCharsPerLine">Máximo de caracteres por linha</Label>
            <Input
              id="maxCharsPerLine"
              type="number"
              value={maxCharsPerLine || ""}
              onChange={(e) => setMaxCharsPerLine(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Digite o máximo de caracteres por linha (opcional)"
              min="0"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {showEditMode ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 