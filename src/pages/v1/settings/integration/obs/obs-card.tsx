import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import IntegrationCard from "@/components/integrations-card";
import { Monitor, Save } from "lucide-react";

const OBSIntegration = () => {
  const [websocketAddress, setWebsocketAddress] = useState("");
  const [websocketPassword, setWebsocketPassword] = useState("");
  const [version, setVersion] = useState("27");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!websocketAddress || !websocketPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate websocket address format
    const addressRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
    if (!addressRegex.test(websocketAddress)) {
      toast({
        title: "Invalid Format",
        description: "Websocket address must be in format 127.0.0.1:0000",
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
        description: "Your OBS integration settings have been saved.",
      });
    }, 1000);
  };

  return (
    <IntegrationCard
      title="OBS Integration"
      description="Connect to Open Broadcast Software for streaming control"
      icon={Monitor}
      iconColor="obs"
      footer={
        <Button variant="default" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="form-element">
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              OBS Version
            </Label>
            <RadioGroup
              value={version}
              onValueChange={setVersion}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="27" id="obs-27" />
                <Label htmlFor="obs-27" className="cursor-pointer">
                  27.x
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="28" id="obs-28" />
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
            Websocket Address
          </Label>
          <Input
            id="obs-websocket-address"
            value={websocketAddress}
            onChange={(e) => setWebsocketAddress(e.target.value)}
            placeholder="127.0.0.1:4455"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Format: 127.0.0.1:4455 (IP:PORT)
          </p>
        </div>

        <div className="form-element">
          <Label
            htmlFor="obs-websocket-password"
            className="text-sm font-medium"
          >
            Websocket Password
          </Label>
          <Input
            id="obs-websocket-password"
            type="password"
            value={websocketPassword}
            onChange={(e) => setWebsocketPassword(e.target.value)}
            placeholder="Enter your OBS Websocket Password"
            className="mt-1.5"
          />
        </div>
      </div>
    </IntegrationCard>
  );
};

export default OBSIntegration;
