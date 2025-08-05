import Loader from "@shared/components/loader";
import { lazy, Suspense } from "react";

const Main = lazy(() => import("@features/dashboard").then(m => ({ default: m.Dashboard })));

const HomePage = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <Main/>
    </Suspense>
  )
}

export default HomePage
