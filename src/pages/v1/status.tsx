import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useObs } from "@/hooks/use-obs";
import { AlertCircle, Check, CircleAlert } from "lucide-react";
import { useMemo } from "react";

export const Status = () => {
  const { obsIsReady, version } = useObs();

  const hasError = useMemo(() => !obsIsReady, [obsIsReady]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={hasError ? "destructive" : "success"} size={"sm"}>
          {hasError && <AlertCircle />}
          {!hasError && <Check />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 mr-4">
        <div className="flex flex-col text-sm gap-2">
          <div className="flex flex-row items-center gap-2">
            <CircleAlert
              className={obsIsReady ? "text-green-600" : "text-red-400"}
            />
            <span className="ml-2">OBS (API v{version})</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <CircleAlert
              className={obsIsReady ? "text-green-600" : "text-red-400"}
            />
            <span className="ml-2">Nightbot</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <CircleAlert
              className={obsIsReady ? "text-green-600" : "text-red-400"}
            />
            <span className="ml-2">Twitch</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
