import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";
import {
  IFileTag,
  IFileTagActionModule,
  IFileTagObsModule,
  EFileTagActionComponentsObs,
} from "@/domain";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ActionObsProps {
  action: IFileTagActionModule<IFileTagObsModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

export const ActionObs = ({ action, index, fieldArray }: ActionObsProps) => {
  const [value, setValue] = useState(action.module.value ?? "");
  const [resourceName, setResourceName] = useState(action.module.resourceName ?? "");

  const handleChangeSwitch = (checked: boolean) => {
    action.isEnabled = checked;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (value: string) => {
    action.module.component =
      value === EFileTagActionComponentsObs.CHANGE_SCENE
        ? EFileTagActionComponentsObs.CHANGE_SCENE
        : EFileTagActionComponentsObs.SET_BROWSER_SOURCE;
    fieldArray.update(index, action);
  };

  const handleBlurValue = () => {
    action.module.value = value;
    fieldArray.update(index, action);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlurResourceName = () => {
    action.module.resourceName = resourceName;
    fieldArray.update(index, action);
  };

  const handleChangeResourceName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResourceName(event.target.value);
  };

  const handleRemove = () => {
    fieldArray.remove(index);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">OBS Action</CardTitle>
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
            id={`obs-enabled-${index}`}
            checked={action.isEnabled}
            onCheckedChange={handleChangeSwitch}
          />
          <Label htmlFor={`obs-enabled-${index}`}>Enable Action</Label>
        </div>

        <div className="space-y-2">
          <Label>Action Type</Label>
          <RadioGroup
            value={action.module.component}
            onValueChange={handleChangeRadioButton}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.SET_BROWSER_SOURCE}
                id={`obs-browser-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-browser-${index}`}>Update Browser</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.CHANGE_SCENE}
                id={`obs-scene-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-scene-${index}`}>Change Scene</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`obs-value-${index}`}>
            {action.module.component === EFileTagActionComponentsObs.SET_BROWSER_SOURCE
              ? "Browser URL Template (Optional)"
              : "Scene Name"}
          </Label>
          <Input
            id={`obs-value-${index}`}
            value={value}
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            disabled={!action.isEnabled}
            placeholder={
              action.module.component === EFileTagActionComponentsObs.SET_BROWSER_SOURCE
                ? "Default is multitwitch player"
                : "Enter scene name in OBS"
            }
          />
        </div>

        {action.module.component === EFileTagActionComponentsObs.SET_BROWSER_SOURCE && (
          <div className="space-y-2">
            <Label htmlFor={`obs-resource-${index}`}>Browser Source Name</Label>
            <Input
              id={`obs-resource-${index}`}
              value={resourceName}
              onChange={handleChangeResourceName}
              onBlur={handleBlurResourceName}
              disabled={!action.isEnabled}
              placeholder="Enter browser source name"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 