import React, { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider, RouteObject } from "react-router-dom";
import "@app/i18n/i18n";
import Loader from "@shared/components/loader";
import { MainErrorFallback } from "@shared/components/errors/ErrorFallback";
import { OfflineLayout } from "@shared/layouts/OfflineLayout";

import ErrorBoundary from "@shared/components/ErrorBoundary";
import LoadingOverlay from "@shared/components/LoadingOverlay";

import MainLayout from "@shared/layouts/MainLayout";
import { TokenExpirationProvider } from "@app/providers/TokenExpirationProvider";
import { ToastContainer } from "react-toastify";
import { LogOut } from "@features/auth";
import { useTranslation } from "react-i18next";
import { manageHearingsRoutes } from "./routes/manageHearingsRoutes";
import { initiateHearingRoutes } from "./routes/initiateHearingRoutes";

const LoginLazy = lazy(() => import("@features/auth").then(m => ({ default: m.Login })));
const Main = lazy(() => import("@features/dashboard").then(m => ({ default: m.Dashboard })));

const LazyLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <MainErrorFallback />,
    children: [
      {
        index: true,
        element: (
          <LazyLoader>
            <Main />
          </LazyLoader>
        ),
      },
      initiateHearingRoutes,
      manageHearingsRoutes,
    ],
  },
  {
    path: "/login",
    element: (
      <LazyLoader>
        <LoginLazy />
      </LazyLoader>
    ),
    errorElement: <MainErrorFallback />
  },
  {
    path: "/logout",
    element: (
      <LogOut />
    ),
    errorElement: <MainErrorFallback />,
  },
];

const router = createBrowserRouter(routesConfig, {
  basename: '/portal/'
});

const App = () => {
  const { t, i18n } = useTranslation('meta');

  useEffect(() => {
    document.title = t('title');
  }, [i18n.language, t]);

  return (
    <TokenExpirationProvider>
      <OfflineLayout>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <LoadingOverlay router={router} />
        <ToastContainer />
      </OfflineLayout>
    </TokenExpirationProvider>
  )
};

export default App;
