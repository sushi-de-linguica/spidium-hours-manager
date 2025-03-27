import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { ArrowRight, Bot, Save } from "lucide-react";

const NightbotIntegration = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const { toast } = useToast();

  const handleGetToken = () => {
    if (!clientId || !clientSecret || !redirectUri) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGettingToken(true);

    // In a real app, this would redirect to Nightbot OAuth endpoint
    const nightbotAuthUrl = `https://api.nightbot.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=channel`;

    setTimeout(() => {
      window.open(nightbotAuthUrl, "_blank");
      setIsGettingToken(false);
    }, 800);
  };

  const handleSave = () => {
    if (!clientId || !clientSecret || !redirectUri) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your Nightbot integration settings have been saved.",
      });
    }, 1000);
  };

  return (
    <IntegrationCard
      title="Nightbot Integration"
      description="Connect your Nightbot account for chat moderation"
      icon={Bot}
      iconColor="nightbot"
      footer={
        <Button variant="default" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
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
            placeholder="Enter your Nightbot Client ID"
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
            placeholder="Enter your Nightbot Client Secret"
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
            disabled={isGettingToken}
          >
            {isGettingToken ? "Redirecting..." : "Get Nightbot Token"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </IntegrationCard>
  );
};

export default NightbotIntegration;
