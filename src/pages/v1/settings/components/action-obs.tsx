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

  const component = action.module.component;
  const isBrowserSource =
    component === EFileTagActionComponentsObs.SET_BROWSER_SOURCE;
  const isChangeScene = component === EFileTagActionComponentsObs.CHANGE_SCENE;
  const isSceneItemVisibility =
    component === EFileTagActionComponentsObs.TOGGLE_ELEMENT_VISIBILITY ||
    component === EFileTagActionComponentsObs.SET_ELEMENT_VISIBLE ||
    component === EFileTagActionComponentsObs.SET_ELEMENT_HIDDEN;
  const isToggleVisibility =
    component === EFileTagActionComponentsObs.TOGGLE_ELEMENT_VISIBILITY;
  const isSetElementVisible =
    component === EFileTagActionComponentsObs.SET_ELEMENT_VISIBLE;
  const isSetElementHidden =
    component === EFileTagActionComponentsObs.SET_ELEMENT_HIDDEN;
  const isToggleAudioMute =
    component === EFileTagActionComponentsObs.TOGGLE_AUDIO_MUTE;

  const showValueField = isBrowserSource || isChangeScene || isSceneItemVisibility;
  const showResourceField =
    isBrowserSource || isSceneItemVisibility || isToggleAudioMute;

  const handleChangeSwitch = (checked: boolean) => {
    action.isEnabled = checked;
    fieldArray.update(index, action);
  };

  const handleChangeRadioButton = (selected: string) => {
    action.module.component = selected as EFileTagActionComponentsObs;
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

  const valueLabel = isBrowserSource
    ? "Browser URL Template (Optional)"
    : "Scene Name";

  const valuePlaceholder = isBrowserSource
    ? "Default is multitwitch player"
    : "Enter scene name in OBS";

  const resourceLabel = isBrowserSource
    ? "Browser Source Name"
    : isToggleAudioMute
      ? "Audio Input Name"
      : "Scene Item / Source Name";

  const resourcePlaceholder = isBrowserSource
    ? "Enter browser source name"
    : isToggleAudioMute
      ? "Enter audio source name in OBS"
      : "Enter scene item name in OBS";

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
            value={component}
            onValueChange={handleChangeRadioButton}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.TOGGLE_ELEMENT_VISIBILITY}
                id={`obs-toggle-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-toggle-${index}`}>Toggle Visibility</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.SET_ELEMENT_VISIBLE}
                id={`obs-show-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-show-${index}`}>Force Show</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.SET_ELEMENT_HIDDEN}
                id={`obs-hide-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-hide-${index}`}>Force Hide</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={EFileTagActionComponentsObs.TOGGLE_AUDIO_MUTE}
                id={`obs-mute-${index}`}
                disabled={!action.isEnabled}
              />
              <Label htmlFor={`obs-mute-${index}`}>Toggle Mute</Label>
            </div>
          </RadioGroup>
        </div>

        {showValueField && (
          <div className="space-y-2">
            <Label htmlFor={`obs-value-${index}`}>{valueLabel}</Label>
            <Input
              id={`obs-value-${index}`}
              value={value}
              onChange={handleChangeValue}
              onBlur={handleBlurValue}
              disabled={!action.isEnabled}
              placeholder={valuePlaceholder}
            />
          </div>
        )}

        {showResourceField && (
          <div className="space-y-2">
            <Label htmlFor={`obs-resource-${index}`}>{resourceLabel}</Label>
            <Input
              id={`obs-resource-${index}`}
              value={resourceName}
              onChange={handleChangeResourceName}
              onBlur={handleBlurResourceName}
              disabled={!action.isEnabled}
              placeholder={resourcePlaceholder}
            />
          </div>
        )}

        {isToggleVisibility && (
          <p className="text-xs text-muted-foreground">
            Inverte a visibilidade atual (oculto ↔ visível) a cada execução.
          </p>
        )}

        {isSetElementVisible && (
          <p className="text-xs text-muted-foreground">
            Sempre exibe o item na cena, mesmo que já esteja visível.
          </p>
        )}

        {isSetElementHidden && (
          <p className="text-xs text-muted-foreground">
            Sempre oculta o item na cena, mesmo que já esteja oculto.
          </p>
        )}

        {isToggleAudioMute && (
          <p className="text-xs text-muted-foreground">
            A cada execução, alterna mute/unmute do input de áudio no OBS (nome
            global do source, ex.: microfone ou desktop audio).
          </p>
        )}
      </CardContent>
    </Card>
  );
};
