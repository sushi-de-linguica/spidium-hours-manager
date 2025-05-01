"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@/hooks/use-toast";
import { IEvent, IRun } from "@/domain";
import { useEvents } from "@/hooks/use-events";
import { useNavigate, useParams } from "react-router";

interface SortableRunItemProps {
  eventId: string;
  run: IRun;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableRunItem({
  eventId,
  run,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableRunItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: run.id! });
  const navigate = useNavigate();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-2">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab p-1 hover:bg-muted rounded"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold">{run.game}</h3>
              <p className="text-sm text-muted-foreground">
                {run.category} por{" "}
                {run.runners.map((runner) => runner.name).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-muted px-2 py-1 rounded">
              Estimate: {run.estimate}
            </span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoveUp}
                disabled={isFirst}
                className="h-8 w-8"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoveDown}
                disabled={isLast}
                className="h-8 w-8"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => {
                navigate(`/events/${eventId}/runs/${run.id}/edit`);
              }}
              variant="outline"
              size="sm"
            >
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventRunsPage() {
  const params = useParams();
  let navigate = useNavigate();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [runs, setRuns] = useState<IRun[]>([]);
  const [orderedRuns, setOrderedRuns] = useState<IRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { getEventById, updateEvent } = useEvents();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const eventData = getEventById(params.id!);
    if (eventData) {
      setEvent(eventData);
      setRuns(eventData?.runs ?? []);
    } else {
      navigate("/events");
    }

    setLoading(false);
  }, [params.id, navigate]);

  if (!event) {
    return <></>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (!orderedRuns.length) {
        setOrderedRuns(runs);
      }

      setOrderedRuns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        console.log(newItems);

        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
      setHasChanges(true);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      if (!orderedRuns.length) {
        setOrderedRuns(runs);
      }

      setOrderedRuns((items) => {
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index - 1];
        newItems[index - 1] = temp;

        return newItems.map((item, idx) => ({
          ...item,
          order: idx,
        }));
      });
      setHasChanges(true);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < runs.length - 1) {
      if (!orderedRuns.length) {
        setOrderedRuns(runs);
      }

      setOrderedRuns((items) => {
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index + 1];
        newItems[index + 1] = temp;

        return newItems.map((item, idx) => ({
          ...item,
          order: idx,
        }));
      });
      setHasChanges(true);
    }
  };

  const handleSaveOrder = () => {
    if (orderedRuns.length <= 0) {
      return;
    }

    updateEvent({
      ...event,
      runs: orderedRuns,
    });

    setRuns(orderedRuns);
    setOrderedRuns([]);

    toast({
      title: "Ordenação salva",
      description: "A ordenação das runs foi salva com sucesso.",
    });
    setHasChanges(false);
  };

  const handleAddRun = () => {
    navigate(`/events/${params.id}/runs/add`);
  };

  const handleBackToEvents = () => {
    if (hasChanges) {
      if (
        confirm(
          "Você tem certeza que deseja voltar? As alterações não salvas serão perdidas."
        )
      ) {
        navigate("/events");
      }
    } else {
      navigate("/events");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <Button variant="ghost" onClick={handleBackToEvents} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Eventos
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">Gerencie as runs desse evento</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSaveOrder} variant="default">
              <Save className="mr-2 h-4 w-4" />
              Salvar ordenação
            </Button>
          )}
          <Button onClick={handleAddRun}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Run
          </Button>
        </div>
      </div>

      {(orderedRuns.length > 0 ? orderedRuns : runs).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center py-6">
              Nenhuma run encontrada para este evento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h2 className="text-sm font-medium mb-2">
              Instruções de ordenação:
            </h2>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>
                Use o icone de Drag and Drop (arrastar e soltar) para mover as
                runs
              </li>
              <li>
                Use as setas de mover para cima e para baixo para mover a run
                selecionada
              </li>
              <li>Ao finalizar, clique no botão "salvar ordenação"</li>
            </ul>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={
                (orderedRuns.length > 0 ? orderedRuns : runs)?.map(
                  (run) => run.id!
                ) ?? []
              }
              strategy={verticalListSortingStrategy}
            >
              {(orderedRuns.length > 0 ? orderedRuns : runs)?.map(
                (run, index) => (
                  <SortableRunItem
                    key={run.id}
                    eventId={event.id!}
                    run={run}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    isFirst={index === 0}
                    isLast={index === runs.length - 1}
                  />
                )
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
