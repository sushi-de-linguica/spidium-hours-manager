import IntegrationCard from "@/components/integrations-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfiguration } from "@/hooks/use-configuration";
import { useToast } from "@/hooks/use-toast";
import { Save, Twitch } from "lucide-react";
import { useEffect, useState } from "react";

export const TitlePage = () => {
  const [title, setTitle] = useState("");
  const { configuration, appendConfiguration } = useConfiguration();
  const { toast } = useToast();

  useEffect(() => {
    setTitle(configuration.seo_title_template ?? "");
  }, [configuration]);

  const handleSave = () => {
    if (!title) {
      return;
    }

    appendConfiguration({
      seo_title_template: title,
    });

    toast({
      title: "Configurações salvas",
      description: "Seu template de título da live foi configurado.",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <IntegrationCard
        title="Template de título da live"
        description="Ajuste automáticamente o titulo da live com base no template que você definir."
        icon={Twitch}
        iconColor="twitch"
        footer={
          <Button variant="default" onClick={handleSave}>
            Salvar configurações
            <Save className="ml-2 h-4 w-4" />
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="form-element">
            <Label htmlFor="page-title-id" className="text-sm font-medium">
              Título da Live
            </Label>
            <Input
              id="page-title-id"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite seu titulo da live (template)"
              className="mt-1.5"
            />
          </div>
        </div>
      </IntegrationCard>
    </div>
  );
};
