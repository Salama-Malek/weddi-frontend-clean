import { z } from "zod";

export const hearingDetailsSchema = z
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

export type HearingDetailsFormValues = z.infer<typeof hearingDetailsSchema>;
