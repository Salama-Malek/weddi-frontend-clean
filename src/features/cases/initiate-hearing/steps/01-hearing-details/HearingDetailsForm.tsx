import React, { useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormBuilder, FormSection } from "@shared/modules/form-builder";
import { claimantSection, representativeSection } from "./formConfig";

const schema = z
  .object({
    claimantStatus: z.enum(["self", "representative"]),
    claimantName: z.string().min(1, "Required"),
    representativeName: z.string().optional(),
    relationship: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.claimantStatus === "representative") {
        return !!data.representativeName;
      }
      return true;
    },
    { path: ["representativeName"], message: "Representative name is required" }
  );

const HearingDetailsForm: React.FC = () => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { claimantStatus: "self" },
  });

  const claimantStatus = useWatch({
    control: methods.control,
    name: "claimantStatus",
  });

  const sections: FormSection[] = useMemo(() => {
    const base = [claimantSection];
    if (claimantStatus === "representative") {
      base.push(representativeSection);
    }
    return base;
  }, [claimantStatus]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <FormBuilder sections={sections} />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary-600 text-white"
        >
          Submit
        </button>
      </form>
    </FormProvider>
  );
};

export default HearingDetailsForm;
