import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";
import {
  IFileTag,
  IFileTagActionModule,
  IFileTagTwitchModule,
  EFileTagActionComponentsTwitch,
} from "@/domain";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActionTwitchProps {
  action: IFileTagActionModule<IFileTagTwitchModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

export const ActionTwitch = ({ action, index, fieldArray }: ActionTwitchProps) => {
  const [value, setValue] = useState(action.module.value ?? "");

  const handleChangeSwitch = (checked: boolean) => {
    action.isEnabled = checked;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (value: string) => {
    action.module.component =
      value === EFileTagActionComponentsTwitch.UPDATE_TITLE
        ? EFileTagActionComponentsTwitch.UPDATE_TITLE
        : EFileTagActionComponentsTwitch.UPDATE_GAME;
    fieldArray.update(index, action);
  };

  const handleBlurValue = () => {
    action.module.value = value;
    fieldArray.update(index, action);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleRemove = () => {
    fieldArray.remove(index);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Twitch Action</CardTitle>
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
            id={`twitch-enabled-${index}`}
            checked={action.isEnabled}
            onCheckedChange={handleChangeSwitch}
          />
          <Label htmlFor={`twitch-enabled-${index}`}>Enable Action</Label>
        </div>

        <div className="space-y-2">
          <Label>Update Type</Label>
          <RadioGroup
            value={action.module.component}
            onValueChange={handleChangeRadioButton}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsTwitch.UPDATE_TITLE}
                id={`twitch-title-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`twitch-title-${index}`}>Title</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsTwitch.UPDATE_GAME}
                id={`twitch-game-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`twitch-game-${index}`}>Game</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`twitch-value-${index}`}>
            {action.module.component === EFileTagActionComponentsTwitch.UPDATE_TITLE
              ? "Title Update Template (Optional)"
              : "Game Update Template (Optional)"}
          </Label>
          <Input
            id={`twitch-value-${index}`}
            value={value}
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            disabled={!action.isEnabled}
            placeholder={
              action.module.component === EFileTagActionComponentsTwitch.UPDATE_TITLE
                ? "Title update template"
                : "Game update template"
            }
          />
        </div>

        {value === "" && (
          <Alert>
            <AlertDescription>
              If left blank, the default template from "Extensions / Default Templates" will be used
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 