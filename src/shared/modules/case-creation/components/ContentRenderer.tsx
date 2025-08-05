import GenericSkeleton from "@shared/components/loader/GenericSkeleton";
import TableLoader from "@shared/components/loader/TableLoader";
import React, { lazy, Suspense } from "react";
import { useStepFlow } from "../StepFlowContext";

const ClaimantDetails = lazy(
  () =>
    import(
      "@features/cases/initiate-hearing/steps/hearing-details/tabs/claimant/ClaimantDetails"
    )
);
const DefendantDetails = lazy(
  () =>
    import(
      "@features/cases/initiate-hearing/steps/hearing-details/tabs/defendant/DefendantDetails"
    )
);
const WorkDetails = lazy(
  () =>
    import(
      "@features/cases/initiate-hearing/steps/hearing-details/tabs/work/WorkDetails"
    )
);
const AddHearing = lazy(
  () =>
    import("@features/cases/initiate-hearing/steps/hearing-topics/AddHearing")
);
const ReviewDetails = lazy(
  () => import("@features/cases/initiate-hearing/steps/review/Review")
);

const ContentRenderer: React.FC = () => {
  const { currentStep: step, currentTab: tab } = useStepFlow();

  const renderContent = () => {
    if (step === 0) {
      switch (tab) {
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
    } else if (step === 1) {
      return (
        <Suspense fallback={<GenericSkeleton />}>
          <AddHearing displayFooter={true} />
        </Suspense>
      );
    } else if (step === 2) {
      return (
        <Suspense fallback={<TableLoader />}>
          <ReviewDetails />
        </Suspense>
      );
    }
    return null;
  };

  return renderContent();
};

export default ContentRenderer;
