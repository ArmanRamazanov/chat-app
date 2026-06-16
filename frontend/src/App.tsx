import { Outlet } from "react-router-dom";
import "@/styles/index.css";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header></Header>
      <Outlet></Outlet>
    </>
  );
}

export default App;
