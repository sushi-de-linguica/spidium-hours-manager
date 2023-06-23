// src/components/RunManager.tsx
import { ReactNode, SyntheticEvent, useEffect, useState, useMemo } from "react";
import { Alert, Box, Button, Tab, Tabs } from "@mui/material";

import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PeopleIcon from "@mui/icons-material/People";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExtensionIcon from "@mui/icons-material/Extension";

import { RunsTab } from "./tabs/runs";
import { FilesTab } from "./tabs/files";
import { MembersTab } from "./tabs/member";
import { DataExportImportTab } from "./tabs/data-export-import";
import { OptionsTab } from "./tabs/options";
import { INightbotStore, useConfigurationStore, useNightbot } from "@/stores";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ObsWebsocketService } from "@/services/obs-service";
import { Status } from "./components/status";
import { ipcRenderer } from "electron";
import { useObsStore } from "@/stores/slices/obs";
import { EProtocolEvents } from "@/domain";
import { NightbotApiService } from "@/services/nightbot-service";
import { toast } from "react-toastify";
import { EventsTab } from "./tabs/events";
import { testId } from "./options";
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RunManagerPage = () => {
  const [value, setValue] = useState(0);
  const { access_token } = useNightbot((store: INightbotStore) => store.state);
  const [obsIsReady, setObsIsReady] = useState(false);
  const [listenersAttached, setListenersAttached] = useState(false);
  const { version } = useObsStore((store) => store.state);

  const nightbotStore = useNightbot();
  const { updateConfiguration, state } = useConfigurationStore();

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleObsReady = () => setObsIsReady(true);
  const handleObsNotReady = () => setObsIsReady(false);

  const handleAttachListeners = () => {
    if (!listenersAttached) {
      ipcRenderer.on("AuthenticationSuccess", handleObsReady);
      ipcRenderer.on("AuthenticationFailure", handleObsNotReady);
      ipcRenderer.on("ConnectionOpened", handleObsReady);
      ipcRenderer.on("ConnectionClosed", handleObsNotReady);
      ipcRenderer.on("Identified", handleObsReady);
      ipcRenderer.on("error", handleObsNotReady);

      ipcRenderer.on("DESTROY_OBS", () => {
        setObsIsReady(false);
      });

      setListenersAttached(true);
    }
  };

  const handleRemoveAttachedListeners = () => {
    ipcRenderer.removeListener("AuthenticationSuccess", handleObsReady);
    ipcRenderer.removeListener("ConnectionOpened", handleObsReady);
    ipcRenderer.removeListener("AuthenticationFailure", handleObsNotReady);
    ipcRenderer.removeListener("ConnectionClosed", handleObsNotReady);
    ipcRenderer.removeListener("error", handleObsNotReady);
    setListenersAttached(false);
  };

  const handleProtocolCallback = (callback: string, value: string) => {
    switch (callback) {
      case "nightbot_token":
        console.log("updated nightbot token");

        updateConfiguration({
          ...state,
          nightbot_token: value,
        });

        nightbotStore.setState({
          ...nightbotStore.state,
          access_token: value,
        });

        setTimeout(() => {
          const service = new NightbotApiService();
          service.getCommands().then(({ data }) => {
            console.log("commands list", data);
            toast.success("Conexão com nightbot validada com sucesso!");
          });
        }, 500);

        break;
    }
  };

  const handleShmProtocolData = (_event: any, protocolUrl: any) => {
    console.log("protocolUrl", protocolUrl);
    try {
      const url = new URL(protocolUrl);
      if (!url) {
        return;
      }

      const callback = url.searchParams.get("callback");
      const value = url.searchParams.get("value");

      if (callback && value) {
        handleProtocolCallback(callback, value);
      }
    } catch (error) {
      console.log("[shm protocol error]:", error);
    }
  };

  useEffect(() => {
    console.log("started at OBS WEBSOCKET VERSION", version);
    handleAttachListeners();

    ipcRenderer.on(EProtocolEvents.SHM_PROTOCOL_DATA, handleShmProtocolData);

    if (!window.obsService) {
      window.obsService = new ObsWebsocketService(version);
    }

    return () => {
      handleRemoveAttachedListeners();
    };
  }, []);

  useEffect(() => {
    console.log("obsIsReady", obsIsReady);
  }, [obsIsReady]);

  const obsServiceVersion = useMemo(() => version, [version]);

  useEffect(() => {
    if (!!window.obsService) {
      window.obsService.disconnect();
    }
    window.obsService = new ObsWebsocketService(version);
  }, [obsServiceVersion]);

  return (
    <>
      <Status
        obs={obsIsReady ? "success" : "error"}
        nightbot={access_token !== "" ? "success" : "error"}
      />
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        {access_token === "" && (
          <Alert severity="error">
            Seu token do Nightbot parece não estar válido! Acesse as
            configurações e atualize-o!
          </Alert>
        )}
        {!obsIsReady && (
          <Alert
            severity="error"
            style={{ display: "flex", alignItems: "center" }}
          >
            Sua conexão com OBS não está funcionando.
            <Button
              onClick={() => window.obsService && window.obsService.connect()}
            >
              Tentar novamente
            </Button>
          </Alert>
        )}
        <Tabs value={value} onChange={handleChange}>
          <Tab
            data-testid={testId.TAB_RUN_BUTTON}
            label="Runs"
            icon={<SportsEsportsIcon />}
          />
          <Tab
            data-testid={testId.TAB_MEMBER_BUTTON}
            label="Membros"
            icon={<PeopleIcon />}
          />
          <Tab
            data-testid={testId.TAB_EVENTS_BUTTON}
            label="Eventos"
            icon={<SportsEsportsIcon />}
          />
          <Tab
            data-testid={testId.TAB_FILES_BUTTON}
            label="Arquivos"
            icon={<FileCopyIcon />}
          />
          <Tab
            data-testid={testId.TAB_EXTENSIONS_BUTTON}
            label="Extensões"
            icon={<ExtensionIcon />}
          />
          <Tab
            data-testid={testId.TAB_ADVANCED_BUTTON}
            label="Avançado"
            icon={<UploadFileIcon />}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <RunsTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <MembersTab />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <EventsTab />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <FilesTab />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <OptionsTab />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <DataExportImportTab />
      </TabPanel>
      <ToastContainer />
    </>
  );
};

export default RunManagerPage;
