import { useState } from "react";
import { UseFieldArrayReturn } from "react-hook-form";
import { IFileTag, IFileTagActionModule, IFileTagExportFilesModule } from "@/domain";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActionExportFilesProps {
  action: IFileTagActionModule<IFileTagExportFilesModule>;
  index: number;
  fieldArray: UseFieldArrayReturn<IFileTag, "actions">;
}

export const ActionExportFiles = ({ action, index, fieldArray }: ActionExportFilesProps) => {
  const [value, setValue] = useState(action.module.value ?? "");

  const handleChangeSwitch = (checked: boolean) => {
    action.isEnabled = checked;
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
        <CardTitle className="text-sm font-medium">Export Files Action</CardTitle>
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
            id={`export-enabled-${index}`}
            checked={action.isEnabled}
            onCheckedChange={handleChangeSwitch}
          />
          <Label htmlFor={`export-enabled-${index}`}>Enable Action</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`export-value-${index}`}>Destination Folder Path</Label>
          <Input
            id={`export-value-${index}`}
            value={value}
            onChange={handleChangeValue}
            onBlur={handleBlurValue}
            disabled={!action.isEnabled}
            placeholder="e.g., D:\\SPIDIUM"
          />
        </div>

        {value === "" && (
          <Alert variant="destructive">
            <AlertDescription>
              You need to provide a path (e.g., D:\\SPIDIUM) for the files to be exported
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 