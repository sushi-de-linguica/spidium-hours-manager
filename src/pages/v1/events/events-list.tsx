"use client";

import {
  CalendarClock,
  Edit,
  ExternalLink,
  ListChecks,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { IEvent } from "@/domain";

interface EventsListProps {
  events: IEvent[];
  onEdit: (event: IEvent) => void;
  onDelete: (id: string) => void;
  onManageRuns: (id: string) => void;
}

export function EventsList({
  events,
  onEdit,
  onDelete,
  onManageRuns,
}: EventsListProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground text-center py-6">
            Nenhum evento encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do evento</TableHead>
            <TableHead>Agenda</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  {event.name}
                </div>
              </TableCell>
              <TableCell>
                {event.scheduleLink ? (
                  <a
                    href={event.scheduleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver agenda
                  </a>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    sem agenda
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageRuns(event.id!)}
                        >
                          <ListChecks className="h-4 w-4 mr-2" />
                          Runs
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Gerenciar as runs desse evento
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar evento</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(event.id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Deletar evento</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
