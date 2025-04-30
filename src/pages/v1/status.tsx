import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNightbot } from "@/hooks/use-nightbot";
import { useObs } from "@/hooks/use-obs";
import { useTwitch } from "@/hooks/use-twitch";
import { AlertCircle, Check, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Status = () => {
  const [loading, setLoading] = useState(true);

  const { obsIsReady, version } = useObs();
  const { isConnected: nightbotIsReady } = useNightbot();
  const { isConnected: twitchIsReady } = useTwitch();

  const handleRecreate = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };


  const hasError = useMemo(
    () => !obsIsReady || !nightbotIsReady || !twitchIsReady,
    [obsIsReady, nightbotIsReady, twitchIsReady]
  );

  const allError = useMemo(
    () => !obsIsReady && !nightbotIsReady && !twitchIsReady,
    [obsIsReady, nightbotIsReady, twitchIsReady]
  );

  useEffect(() => {
    window.addEventListener("status-update", handleRecreate);
    return () => {
      window.removeEventListener("status-update", handleRecreate);
    };
  }, []);

  return (
    loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
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
                className={twitchIsReady ? "text-green-600" : "text-red-400"}
              />
              <span className="ml-2">Twitch</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
  );
};
