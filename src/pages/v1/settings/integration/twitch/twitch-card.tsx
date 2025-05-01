import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { ArrowRight, Eye, EyeOff, Key, RefreshCcw, Save, Twitch } from "lucide-react";
import { useTwitch } from "@/hooks/use-twitch";
import { useConfiguration } from "@/hooks/use-configuration";
import { getUrlToGetTokenFromTwitch } from "@/services/twitch-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const TwitchIntegration = () => {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const { isConnected, testConnection, appendState, twitchStore } = useTwitch();
  const { configuration, appendConfiguration } = useConfiguration();
  const { toast } = useToast();

  useEffect(() => {
    setClientId(configuration.twitch_client_id ?? "");
    setRedirectUri(configuration.twitch_redirect_uri ?? "");
    setManualToken(twitchStore.access_token ?? "");
  }, [configuration, twitchStore]);

  const isDisabledTwitchLoginButton = useMemo(
    () => !configuration.twitch_client_id || !configuration.twitch_redirect_uri,
    [configuration]
  );

  const handleTestConnection = async () => {
    const success = await testConnection();

    if (!success) {
      toast({
        title: "Erro ao conectar com a twitch",
        description: "Verifique se o client id e secret estão corretos.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conexão com twitch estabelecida com sucesso!",
      description: "Você pode agora atualizar os dados da twitch.",
      variant: "default",
    });
  };

  const handleGetToken = () => {
    if (!clientId || !redirectUri) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingToken(true);
    const URL = getUrlToGetTokenFromTwitch({
      client_id: configuration.twitch_client_id,
      redirect_uri: configuration.twitch_redirect_uri,
    });

    window.open(URL, "_blank");
    setTimeout(() => {
      setIsGettingToken(false);
    }, 800);
  };

  const handleSave = () => {
    if (!clientId || !redirectUri) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    appendState({
      client_id: clientId,
    });

    appendConfiguration({
      twitch_client_id: clientId,
      twitch_redirect_uri: redirectUri,
    });

    toast({
      title: "Configurações salvas",
      description: "Sua twitch foi configurada.",
    });
  };

  const handleSaveManualToken = () => {
    if (!manualToken) {
      toast({
        title: "Erro de validação",
        description: "O token é obrigatório",
        variant: "destructive",
      });
      return;
    }

    appendState({
      access_token: manualToken,
    });

    setIsTokenModalOpen(false);
    toast({
      title: "Token atualizado",
      description: "O token da twitch foi atualizado com sucesso.",
    });
  };

  return (
    <>
      <IntegrationCard
        title="Twitch"
        description="Conecte-se a sua conta da Twitch para gerenciar titulos da live."
        icon={Twitch}
        iconColor="twitch"
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
            <Label htmlFor="twitch-client-id" className="text-sm font-medium">
              Client ID
            </Label>
            <Input
              id="twitch-client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Digite seu Twitch Client ID"
              className="mt-1.5"
            />
          </div>

          <div className="form-element">
            <Label htmlFor="twitch-redirect-uri" className="text-sm font-medium">
              Redirect URI
            </Label>
            <Input
              id="twitch-redirect-uri"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="https://yourdomain.com/auth/twitch/callback"
              className="mt-1.5"
            />
          </div>

          <div className="form-element pt-2 flex gap-2">
            <Button
              variant="outline"
              className="text-twitch border-twitch/20 hover:bg-twitch/10 hover:text-twitch"
              onClick={handleGetToken}
              disabled={isGettingToken || isDisabledTwitchLoginButton}
            >
              {isGettingToken ? "Redirecionando..." : "Obter token da twitch"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="text-twitch border-twitch/20 hover:bg-twitch/10 hover:text-twitch"
              onClick={() => setIsTokenModalOpen(true)}
            >
              Definir token manualmente
              <Key className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </IntegrationCard>

      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir token da Twitch</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Token
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  type={showToken ? "text" : "password"}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  className="h-10 w-10"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTokenModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveManualToken}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwitchIntegration;
