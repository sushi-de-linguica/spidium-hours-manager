import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/hooks/use-members";
import { useToast } from "@/hooks/use-toast";
import { IMember } from "@/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const { membersStore, addMember } = useMembers();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.member?.members) {
        toast({
          title: "Erro",
          description: "Formato de arquivo inválido",
          variant: "destructive",
        });
        return;
      }

      const existingMembers = membersStore?.members || [];
      const newMembers = data.member.members as IMember[];

      let importedCount = 0;
      let existingCount = 0;

      newMembers.forEach((member) => {
        const existingMember = existingMembers.find((m) => m.id === member.id);
        if (existingMember) {
          existingCount++;
        } else {
          addMember(member);
          importedCount++;
        }
      });

      toast({
        title: "Importação concluída",
        description: `Importados ${importedCount} novos membros. ${existingCount} membros já existiam.`,
      });

      setFile(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Configurações</CardTitle>
          <CardDescription>
            Importe configurações da versão anterior do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full"
            />
            <Button
              onClick={handleImport}
              disabled={!file}
              className="w-full"
            >
              Importar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 