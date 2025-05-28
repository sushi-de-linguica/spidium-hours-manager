import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/hooks/use-members";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { IMember, IEvent } from "@/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, Download, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const DataPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importMembers, setImportMembers] = useState(true);
  const [importEvents, setImportEvents] = useState(true);
  const [exportMembers, setExportMembers] = useState(true);
  const [exportEvents, setExportEvents] = useState(true);
  const [resetMembers, setResetMembers] = useState(false);
  const [resetEvents, setResetEvents] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { membersStore, addMember, resetMembers: resetMembersStore } = useMembers();
  const { eventsStore, addEvent, resetEvents: resetEventsStore } = useEvents();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      let importedMembersCount = 0;
      let existingMembersCount = 0;
      let importedEventsCount = 0;
      let existingEventsCount = 0;

      // Import members if checkbox is checked
      if (importMembers && data.member?.members) {
        const existingMembers = membersStore?.members || [];
        const newMembers = data.member.members as IMember[];

        newMembers.forEach((member) => {
          const existingMember = existingMembers.find((m) => m.id === member.id);
          if (existingMember) {
            existingMembersCount++;
          } else {
            addMember(member);
            importedMembersCount++;
          }
        });
      }

      // Import events if checkbox is checked
      if (importEvents && Array.isArray(data.events)) {
        const validEvents = data.events.filter((event: any) => {
          return event.name && Array.isArray(event.runs);
        });

        const newEvents = validEvents.filter((importedEvent: IEvent) => {
          return !eventsStore.events.some((existingEvent) => existingEvent.id === importedEvent.id);
        });

        newEvents.forEach((event: IEvent) => {
          addEvent({
            ...event,
            id: event.id || crypto.randomUUID(),
            created_at: new Date(),
            updated_at: null,
            deleted_at: null,
          });
          importedEventsCount++;
        });

        existingEventsCount = validEvents.length - newEvents.length;
      }

      // Show appropriate toast message based on what was imported
      const messages = [];
      if (importMembers) {
        messages.push(`${importedMembersCount} novos membros importados. ${existingMembersCount} membros já existiam.`);
      }
      if (importEvents) {
        messages.push(`${importedEventsCount} novos eventos importados. ${existingEventsCount} eventos já existiam.`);
      }

      toast({
        title: "Importação concluída",
        description: messages.join(" "),
      });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const data: any = {};

    if (exportMembers) {
      data.member = {
        members: membersStore.members,
      };
    }

    if (exportEvents) {
      data.events = eventsStore.events;
    }

    if (!exportMembers && !exportEvents) {
      toast({
        title: "Aviso",
        description: "Por favor, selecione pelo menos uma opção para exportar",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spidium-hours-manager-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados com sucesso.",
    });
  };

  const handleReset = async () => {
    if (!resetMembers && !resetEvents) {
      toast({
        title: "Aviso",
        description: "Por favor, selecione pelo menos uma opção para resetar",
        variant: "destructive",
      });
      return;
    }

    setIsResetDialogOpen(true);
  };

  const handleConfirmReset = async () => {
    try {
      if (resetMembers) {
        resetMembersStore();
      }
      if (resetEvents) {
        resetEventsStore();
      }

      toast({
        title: "Reset concluído",
        description: `Dados resetados com sucesso: ${resetMembers ? "Membros" : ""} ${resetEvents ? "Eventos" : ""}`,
      });

      setResetMembers(false);
      setResetEvents(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar os dados",
        variant: "destructive",
      });
    } finally {
      setIsResetDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Resetar Dados</CardTitle>
                <CardDescription>
                  Resetar dados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reset-members"
                        checked={resetMembers}
                        onCheckedChange={(checked) => setResetMembers(checked as boolean)}
                      />
                      <Label htmlFor="reset-members">Resetar Membros</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reset-events"
                        checked={resetEvents}
                        onCheckedChange={(checked) => setResetEvents(checked as boolean)}
                      />
                      <Label htmlFor="reset-events">Resetar Eventos</Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleReset}
                    disabled={!resetMembers && !resetEvents}
                    className="w-full"
                    variant="destructive"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resetar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Importar Dados</CardTitle>
                <CardDescription>
                  Importe dados de um arquivo JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-members"
                        checked={importMembers}
                        onCheckedChange={(checked) => setImportMembers(checked as boolean)}
                      />
                      <Label htmlFor="import-members">Importar Membros</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="import-events"
                        checked={importEvents}
                        onCheckedChange={(checked) => setImportEvents(checked as boolean)}
                      />
                      <Label htmlFor="import-events">Importar Eventos</Label>
                    </div>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  <Button
                    onClick={handleImport}
                    disabled={!file || (!importMembers && !importEvents)}
                    className="w-full"
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    Importar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Exporte dados do sistema para um arquivo JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-members"
                        checked={exportMembers}
                        onCheckedChange={(checked) => setExportMembers(checked as boolean)}
                      />
                      <Label htmlFor="export-members">Exportar Membros</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-events"
                        checked={exportEvents}
                        onCheckedChange={(checked) => setExportEvents(checked as boolean)}
                      />
                      <Label htmlFor="export-events">Exportar Eventos</Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleExport}
                    disabled={!exportMembers && !exportEvents}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        data={[]}
        handleConfirm={handleConfirmReset}
        handleCancel={() => setIsResetDialogOpen(false)}
        title="Confirmar Reset"
        confirmText="Resetar"
        cancelText="Cancelar"
        confirmColor="destructive"
      >
        <p>
          Tem certeza que deseja resetar os seguintes dados?
          {resetMembers && <div className="mt-2">- Todos os membros</div>}
          {resetEvents && <div className="mt-2">- Todos os eventos</div>}
          <div className="mt-4 text-red-500 font-bold">
            Esta ação não pode ser desfeita!
          </div>
        </p>
      </ConfirmDialog>
    </div>
  );
}; 