import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";
import { IFileTag, IFileTagActionModule, IFileTagNightbotModule } from "@/domain";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ActionNightbotProps {
  action: IFileTagActionModule<IFileTagNightbotModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

export const ActionNightbot = ({ action, index, fieldArray }: ActionNightbotProps) => {
  const [template, setTemplate] = useState(action.module.template ?? "");

  const handleChangeSwitch = (checked: boolean) => {
    action.isEnabled = checked;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (value: string) => {
    action.module.configurationCommandField = value;
    fieldArray.update(index, action);
  };

  const handleBlurTemplate = () => {
    action.module.template = template;
    fieldArray.update(index, action);
  };

  const handleChangeTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate(event.target.value);
  };

  const handleRemove = () => {
    fieldArray.remove(index);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Nightbot Action</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`nightbot-enabled-${index}`}
            checked={action.isEnabled}
            onCheckedChange={handleChangeSwitch}
          />
          <Label htmlFor={`nightbot-enabled-${index}`}>Enable Action</Label>
        </div>

        <div className="space-y-2">
          <Label>Command Type</Label>
          <RadioGroup
            value={action.module.configurationCommandField}
            onValueChange={handleChangeRadioButton}
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="nightbot_runner_command_id"
                id={`nightbot-runner-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`nightbot-runner-${index}`}>Runner</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="nightbot_host_command"
                id={`nightbot-host-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`nightbot-host-${index}`}>Host</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="nightbot_commentator_command"
                id={`nightbot-commentator-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`nightbot-commentator-${index}`}>Commentary</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`nightbot-template-${index}`}>Template (Optional)</Label>
          <Input
            id={`nightbot-template-${index}`}
            value={template}
            onChange={handleChangeTemplate}
            onBlur={handleBlurTemplate}
            disabled={!action.isEnabled}
            placeholder="Enter template"
          />
        </div>
      </CardContent>
    </Card>
  );
}; 