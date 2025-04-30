import { useState, useEffect } from "react";
import { randomUUID } from "crypto";
import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import {
  IFileTag,
  EFileTagAction,
  EFileTagActionComponentsNightbot,
  EFileTagActionComponentsObs,
  EFileTagActionComponentsTwitch,
  EFileTagActionComponentsExportFiles,
} from "@/domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Check, Copy } from "lucide-react";
import { ActionNightbot } from "./action-nightbot";
import { ActionObs } from "./action-obs";
import { ActionTwitch } from "./action-twitch";
import { ActionExportFiles } from "./action-export-files";
import { useFile } from "@/hooks/use-file";

const defaultData: IFileTag = {
  id: "",
  actions: [],
  label: "",
  description: "",
  path: "",
  variant: "",
  color: "",
  minimumRunnersToShow: 0,
  isRequiredConfirmation: false,
  isShow: true,
};

interface ActionFormProps {
  showEditMode: boolean;
  action: IFileTag | null;
  onClose?: () => void;
}

const buttonStyles = {
  solid: {
    red: "bg-red-500 hover:bg-red-600 text-white",
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
    gray: "bg-gray-500 hover:bg-gray-600 text-white",
  },
  outline: {
    red: "border border-red-500 text-red-500 hover:bg-red-50",
    blue: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    green: "border border-green-500 text-green-500 hover:bg-green-50",
    yellow: "border border-yellow-500 text-yellow-500 hover:bg-yellow-50",
    purple: "border border-purple-500 text-purple-500 hover:bg-purple-50",
    gray: "border border-gray-500 text-gray-500 hover:bg-gray-50",
  },
  ghost: {
    red: "text-red-500 hover:bg-red-50",
    blue: "text-blue-500 hover:bg-blue-50",
    green: "text-green-500 hover:bg-green-50",
    yellow: "text-yellow-500 hover:bg-yellow-50",
    purple: "text-purple-500 hover:bg-purple-50",
    gray: "text-gray-500 hover:bg-gray-50",
  },
};

const getButtonStyles = (variant: string, color: string) => {
  const styles = buttonStyles[variant as keyof typeof buttonStyles]?.[color as keyof typeof buttonStyles.solid] || "";
  return styles;
};

export const ActionForm = ({ showEditMode, action, onClose }: ActionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("data");
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);
  const { addTag, updateTag } = useFile();

  const formContext = useForm<IFileTag>({
    defaultValues: defaultData,
  });

  const [variant, color] = useWatch({
    control: formContext.control,
    name: ["variant", "color"],
  }) as [string, string];

  const fieldArray = useFieldArray({
    name: "actions",
    control: formContext.control,
  });

  useEffect(() => {
    if (action) {
      formContext.reset(action);
    } else {
      formContext.reset(defaultData);
    }
  }, [action, formContext]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
    setSelectedTab("data");
    formContext.reset(defaultData);
  };

  const handleClone = () => {
    if (action) {
      const clonedAction = {
        ...action,
        id: randomUUID(),
        label: `${action.label} (Copy)`,
      };
      addTag(clonedAction);
      toast.success("Action button cloned successfully");
      setShowCloneConfirm(false);
      handleClose();
    }
  };

  const onSubmit = (data: IFileTag) => {
    if (!data.id) {
      data.id = randomUUID();
    }

    if (showEditMode) {
      updateTag(data);
      toast.success("Action button updated successfully");
    } else {
      addTag(data);
      toast.success("Action button created successfully");
    }
    handleClose();
  };

  const handleAddAction = (action: EFileTagAction) => {
    switch (action) {
      case EFileTagAction.NIGHTBOT:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.NIGHTBOT,
            component: EFileTagActionComponentsNightbot.UPDATE_COMMAND,
            configurationCommandField: "",
            template: "",
          },
        });
        break;
      case EFileTagAction.OBS:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.OBS,
            component: EFileTagActionComponentsObs.SET_BROWSER_SOURCE,
            value: "",
            resourceName: "",
          },
        });
        break;
      case EFileTagAction.TWITCH:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.TWITCH,
            component: EFileTagActionComponentsTwitch.UPDATE_TITLE,
            value: "",
          },
        });
        break;
      case EFileTagAction.EXPORT_FILES:
        fieldArray.append({
          isEnabled: false,
          module: {
            action: EFileTagAction.EXPORT_FILES,
            component: EFileTagActionComponentsExportFiles.EXPORT_ALL,
            value: "",
          },
        });
        break;
    }
  };

  return (
    <FormProvider {...formContext}>
      <Button
        variant="default"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Action Button
      </Button>

      <Dialog open={isOpen || showEditMode} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showEditMode ? "Edit Action Button" : "Add Action Button"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="style">Button Style</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Button Name</Label>
                  <Input
                    id="label"
                    {...formContext.register("label")}
                    placeholder="Enter button name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    {...formContext.register("description")}
                    placeholder="Enter description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumRunnersToShow">
                    Minimum Runners to Show Button
                  </Label>
                  <Input
                    id="minimumRunnersToShow"
                    type="number"
                    {...formContext.register("minimumRunnersToShow")}
                    placeholder="e.g., 4"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRequiredConfirmation"
                    {...formContext.register("isRequiredConfirmation")}
                  />
                  <Label htmlFor="isRequiredConfirmation">
                    Show Action Confirmation Alert
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isShow"
                    {...formContext.register("isShow")}
                  />
                  <Label htmlFor="isShow">Show Button</Label>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variant">Button Variant</Label>
                  <Select
                    value={variant}
                    onValueChange={(value) => formContext.setValue("variant", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Button Color</Label>
                  <Select
                    value={color}
                    onValueChange={(value) => formContext.setValue("color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Button Preview</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={variant as any}
                      data-variant={variant}
                      data-color={color}
                      className={getButtonStyles(variant, color)}
                    >
                      {formContext.watch("label") || "Button"}
                    </Button>
                    <Button
                      variant={variant as any}
                      data-variant={variant}
                      data-color={color}
                      className={getButtonStyles(variant, color)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {formContext.watch("label") || "Button"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddAction(EFileTagAction.NIGHTBOT)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nightbot
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddAction(EFileTagAction.OBS)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    OBS
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddAction(EFileTagAction.TWITCH)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Twitch
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddAction(EFileTagAction.EXPORT_FILES)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Export Files
                  </Button>
                </div>

                <div className="space-y-4">
                  {fieldArray.fields.map((field, index) => {
                    switch (field.module.action) {
                      case EFileTagAction.NIGHTBOT:
                        return (
                          <ActionNightbot
                            key={field.id}
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                          />
                        );
                      case EFileTagAction.OBS:
                        return (
                          <ActionObs
                            key={field.id}
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                          />
                        );
                      case EFileTagAction.TWITCH:
                        return (
                          <ActionTwitch
                            key={field.id}
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                          />
                        );
                      case EFileTagAction.EXPORT_FILES:
                        return (
                          <ActionExportFiles
                            key={field.id}
                            action={field as any}
                            index={index}
                            fieldArray={fieldArray}
                          />
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              {showEditMode && action && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowCloneConfirm(true)}
                >
                  <Copy className="h-4 w-4" />
                  Clone Button
                </Button>
              )}
              <Button type="submit">
                {showEditMode ? "Save Changes" : "Create Button"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloneConfirm} onOpenChange={setShowCloneConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Action Button</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to clone this action button? A new button will be created with the same settings.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleClone}>Clone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}; 