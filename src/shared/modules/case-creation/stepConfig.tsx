import React, { lazy } from "react";

export interface WizardData {
  claimantName?: string;
  topics?: unknown[];
  skipTopics?: boolean;
  confirmed?: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  validate?: (data: WizardData) => boolean;
  next?: (data: WizardData) => number | undefined;
  prev?: (data: WizardData) => number | undefined;
}

// Lazy-loaded step components
// These components live in the feature modules and are wrapped here to be
// consumed by the generic case wizard.
const HearingDetails = lazy(() =>
  import(
    "@features/cases/initiate-hearing/steps/hearing-details/tabs/claimant/ClaimantDetails"
  )
);

// AddHearing expects a displayFooter prop to render the create-flow footer. The
// wrapper component ensures the wizard always passes the correct flag.
const HearingTopics = lazy(() =>
  import("@features/cases/initiate-hearing/steps/hearing-topics/AddHearing").then(
    ({ default: AddHearing }) => ({
      default: () => <AddHearing displayFooter={true} />,
    })
  )
);

const ReviewConfirm = lazy(() =>
  import("@features/cases/initiate-hearing/steps/review/Review")
);

export const steps: WizardStep[] = [
  {
    id: "hearing-details",
    title: "Hearing details",
    description: "Basic information and details of the hearing",
    component: HearingDetails,
    // Example validation – ensure claimant name exists
    validate: (data) => Boolean(data.claimantName),
    // Example conditional logic: skip topics if data.skipTopics is true
    next: (data) => (data.skipTopics ? 2 : undefined),
  },
  {
    id: "hearing-topics",
    title: "Hearing topics",
    description: "Add topics related to the hearing",
    component: HearingTopics,
    validate: (data) => Array.isArray(data.topics) && data.topics.length > 0,
    // If topics were skipped, previous step should return to step 0
    prev: (data) => (data.skipTopics ? 0 : undefined),
  },
  {
    id: "review",
    title: "Review and confirm",
    description: "Review the hearing details and confirm the acknowledgment",
    component: ReviewConfirm,
    // Final step: ensure user has confirmed the data
    validate: (data) => Boolean(data.confirmed),
    // If topics were skipped, going back should return to step 0
    prev: (data) => (data.skipTopics ? 0 : 1),
  },
];

export default steps;
