import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { ArrowRight, Bot, RefreshCcw, Save } from "lucide-react";
import { useConfiguration } from "@/hooks/use-configuration";
import {
  getUrlToGetTokenFromNightbot,
  NightbotApiService,
} from "@/services/nightbot-service";
import { useNightbot } from "@/hooks/use-nightbot";

const NightbotIntegration = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isGettingToken, setIsGettingToken] = useState(false);
  const { toast } = useToast();

  const { appendConfiguration, configuration } = useConfiguration();
  const { isConnected, testConnection } = useNightbot();

  useEffect(() => {
    if (configuration) {
      setClientId(configuration.nightbot_client_id ?? "");
      setClientSecret(configuration.nightbot_client_secret ?? "");
      setRedirectUri(configuration.nightbot_redirect_uri ?? "");
    }
  }, [configuration]);

  const handleTestConnection = async () => {
    const success = await testConnection();

    if (!success) {
      toast({
        title: "Erro ao conectar com nightbot",
        description: "Verifique se o client id e secret estão corretos.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conexão com nightbot estabelecida com sucesso!",
      description: "Você pode agora atualizar seus comandos.",
      variant: "default",
    });
  };

  const handleGetToken = () => {
    if (!clientId || !clientSecret || !redirectUri) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsGettingToken(true);

    const URL = getUrlToGetTokenFromNightbot({
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    window.open(URL, "_blank");
    setTimeout(() => {
      setIsGettingToken(false);
    }, 800);
  };

  const isDisabledLoginButton = useMemo(
    () =>
      !configuration.nightbot_client_id ||
      !configuration.nightbot_client_secret ||
      !configuration.nightbot_redirect_uri,
    [configuration, configuration, appendConfiguration]
  );

  const handleSave = () => {
    if (!clientId || !clientSecret || !redirectUri) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são requeridos",
        variant: "destructive",
      });
      return;
    }

    appendConfiguration({
      nightbot_client_id: clientId,
      nightbot_client_secret: clientSecret,
      nightbot_redirect_uri: redirectUri,
    });

    toast({
      title: "Configurações salvas",
      description: "As configurações do nightbot foram atualizadas.",
    });
  };

  return (
    <IntegrationCard
      title="Nightbot"
      description="Conecte-se ao nightbot para poder atualizar seus comandos."
      icon={Bot}
      iconColor="nightbot"
      footer={
        <div className="flex gap-2">
          <Button
            variant={isConnected ? "success" : "outline"}
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
          <Label htmlFor="nightbot-client-id" className="text-sm font-medium">
            Client ID
          </Label>
          <Input
            id="nightbot-client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Digite seu Nightbot Client ID"
            className="mt-1.5"
          />
        </div>

        <div className="form-element">
          <Label
            htmlFor="nightbot-client-secret"
            className="text-sm font-medium"
          >
            Client Secret
          </Label>
          <Input
            id="nightbot-client-secret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Digite seu Nightbot Client Secret"
            className="mt-1.5"
          />
        </div>

        <div className="form-element">
          <Label
            htmlFor="nightbot-redirect-uri"
            className="text-sm font-medium"
          >
            Redirect URI
          </Label>
          <Input
            id="nightbot-redirect-uri"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder="https://yourdomain.com/auth/nightbot/callback"
            className="mt-1.5"
          />
        </div>

        <div className="form-element pt-2">
          <Button
            variant="outline"
            className="text-nightbot border-nightbot/20 hover:bg-nightbot/10 hover:text-nightbot"
            onClick={handleGetToken}
            disabled={isGettingToken || isDisabledLoginButton}
          >
            {isGettingToken ? "Redirecting..." : "Obter token do nightbot"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </IntegrationCard>
  );
};

export default NightbotIntegration;
