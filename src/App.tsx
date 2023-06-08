import "./App.scss";
import RunManagerPage from "./pages/manager";

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

function App() {
  return (
    <>
      <RunManagerPage />
    </>
  );
}

export default App;
