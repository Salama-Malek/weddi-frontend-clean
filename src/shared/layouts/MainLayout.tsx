import { Outlet } from "react-router-dom";
import Header from "../components/layouts/header";
import { UserProvider } from "../context/userTypeContext";
import { useState, useEffect } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
 
const MainLayout = () => {
  const [getCookie, setCookie] = useCookieState();
 
  const [isLegalRep, setIsLegalRep] = useState<boolean>(() => {
    const storedValue = getCookie("isLegalRep");
    return storedValue ? JSON.parse(storedValue) : false;
  });
 
  const [isEstablishment, setIsEstablishment] = useState<boolean>(() => {
    const storedValue = getCookie("isEstablishment");
    return storedValue ? JSON.parse(storedValue) : false;
  });
 
  const [openModule, setOpenModule] = useState<boolean>(() => {
    const storedValue = getCookie("openModule");
    return storedValue ? JSON.parse(storedValue) : false;
  });
 
  const [selected, setSelected] = useState<string | null>(() => {
    return getCookie("selected") || null;
  });
 
  const [userType, setUserType] = useState<string | null>(() => {
    return getCookie("userType") || null;
  });
 
  const [isMenueCahngeFlag, setIsMenueCahngeFlag] = useState<boolean>(() => {
    return getCookie("isMenueCahngeFlag") || false;
  });
 
 
  useEffect(() => {
    if (isLegalRep !== undefined) {
      setCookie("isLegalRep", JSON.stringify(isLegalRep));
    }
  }, [isLegalRep, setCookie]);
 
  useEffect(() => {
    if (isEstablishment !== undefined) {
      setCookie("isEstablishment", JSON.stringify(isEstablishment));
    }
  }, [isEstablishment, setCookie]);
 
  useEffect(() => {
    if (openModule !== undefined) {
      setCookie("openModule", JSON.stringify(openModule));
    }
  }, [openModule, setCookie]);
 
  useEffect(() => {
    if (selected) {
      setCookie("selected", selected);
    }
  }, [selected, setCookie]);
 
  useEffect(() => {
    if (userType) {
      setCookie("userType", userType);
    }
  }, [userType, setCookie]);
 
  useEffect(() => {
    if (isMenueCahngeFlag !== undefined) {
      setCookie("isMenueCahngeFlag", JSON.stringify(isMenueCahngeFlag));
    }
  }, [isMenueCahngeFlag, setCookie]);
 
 
 
 
  return (
    <UserProvider
      openModule={openModule}
      setOpenModule={setOpenModule}
      isLegalRep={isLegalRep}
      isEstablishment={isEstablishment}
      setLegelRepState={setIsLegalRep}
      setEstablishmentState={setIsEstablishment}
      selected={selected}
      setSelected={setSelected}
      userType={userType}
      setUserType={setUserType}
      isMenueCahngeFlag={isMenueCahngeFlag}
      setIsMenueCahngeFlag={setIsMenueCahngeFlag}
   
    >
      <div>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </UserProvider>
  );
};
 
export default MainLayout;