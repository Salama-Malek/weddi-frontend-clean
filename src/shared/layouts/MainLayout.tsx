import { Outlet } from "react-router-dom";
import Header from "../components/layouts/header";
import { UserProvider } from "../context/userTypeContext";
import { useState } from "react";

const MainLayout = () => {
  const [isLegalRep, setIsLegalRep] = useState(false);
  const [isEstablishment, setIsEstablishment] = useState(false);
  const [openModule, setOpenModule] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <UserProvider
      setOpenModule={setOpenModule}
      isLegalRepstate={isLegalRep}
      isEstablishmentstate={isEstablishment}
      setLegelRepState={setIsLegalRep}
      setEstablishmentState={setIsEstablishment}
      isLegalRep={isLegalRep}
      isEstablishment={isEstablishment}
      openModule={openModule}
      selected={selected}
      setSelected={setSelected}
    >
      <div >

        <Header />
        <main >
          <Outlet />
        </main>
      </div>
    </UserProvider>
  );
};

export default MainLayout;
