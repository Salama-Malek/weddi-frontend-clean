import { api } from "@/config/api";

export const hearingTopicsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadAttachments: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/AddAttachment",
        method: "POST",
        body: data,
      }),
    }),
    WorkerAttachmentCategories: builder.query<any, any>({
      query: ({ModuleKey,ModuleName,AcceptedLanguage,SourceSystem}) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: ModuleKey,
          ModuleName:ModuleName,
          AcceptedLanguage:AcceptedLanguage,
          SourceSystem:SourceSystem
        }
      }),
    }),
  }),
});

export const { useUploadAttachmentsMutation,useWorkerAttachmentCategoriesQuery } = hearingTopicsApi;
