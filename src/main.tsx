import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./samples/node-api";
import "./index.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "./pages/v1/dashboard";
import RunManagerPage from "./pages/manager";
import { IntegrationTwitchPage } from "./pages/v1/settings/integration/twitch/page";
import { IntegrationNightbotPage } from "./pages/v1/settings/integration/nightbot/page";
import { IntegrationObsPage } from "./pages/v1/settings/integration/obs/page";
import { Toaster } from "./components/ui/toaster";
import { TitlePage } from "./pages/v1/settings/integration/title/page";

const Router = () => {
  const [showOldPage, setShowOldPage] = React.useState(false);

  useEffect(() => {
    const old = localStorage.getItem("old");
    if (old && ["true", "1"].includes(old)) {
      setShowOldPage(true);
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        {showOldPage ? (
          <RunManagerPage />
        ) : (
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
              <Route path="/settings/title" element={<TitlePage />} />
              <Route path="/old-times" element={<RunManagerPage />} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
      <Toaster />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
