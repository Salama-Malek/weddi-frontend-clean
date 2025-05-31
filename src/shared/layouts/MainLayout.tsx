import { Outlet } from "react-router-dom";
import Header from "../components/layouts/header";

const MainLayout = () => {
  return (
    <div >
      <Header />
      <main >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
