import BannerSkeleton from "@/shared/components/loader/BannerSkeleton";
import { lazy, Suspense, useState } from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import AuthProvider from "../login/components/AuthProvider";

const Banner = lazy(() => import("./components/HearingBanner"));
const HearingContent = lazy(() => import("./components/HearingContent"));

const Main = () => {
  const [isEstablishment, setIsEstablishment] = useState(false);
  const [isLegalRep, setIsLegalRep] = useState(false);

  const popupHandler = () => {
    setIsLegalRep(true);
  };

  const popuoStablishment = () => {
    setIsEstablishment(true);
  };
  return (
    <AuthProvider
      popupHandler={popupHandler}
      popuoStablishment={popuoStablishment}
      setIsLegalRep={setIsLegalRep}
    >
      <main className="!space-y-[16px] bg-gray-100">
        <div className="container">
          <Suspense fallback={<BannerSkeleton />}>
            <Banner isLegalRep={isLegalRep} isEstablishment={isEstablishment} />
          </Suspense>
        </div>
        <Suspense fallback={<TableLoader />}>
          <HearingContent
            isLegalRep={isLegalRep}
            isEstablishment={isEstablishment}
            popupHandler={popupHandler}
          />
        </Suspense>
      </main>
    </AuthProvider>
  );
};

export default Main;
