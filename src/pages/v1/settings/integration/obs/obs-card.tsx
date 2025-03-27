import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { Monitor, Save, RefreshCcw } from "lucide-react";
import { useObs } from "@/hooks/use-obs";
import { useConfiguration } from "@/hooks/use-configuration";

const OBSIntegration = () => {
  const [websocketAddress, setWebsocketAddress] = useState("");
  const [websocketPassword, setWebsocketPassword] = useState("");
  const [version, setVersion] = useState("4");

  const { toast } = useToast();
  const { appendConfiguration, configuration } = useConfiguration();
  const { obsIsReady, setObsStoreState, obsStoreState } = useObs();

  useEffect(() => {
    if (obsStoreState.version) {
      setVersion(obsStoreState.version.toString());
    }
  }, []);

  const handleTestConnection = () => {
    if (window.obsService) {
      window.obsService
        .connect()
        .then((result) => {
          console.log("chegou ", result);
          if (result === true) {
            toast({
              title: "OBS",
              description: "Conexão com OBS estabelecida com sucesso!",
              variant: "default",
            });
            return;
          }

          let errorMessage = "Erro ao estabelecer conexão com OBS. ";
          if (result && result.error) {
            errorMessage += result.error;
          }

          toast({
            title: "Erro ao conectar",
            description: errorMessage,
            variant: "destructive",
          });
        })
        .catch(() => {
          toast({
            title: "Erro ao conectar",
            description: "Erro ao estabelecer conexão com OBS",
            variant: "destructive",
          });
        });
    }
  };

  useEffect(() => {
    if (configuration?.obs_ws_address) {
      setWebsocketAddress(configuration.obs_ws_address);
    }
    if (configuration?.obs_ws_password) {
      setWebsocketPassword(configuration.obs_ws_password);
    }
  }, [
    configuration,
    configuration?.obs_ws_address,
    configuration?.obs_ws_password,
  ]);

  const handleSave = () => {
    if (!websocketAddress || !websocketPassword) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const addressRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
    if (!addressRegex.test(websocketAddress)) {
      toast({
        title: "Formato inválido",
        description:
          "endereço do Websocket deve seguir o formato 127.0.0.1:0000",
        variant: "destructive",
      });
      return;
    }

    setObsStoreState({
      ...obsStoreState,
      version: parseInt(version) ?? 4,
    });

    appendConfiguration({
      obs_ws_address: websocketAddress,
      obs_ws_password: websocketPassword,
    });

    toast({
      title: "Configurações salvas",
      description: "Suas configurações de integração foram atualizadas.",
    });
  };

  return (
    <IntegrationCard
      title="OBS - Open Broadcast Software"
      description="Conecte-se com OBS para automações avançadas."
      icon={Monitor}
      iconColor="obs"
      footer={
        <div className="flex gap-2">
          <Button
            variant={obsIsReady ? "success" : "outline"}
            onClick={handleTestConnection}
          >
            Testar conexão
            <RefreshCcw className="ml-2 h-4 w-4" />
          </Button>

          <Button variant="default" onClick={handleSave}>
            Salvar configurações
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="form-element">
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              Versão do OBS
            </Label>
            <RadioGroup
              value={version}
              onValueChange={setVersion}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="obs-27" />
                <Label htmlFor="obs-27" className="cursor-pointer">
                  27.x
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="obs-28" />
                <Label htmlFor="obs-28" className="cursor-pointer">
                  28/29.x
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="form-element">
          <Label
            htmlFor="obs-websocket-address"
            className="text-sm font-medium"
          >
            Endereço do Websocket
          </Label>
          <Input
            id="obs-websocket-address"
            value={websocketAddress}
            onChange={(e) => setWebsocketAddress(e.target.value)}
            placeholder="127.0.0.1:4455"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato: 127.0.0.1:4455 (IP:PORTA)
          </p>
        </div>

        <div className="form-element">
          <Label
            htmlFor="obs-websocket-password"
            className="text-sm font-medium"
          >
            Senha do Websocket
          </Label>
          <Input
            id="obs-websocket-password"
            type="password"
            value={websocketPassword}
            onChange={(e) => setWebsocketPassword(e.target.value)}
            placeholder="Digite sua senha do websocket"
            className="mt-1.5"
          />
        </div>
      </div>
    </IntegrationCard>
  );
};

export default OBSIntegration;
