import { z } from "zod";

export const attachmentSchema = z.object({
  attachments: z
    .array(
      z.object({
        file: z.any().optional().nullable(),
        base64: z.string().optional().nullable(),
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .optional(),
});

export type AttachmentFormValues = z.infer<typeof attachmentSchema>;
