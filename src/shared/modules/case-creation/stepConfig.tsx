import React from "react";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  validate?: (data: Record<string, any>) => boolean;
  next?: (data: Record<string, any>) => number | undefined;
  prev?: (data: Record<string, any>) => number | undefined;
}

const HearingDetails: React.FC = () => <div>Hearing details step</div>;
const HearingTopics: React.FC = () => <div>Hearing topics step</div>;
const ReviewConfirm: React.FC = () => <div>Review and confirm step</div>;

export const steps: WizardStep[] = [
  {
    id: "hearing-details",
    title: "Hearing details",
    description: "Basic information and details of the hearing",
    component: HearingDetails,
    // Example conditional logic: skip topics if data.skipTopics is true
    next: (data) => (data.skipTopics ? 2 : undefined),
  },
  {
    id: "hearing-topics",
    title: "Hearing topics",
    description: "Add topics related to the hearing",
    component: HearingTopics,
  },
  {
    id: "review",
    title: "Review and confirm",
    description: "Review the hearing details and confirm the acknowledgment",
    component: ReviewConfirm,
  },
];

export default steps;
