import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/hooks/use-members";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IExportedJsonFile } from "@/domain";

export const ExportPage = () => {
  const { membersStore } = useMembers();
  const { eventsStore } = useEvents();
  const { toast } = useToast();

  const [exportMembers, setExportMembers] = useState(true);
  const [exportEvents, setExportEvents] = useState(true);

  const handleExport = () => {
    try {
      const data: IExportedJsonFile = {};

      if (exportMembers) {
        data.member = {
          members: membersStore?.members || []
        };
      }

      if (exportEvents) {
        data.event = {
          events: eventsStore?.events || []
        };
      }

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `spidium-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Arquivo exportado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar os dados",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Configurações</CardTitle>
          <CardDescription>
            Exporte configurações para backup ou migração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-members"
                  checked={exportMembers}
                  onCheckedChange={(checked) => setExportMembers(checked as boolean)}
                />
                <Label htmlFor="export-members">
                  Exportar Membros ({membersStore?.members?.length || 0})
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-events"
                  checked={exportEvents}
                  onCheckedChange={(checked) => setExportEvents(checked as boolean)}
                />
                <Label htmlFor="export-events">
                  Exportar Eventos ({eventsStore?.events?.length || 0})
                </Label>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={!exportMembers && !exportEvents}
              className="w-full"
            >
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 