import { z } from "zod";

export const reviewSchema = z.object({
  acknowledgements: z.array(z.string()),
  language: z.string(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
