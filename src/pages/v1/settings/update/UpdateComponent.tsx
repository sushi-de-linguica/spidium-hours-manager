import { ipcRenderer } from "electron";
import type { ProgressInfo } from "electron-updater";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UpdateComponent = () => {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => ipcRenderer.invoke("start-download"),
  });

  const checkUpdate = async () => {
    setChecking(true);
    const result = await ipcRenderer.invoke("check-update");
    setProgressInfo({ percent: 0 });
    setChecking(false);
    setModalOpen(true);
    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1);
      setUpdateError(undefined);
      if (arg1.update) {
        setModalBtn((state) => ({
          ...state,
          cancelText: "Cancelar",
          okText: "Atualizar",
          onOk: () => ipcRenderer.invoke("start-download"),
        }));
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(arg1);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      setProgressInfo(arg1);
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      setProgressInfo({ percent: 100 });
      setModalBtn((state) => ({
        ...state,
        cancelText: "Mais tarde",
        okText: "Instalar agora",
        onOk: () => ipcRenderer.invoke("quit-and-install"),
      }));
    },
    []
  );

  useEffect(() => {
    ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    ipcRenderer.on("update-error", onUpdateError);
    ipcRenderer.on("download-progress", onDownloadProgress);
    ipcRenderer.on("update-downloaded", onUpdateDownloaded);

    return () => {
      ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      ipcRenderer.off("update-error", onUpdateError);
      ipcRenderer.off("download-progress", onDownloadProgress);
      ipcRenderer.off("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Atualizações do Sistema</CardTitle>
          <CardDescription>
            Verifique e instale as últimas atualizações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {updateError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Erro ao baixar a última versão: {updateError.message}
                </AlertDescription>
              </Alert>
            )}

            {updateAvailable ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    Nova versão disponível: v{versionInfo?.newVersion}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Atualizando de v{versionInfo?.version} para v{versionInfo?.newVersion}
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Progresso da atualização</div>
                  <Progress value={progressInfo?.percent} className="h-2" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={modalBtn?.onCancel}
                    disabled={checking}
                  >
                    {modalBtn?.cancelText}
                  </Button>
                  <Button
                    onClick={modalBtn?.onOk}
                    disabled={checking}
                  >
                    {modalBtn?.okText}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Você está usando a versão mais recente</span>
              </div>
            )}

            <Button
              onClick={checkUpdate}
              disabled={checking}
              className="w-full sm:w-auto"
            >
              {checking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar atualizações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateComponent; 