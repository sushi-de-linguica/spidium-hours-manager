import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNightbot } from "@/hooks/use-nightbot";
import { useObs } from "@/hooks/use-obs";
import { AlertCircle, Check, CircleAlert } from "lucide-react";
import { useMemo } from "react";

export const Status = () => {
  const { obsIsReady, version } = useObs();
  const { isConnected: nightbotIsReady } = useNightbot();

  const hasError = useMemo(() => !obsIsReady || !nightbotIsReady, [obsIsReady]);
  const allError = useMemo(
    () => !obsIsReady && !nightbotIsReady,
    [obsIsReady, nightbotIsReady]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={allError ? "destructive" : hasError ? "warning" : "success"}
          size={"sm"}
        >
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
              className={nightbotIsReady ? "text-green-600" : "text-red-400"}
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
