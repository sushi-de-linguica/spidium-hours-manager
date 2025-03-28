import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IEvent } from "@/domain";
import { useNavigate } from "react-router";
import { EventsList } from "./events-list";
import { EventDialog } from "./event-dialog";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";

export const EventsPage = () => {
  const navigate = useNavigate();
  const { eventsStore, addEvent, removeEvent, updateEvent } = useEvents();
  const { toast } = useToast();

  const [events, setEvents] = useState<IEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    setEvents(eventsStore?.events ?? []);
  }, [eventsStore]);

  const filteredEvents = events.filter((event) =>
    event.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEvent = () => {
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: IEvent) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (
      confirm(
        "Você tem certeza que deseja deletar esse evento? todas runs e dados associados serão excluidos permanentemente."
      )
    ) {
      removeEvent(id);
      toast({
        title: "Evento deletado",
        description: "O evento foi deletado com sucesso.",
        variant: "default",
      });
    }
  };

  const handleSaveEvent = (event: IEvent) => {
    if (event.id) {
      updateEvent(event);

      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
        variant: "default",
      });
    } else {
      addEvent(event);

      toast({
        title: "Evento adicionado",
        description: "O evento foi adicionado com sucesso.",
        variant: "default",
      });
    }

    setIsDialogOpen(false);
  };

  const handleManageRuns = (eventId: string) => {
    navigate(`/events/${eventId}/runs`);
  };

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <div className="flex w-full sm:w-auto gap-4">
          <Input
            placeholder="Buscar por eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar evento
          </Button>
        </div>
      </div>

      <EventsList
        events={filteredEvents}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onManageRuns={handleManageRuns}
      />

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        event={currentEvent}
        onSave={handleSaveEvent}
      />
    </div>
  );
};
