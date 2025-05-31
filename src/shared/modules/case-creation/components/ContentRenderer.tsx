import GenericSkeleton from "@/shared/components/loader/GenericSkeleton";
import TableLoader from "@/shared/components/loader/TableLoader";
import React, { lazy, Suspense } from "react";

const ClaimantDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/claimant/ClaimantDetails"
    )
);
const DefendantDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/defendant/DefendantDetails"
    )
);
const WorkDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/work/WorkDetails"
    )
);
const AddHearing = lazy(
  () =>
    import("@/features/initiate-hearing/components/hearing-topics/AddHearing")
);
const ReviewDetails = lazy(
  () => import("@/features/initiate-hearing/components/review")
);

interface ContentRendererProps {
  currentStep: number;
  currentTab: number;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  currentStep,
  currentTab,
}) => {
  if (currentStep === 0) {
    switch (currentTab) {
      case 0:
        return (
          <Suspense fallback={<TableLoader />}>
            <ClaimantDetails />
          </Suspense>
        );
      case 1:
        return (
          <Suspense fallback={<TableLoader />}>
            <DefendantDetails />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<TableLoader />}>
            <WorkDetails />
          </Suspense>
        );
      default:
        return null;
    }
  } else if (currentStep === 1) {
    return (
      <Suspense fallback={<GenericSkeleton />}>
        <AddHearing displayFooter={true} />
      </Suspense>
    );
  } else {
    return (
      <Suspense fallback={<TableLoader />}>
        <ReviewDetails />
      </Suspense>
    );
  }
};

export default ContentRenderer;
