import { z } from "zod";

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const topicSchema = z
  .object({
    mainCategory: optionSchema,
    subCategory: optionSchema,
    acknowledged: z.boolean(),
  })
  .passthrough();

export type TopicFormValues = z.infer<typeof topicSchema>;
