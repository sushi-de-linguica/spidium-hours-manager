import "./App.scss";
import RunManagerPage from "./pages/manager";

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

function App() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <RunManagerPage />
    </div>
  );
}

export default App;
