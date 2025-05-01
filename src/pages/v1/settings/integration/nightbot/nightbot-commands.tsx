import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useConfiguration } from "@/hooks/use-configuration";
import { useNightbot } from "@/hooks/use-nightbot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INightbotCommandModel } from "@/domain";

interface NightbotCommand {
  _id: string;
  name: string;
}

export const NightbotCommands = () => {
  const [commands, setCommands] = useState<NightbotCommand[]>([]);
  const [selectedRunnerCommand, setSelectedRunnerCommand] = useState<NightbotCommand | null>(null);
  const [selectedCommentatorCommand, setSelectedCommentatorCommand] = useState<NightbotCommand | null>(null);
  const [selectedHostCommand, setSelectedHostCommand] = useState<NightbotCommand | null>(null);
  const { toast } = useToast();
  const { appendConfiguration, configuration } = useConfiguration();
  const { getCommands } = useNightbot();

  const fetchCommands = async () => {
    try {
      const fetchedCommands = await getCommands();
      console.log('fetchedCommands', fetchedCommands);
      setCommands(fetchedCommands.data.commands);
    } catch (error) {
      toast({
        title: "Erro ao buscar comandos",
        description: "Não foi possível carregar os comandos do Nightbot.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (configuration?.nightbot_token) {
      fetchCommands();
    }
  }, []);

  useEffect(() => {
    if (commands.length > 0) {
      setSelectedRunnerCommand(configuration?.nightbot_runner_command_id);
      setSelectedCommentatorCommand(configuration?.nightbot_commentator_command);
      setSelectedHostCommand(configuration?.nightbot_host_command);
    }
  }, [commands])

  const handleSaveCommands = () => {
    appendConfiguration({
      nightbot_runner_command_id: selectedRunnerCommand as INightbotCommandModel,
      nightbot_commentator_command: selectedCommentatorCommand as INightbotCommandModel,
      nightbot_host_command: selectedHostCommand as INightbotCommandModel,
    });

    toast({
      title: "Comandos salvos",
      description: "As configurações dos comandos foram atualizadas.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="form-element">
        <Label htmlFor="runner-command" className="text-sm font-medium">
          Comando para Runners
        </Label>
        <Select
          value={selectedRunnerCommand?._id}
          onValueChange={(value) => {
            setSelectedRunnerCommand(commands.find((command) => command._id === value) || null);
          }}
        >
          <SelectTrigger id="runner-command" className="mt-1.5">
            <SelectValue placeholder="Selecione o comando para runners" />
          </SelectTrigger>
          <SelectContent>
            {commands.map((command) => (
              <SelectItem key={command._id} value={command._id}>
                {command.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="form-element">
        <Label htmlFor="commentator-command" className="text-sm font-medium">
          Comando para Comentaristas
        </Label>
        <Select
          value={selectedCommentatorCommand?._id}
          onValueChange={(value) => {
            setSelectedCommentatorCommand(commands.find((command) => command._id === value) || null);
          }}
        >
          <SelectTrigger id="commentator-command" className="mt-1.5">
            <SelectValue placeholder="Selecione o comando para comentaristas" />
          </SelectTrigger>
          <SelectContent>
            {commands.map((command) => (
              <SelectItem key={command._id} value={command._id}>
                {command.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="form-element">
        <Label htmlFor="host-command" className="text-sm font-medium">
          Comando para Hosts
        </Label>
        <Select
          value={selectedHostCommand?._id}
          onValueChange={(value) => setSelectedHostCommand(commands.find((command) => command._id === value) || null)}
        >
          <SelectTrigger id="host-command" className="mt-1.5">
            <SelectValue placeholder="Selecione o comando para hosts" />
          </SelectTrigger>
          <SelectContent>
            {commands.map((command) => (
              <SelectItem key={command._id} value={command._id}>
                {command.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="form-element pt-2">
        <Button onClick={handleSaveCommands}>
          Salvar comandos
        </Button>
      </div>
    </div>
  );
}; 