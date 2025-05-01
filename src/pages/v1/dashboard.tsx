"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Clock,
  Edit,
  Search,
  Tv,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportRunsToDatagridRows } from "@/helpers/runs-to-datagrid-rows";
import { IEvent, IRun } from "@/domain";
import { ActionButtons } from "./action-buttons";
import { useEvents } from "@/hooks/use-events";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentEvent, setCurrentPageEvent] = useState<IEvent | null>(null);
  const { eventsStore, setCurrentEvent } = useEvents();

  const getDatagridDataByEventId = (eventId: string | null) => {
    if (!eventId) {
      return [];
    }

    const activeEvent = eventsStore?.events.find(({ id }) => id === eventId);
    if (!activeEvent) {
      return [];
    }

    return exportRunsToDatagridRows(activeEvent.runs);
  };

  const handleUpdateCurrentPageEvent = () => {
    const event = eventsStore?.events.find(({ id }) => id === eventsStore?.current_event_id) ?? null
    console.log("event", event);
    setCurrentPageEvent(event);
  }

  useEffect(() => {
    handleUpdateCurrentPageEvent();
  }, []);

  useEffect(() => {
    if (eventsStore?.current_event_id) {
      handleUpdateCurrentPageEvent();
    }
  }, [eventsStore?.current_event_id]);

  const runs: IRun[] = getDatagridDataByEventId(eventsStore?.current_event_id);

  const filteredRuns = runs.filter(
    (run) =>
      run.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.runners.some((runner) =>
        runner.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      run.comments.some((commentator) =>
        commentator.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-xl font-semibold w-[200px]">Evento atual</h1>
          <Select
            value={eventsStore?.current_event_id || ""}
            onValueChange={(value) => {
              setCurrentEvent(value)
              handleUpdateCurrentPageEvent();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um evento" />
            </SelectTrigger>
            <SelectContent>
              {eventsStore?.events.map((event) => (
                <SelectItem key={event.id} value={event.id || ""}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {!currentEvent && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">Selecione um evento primeiro</p>
          </div>
        )}

        {currentEvent &&
          (
            <>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por runs..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div>
                    <CardTitle>{currentEvent?.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ações</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Runners</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Comentários
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            Estimate
                          </div>
                        </TableHead>
                        <TableHead className="text-right">#</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRuns.map((run) => (
                        <TableRow
                          key={run.id}
                          className={
                            run.status === "live"
                              ? "bg-red-50 dark:bg-red-950/20"
                              : ""
                          }
                        >
                          <TableCell>
                            <div className="flex flex-col gap-1 sm:flex-row">
                              <ActionButtons row={run} />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium min-w-64">
                            <div className="flex items-center gap-3">
                              {/* <img
                          src={run.image || "/placeholder.svg"}
                          alt={run.game}
                          width={50}
                          height={30}
                          className="rounded object-cover"
                        /> */}
                              {run.game}
                            </div>
                            <div className="flex flex-row flex-wrap">
                              {run.category && (
                                <Badge variant="default" className="mr-1">
                                  {run.category}
                                </Badge>
                              )}
                              {run.platform && (
                                <Badge variant="secondary" className="mr-1">
                                  {run.platform}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {run.runners.map((runner, index) => (
                                <Badge key={index} variant="outline">
                                  {runner.streamAt ? (
                                    <a
                                      href={`https://twitch.tv/${runner.streamAt}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 hover:underline"
                                      title={runner.streamAt}
                                    >
                                      {runner.name}
                                      <Tv className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    runner.name
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {run.comments.map((commentator, index) => (
                                <Badge key={index} variant="secondary">
                                  {commentator.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{run.estimate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/events/${eventsStore?.current_event_id}/runs/${run.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )
        }
      </main>
    </div>
  );
}
