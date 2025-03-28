import type React from "react";
import { randomUUID } from "crypto";
import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Gamepad,
  Plus,
  Save,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router";
import { useEvents } from "@/hooks/use-events";
import { IRun } from "@/domain";
import { useMembers } from "@/hooks/use-members";

interface Runner {
  id: string;
  name: string;
}

interface Game {
  id: string;
  name: string;
}

export default function AddRunPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { getEventById, updateEvent } = useEvents();
  const { membersStore } = useMembers();

  const event = getEventById(params.id || "");
  if (!event) {
    return <div>Evento não encontrado</div>;
  }

  // State for the form
  const [runs, setRuns] = useState<IRun[]>([
    {
      id: randomUUID(),
      runners: [],
      hosts: [],
      comments: [],
      estimate: "",
      game: "",
      category: "",
      platform: "",
      imageFile: null,
    },
  ]);

  const onBackButtonClick = () => {
    navigate(`/events/${event.id}/runs`);
  };

  const handleAddRun = () => {
    setRuns([
      ...runs,
      {
        id: randomUUID(),
        runners: [],
        hosts: [],
        comments: [],
        estimate: "",
        game: "",
        category: "",
        platform: "",
        imageFile: null,
        order: 0,
      },
    ]);
  };

  const handleRemoveRun = (id: string) => {
    if (runs.length === 1) {
      toast({
        title: "Ops",
        description:
          "Você não pode remover essa run, pelo menos uma run deve existir.",
        variant: "destructive",
      });
      return;
    }
    setRuns(runs.filter((run) => run.id !== id));
  };

  const handleRunChange = (id: string, field: string, value: any) => {
    setRuns(
      runs.map((run) => {
        if (run.id === id) {
          if (
            field === "multipleRunners" &&
            value === false &&
            run.runners.length > 1
          ) {
            return {
              ...run,
              [field]: value,
              runners: run.runners.length > 0 ? [run.runners[0]] : [],
            };
          }
          return { ...run, [field]: value };
        }
        return run;
      })
    );
  };

  const removeRunner = (runId: string, runnerId: string) => {
    setRuns(
      runs.map((run) => {
        if (run.id === runId) {
          const newRunners = run.runners.filter(
            (runner) => runner.id !== runnerId
          );

          return {
            ...run,
            runners: newRunners,
          };
        }
        return run;
      })
    );
  };

  const removeHost = (runId: string, runnerId: string) => {
    setRuns(
      runs.map((run) => {
        if (run.id === runId) {
          const newHosts = run.hosts.filter((runner) => runner.id !== runnerId);

          return {
            ...run,
            hosts: newHosts,
          };
        }
        return run;
      })
    );
  };

  const removeComment = (runId: string, runnerId: string) => {
    setRuns(
      runs.map((run) => {
        if (run.id === runId) {
          const newComments = run.comments.filter(
            (runner) => runner.id !== runnerId
          );

          return {
            ...run,
            comments: newComments,
          };
        }
        return run;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = runs.every(
      (run) =>
        run.game && run.category && run.runners.length > 0 && run.estimate
    );

    console.log("Current runs", runs);

    if (!isValid) {
      toast({
        title: "Erro de validação",
        description:
          "Por favor, preencha todos os campos obrigatórios de todas as runs.",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting runs:", runs);
    updateEvent({
      ...event,
      runs: [...event.runs, ...runs],
    });

    toast({
      title: "Sucesso!",
      description: `${runs.length} run(s) foram adicionadas ao evento.`,
    });

    navigate(`/events/${event.id}/runs`);
  };

  return (
    <div className="container mx-auto md:gap-8 md:p-8">
      <Button variant="ghost" onClick={onBackButtonClick} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para: {event.name}
      </Button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Adicionar Runs</h1>
        <Button onClick={handleAddRun}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar runs
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {runs.map((run, index) => (
          <Card key={run.id} className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Run #{index + 1}</CardTitle>
                <CardDescription>Add details for this speedrun</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemoveRun(run.id!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`game-${run.id}`}>
                    Nome do jogo <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    id={`game-${run.id}`}
                    placeholder="The legend of zelda: Ocarina of time"
                    value={run.game}
                    onChange={(e) =>
                      handleRunChange(run.id!, "game", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`category-${run.id}`}>
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`category-${run.id}`}
                    placeholder="Any%, 100%, etc."
                    value={run.category}
                    onChange={(e) =>
                      handleRunChange(run.id!, "category", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`estimate-${run.id}`}>
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    Duração estimada <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`estimate-${run.id}`}
                    type="text"
                    placeholder="HH:MM:SS"
                    value={run.estimate}
                    onChange={(e) =>
                      handleRunChange(run.id!, "estimate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`estimate-${run.id}`}>
                    <Gamepad className="inline-block h-4 w-4 mr-1" />
                    Plataforma
                  </Label>
                  <Input
                    id={`platform-${run.id}`}
                    type="text"
                    placeholder="SNES, GBA, PS4, PC, etc."
                    value={run.platform}
                    onChange={(e) =>
                      handleRunChange(run.id!, "platform", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <Label htmlFor={`runners-${run.id}`}>
                      Runners <span className="text-red-500">*</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {run.runners?.map((runner) => (
                      <Badge
                        key={runner.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {runner.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => removeRunner(run.id!, runner.id!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <Select
                    onValueChange={(value) => {
                      if (
                        value &&
                        !run.runners.map((runner) => runner.id).includes(value)
                      ) {
                        const runner = membersStore.members.find(
                          (runner) => runner.id === value
                        );
                        if (!runner) return;

                        handleRunChange(run.id!, "runners", [
                          ...run.runners,
                          runner,
                        ]);
                      }
                    }}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar runner" />
                    </SelectTrigger>
                    <SelectContent>
                      {membersStore.members
                        .filter(
                          (runner) =>
                            !run.runners
                              .map((runner) => runner.id)
                              .includes(runner.id)
                        )
                        .map((runner) => (
                          <SelectItem key={runner.id} value={runner.id!}>
                            {runner.name} - (stream em: {runner.streamAt})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <Label htmlFor={`comments-${run.id}`}>Comentaristas</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {run.comments?.map((runner) => (
                      <Badge
                        key={runner.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {runner.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => removeComment(run.id!, runner.id!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <Select
                    onValueChange={(value) => {
                      if (
                        value &&
                        !run.comments.map((runner) => runner.id).includes(value)
                      ) {
                        const runner = membersStore.members.find(
                          (runner) => runner.id === value
                        );
                        if (!runner) return;

                        handleRunChange(run.id!, "comments", [
                          ...run.comments,
                          runner,
                        ]);
                      }
                    }}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar comentarista" />
                    </SelectTrigger>
                    <SelectContent>
                      {membersStore.members
                        .filter(
                          (runner) =>
                            !run.comments
                              .map((runner) => runner.id)
                              .includes(runner.id)
                        )
                        .map((runner) => (
                          <SelectItem key={runner.id} value={runner.id!}>
                            {runner.name} - (stream em: {runner.streamAt})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <Label htmlFor={`hosts-${run.id}`}>Hosts</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {run.hosts?.map((runner) => (
                      <Badge
                        key={runner.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {runner.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => removeHost(run.id!, runner.id!)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <Select
                    onValueChange={(value) => {
                      if (
                        value &&
                        !run.hosts.map((runner) => runner.id).includes(value)
                      ) {
                        const runner = membersStore.members.find(
                          (runner) => runner.id === value
                        );
                        if (!runner) return;

                        handleRunChange(run.id!, "hosts", [
                          ...run.hosts,
                          runner,
                        ]);
                      }
                    }}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar host" />
                    </SelectTrigger>
                    <SelectContent>
                      {membersStore.members
                        .filter(
                          (runner) =>
                            !run.hosts
                              .map((runner) => runner.id)
                              .includes(runner.id)
                        )
                        .map((runner) => (
                          <SelectItem key={runner.id} value={runner.id!}>
                            {runner.name} - (stream em: {runner.streamAt})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Runs
          </Button>
        </div>
      </form>
    </div>
  );
}
