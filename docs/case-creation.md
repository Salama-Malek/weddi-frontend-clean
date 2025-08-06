# Case creation module

The case creation flow guides users through several steps for initiating a hearing. This document outlines the folder structure, step configuration, form builder, and navigation utilities that power the wizard.

## Folder structure

```
src/features/cases/initiate-hearing/
├── components/          # CaseCreationPage wrapper
├── config/              # Static options and helpers
├── hooks/               # Data fetching and persistence hooks
└── steps/               # Individual wizard steps
    ├── 01-hearing-details/
    │   ├── HearingDetailsForm.tsx
    │   ├── formConfig.ts
    │   ├── schema.ts
    │   └── …
    ├── hearing-topics/
    ├── add-attachments/
    └── review/
```

The shared infrastructure lives under `src/shared/modules`:

- `case-creation/` – Stepper UI, step flow context and step configuration.
- `form-builder/` – Dynamic form renderer used by step components.

## Step configuration

`src/shared/modules/case-creation/stepConfig.tsx` exports the ordered list of wizard steps. Each step defines an `id`, `title`, `description` and the React component to render. Optional `validate`, `next`, and `prev` callbacks allow conditional navigation.

```ts
export const steps: WizardStep[] = [
  {
    id: "hearing-details",
    title: "Hearing details",
    description: "Basic information and details of the hearing",
    component: HearingDetails,
    next: data => (data.skipTopics ? 2 : undefined),
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
```

Routes in `src/app/routes/initiateHearingRoutes.tsx` lazy‑load these components so the browser URL matches the current step.

### Adding a new step

1. Create a folder under `src/features/cases/initiate-hearing/steps` and implement the step component.
2. Lazy‑load the component in `initiateHearingRoutes.tsx` with a new route.
3. Import the component in `stepConfig.tsx` and append a new entry:

```ts
import AdditionalInfo from "@features/cases/initiate-hearing/steps/additional-info/AdditionalInfo";

export const steps: WizardStep[] = [
  /* existing steps */,
  {
    id: "additional-info",
    title: "Additional info",
    description: "Optional supporting information",
    component: AdditionalInfo,
  },
];
```

## Form builder

`src/shared/modules/form-builder` provides a declarative way to describe form sections and fields. A step defines its layout in a `formConfig.ts` file and renders it through `FormBuilder`.

```ts
export const claimantSection: FormSection = {
  id: "claimant",
  title: "Claimant Details",
  fields: [
    { type: "radio", name: "claimantStatus", label: "Claimant Status",
      options: [
        { label: "Self", value: "self" },
        { label: "Representative", value: "representative" },
      ]},
    { type: "text", name: "claimantName", label: "Claimant Name" },
  ],
};
```

The component consumes this configuration:

```tsx
const methods = useForm({ defaultValues: { claimantStatus: "self" } });

<FormProvider {...methods}>
  <FormBuilder sections={sections} />
</FormProvider>
```

### Adding a new field

To capture an email on the hearing details step, add a field to `formConfig.ts`:

```ts
fields: [
  { type: "radio", … },
  { type: "text", name: "claimantName", label: "Claimant Name" },
  { type: "text", name: "email", label: "Email address" }, // new field
]
```

Update the Zod schema in `schema.ts` if validation is required.

## Navigation

Progress is handled by the step flow utilities:

- `StepFlowContext` (`src/shared/modules/case-creation/StepFlowContext.tsx`) stores the current step and tab in local storage and exposes `nextStep`, `prevStep`, `goToStep`, and `setTab` helpers.
- `CaseWizard` reads the current route, renders the active step, and wires Next/Back buttons to the configured navigation logic.
- `Stepper` displays progress based on the current step.

These pieces allow users to move forward, go back, or jump directly to a specific step while preserving progress.

