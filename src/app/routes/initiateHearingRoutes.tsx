import { lazy, Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import Loader from "@shared/components/loader";

const LazyLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const InitiateHearingLayout = lazy(() =>
  import("@features/cases/initiate-hearing").then(m => ({ default: m.InitiateHearing }))
);
const CaseCreation = lazy(() => import("@shared/modules/case-creation"));
const HearingDetails = lazy(() =>
  import("@features/cases/initiate-hearing/steps/01-hearing-details").then(m => ({
    default: m.HearingDetailsForm,
  }))
);
const HearingTopics = lazy(() =>
  import("@features/cases/initiate-hearing/steps/hearing-topics").then(m => ({
    default: m.HearingTopicsDetails,
  }))
);
const AddAttachments = lazy(() =>
  import("@features/cases/initiate-hearing/steps/add-attachments").then(m => ({
    default: m.AddAttachment,
  }))
);
const ReviewStep = lazy(() =>
  import("@features/cases/initiate-hearing/steps/review").then(m => ({
    default: m.Review,
  }))
);

export const initiateHearingRoutes: RouteObject = {
  path: "/initiate-hearing",
  element: (
    <LazyLoader>
      <InitiateHearingLayout />
    </LazyLoader>
  ),
  children: [
    {
      element: (
        <LazyLoader>
          <CaseCreation />
        </LazyLoader>
      ),
      children: [
        { index: true, element: <Navigate to="hearing-details" replace /> },
        {
          path: "hearing-details",
          element: (
            <LazyLoader>
              <HearingDetails />
            </LazyLoader>
          ),
        },
        {
          path: "hearing-topics",
          element: (
            <LazyLoader>
              <HearingTopics />
            </LazyLoader>
          ),
        },
        {
          path: "add-attachments",
          element: (
            <LazyLoader>
              <AddAttachments />
            </LazyLoader>
          ),
        },
        {
          path: "review",
          element: (
            <LazyLoader>
              <ReviewStep />
            </LazyLoader>
          ),
        },
      ],
    },
  ],
};
