import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { ArrowRight, Save, Twitch } from "lucide-react";

const TwitchIntegration = () => {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const { toast } = useToast();

  const handleGetToken = () => {
    if (!clientId || !redirectUri) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGettingToken(true);

    // In a real app, this would redirect to Twitch OAuth endpoint
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=channel:read:subscriptions`;

    setTimeout(() => {
      window.open(twitchAuthUrl, "_blank");
      setIsGettingToken(false);
    }, 800);
  };

  const handleSave = () => {
    if (!clientId || !redirectUri) {
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
        description: "Your Twitch integration settings have been saved.",
      });
    }, 1000);
  };

  return (
    <IntegrationCard
      title="Twitch Integration"
      description="Connect your Twitch account for streaming features"
      icon={Twitch}
      iconColor="twitch"
      footer={
        <Button variant="default" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
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
            placeholder="Enter your Twitch Client ID"
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

        <div className="form-element pt-2">
          <Button
            variant="outline"
            className="text-twitch border-twitch/20 hover:bg-twitch/10 hover:text-twitch"
            onClick={handleGetToken}
            disabled={isGettingToken}
          >
            {isGettingToken ? "Redirecting..." : "Get Twitch Token"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </IntegrationCard>
  );
};

export default TwitchIntegration;
