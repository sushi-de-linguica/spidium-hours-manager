import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./samples/node-api";
import "./index.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/toaster";

import Dashboard from "./pages/v1/dashboard";
import { IntegrationTwitchPage } from "./pages/v1/settings/integration/twitch/page";
import { IntegrationNightbotPage } from "./pages/v1/settings/integration/nightbot/page";
import { IntegrationObsPage } from "./pages/v1/settings/integration/obs/page";
import { TitlePage } from "./pages/v1/settings/integration/title/page";
import { MembersPage } from "./pages/v1/events/members/page";
import { EventsPage } from "./pages/v1/events/page";
import EventRunsPage from "./pages/v1/events/runs/page";
import AddRunPage from "./pages/v1/events/runs/add/page";
import { useDatabase } from "./hooks/use-database";
import { useObsGlobalService } from "./hooks/use-obs-global-service";
import { GlobalContext } from "./stores/context/global";
import RunManagerPage from "./pages/manager/index";

const Router = () => {
  const database = useDatabase();
  const [isLoading, setIsLoading] = React.useState(true);
  const obsGlobalService = useObsGlobalService();

  useEffect(() => {
    database.init().then(() => {
      setIsLoading(false);
      obsGlobalService.start();
    });

    return () => {
      obsGlobalService.destroy();
    };
  }, []);

  if (isLoading) {
    return <>Carregando....</>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/settings/integration/twitch"
              element={<IntegrationTwitchPage />}
            />
            <Route
              path="/settings/integration/nightbot"
              element={<IntegrationNightbotPage />}
            />
            <Route
              path="/settings/integration/obs"
              element={<IntegrationObsPage />}
            />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/members" element={<MembersPage />} />
            <Route path="/events/:id/runs/add" element={<AddRunPage />} />
            <Route
              path="/events/:id/runs/:runId/edit"
              element={<AddRunPage />}
            />
            <Route path="/events/:id/runs" element={<EventRunsPage />} />
            <Route path="/settings/title" element={<TitlePage />} />
            <Route path="/old-times" element={<RunManagerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalContext.Provider value={{ obsIsReady: false }}>
      <Router />
    </GlobalContext.Provider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
