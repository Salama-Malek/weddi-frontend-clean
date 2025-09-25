import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import Loader from "@/shared/components/loader";

const LazyLoader = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<Loader force />}>{children}</Suspense>;
};

const ManageHearings = lazy(
  () => import("@/features/hearings/manage/components/ManageHearings"),
);
const HearingDetails = lazy(
  () => import("@/features/hearings/manage/components/HearingDetails"),
);
const UpdateTopicComponent = lazy(
  () => import("@/features/hearings/manage/components/UpdateTopic"),
);

export const manageHearingsRoutes: RouteObject = {
  path: "/manage-hearings",
  element: (
    <LazyLoader>
      <ManageHearings />
    </LazyLoader>
  ),
  children: [
    {
      path: ":caseId",
      element: (
        <LazyLoader>
          <HearingDetails />
        </LazyLoader>
      ),
    },
    {
      path: "update-case",
      element: (
        <LazyLoader>
          <UpdateTopicComponent />
        </LazyLoader>
      ),
    },
  ],
};
