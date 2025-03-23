import "./App.scss";
import RunManagerPage from "./pages/manager";
import Layout from "./pages/v1";

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

function App() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Layout>
        <span>oie</span>
      </Layout>
    </div>
  );
}

export default App;
