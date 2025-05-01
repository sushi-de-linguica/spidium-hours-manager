import { useEffect } from "react";
import "./App.scss";
import Layout from "./pages/v1";
import { Outlet } from "react-router";

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (!theme) {
      return;
    }

    document.body.classList.add(theme);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default App;
