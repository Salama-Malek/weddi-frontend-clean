import { api } from "@/config/api";

interface ExtractAcknowledgment {
  ModuleKey: string;
  ModuleName: string;
  LookupType: string;
  AcceptedLanguage: string;
  SourceSystem: string;
  isCaseCreated?: string;
}

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    saveClaimantDetails: builder.mutation({
      query: ({ data, isCaseCreated }) => ({
        url: `/WeddiCreateCaseServices/V1/${isCaseCreated ? "Update" : "Create"}`,
        method: "POST",
        body: data,
      }),
    }),
    saveDefendantDetails: builder.mutation({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveWorkDetails: builder.mutation({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveHearingTopics: builder.mutation({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    updateHearingTopics: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/UpdateCaseTopics",
        method: "POST",
        body: data,
      }),
    }),
    submitReview: builder.mutation({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    getAcknowledgement: builder.query<any, any>({
      query: ({
        LookupType,
        ModuleKey,
        ModuleName,
        AcceptedLanguage,
      }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: LookupType,
          ModuleKey: ModuleKey,
          ModuleName: ModuleName,
          AcceptedLanguage: AcceptedLanguage,
        },
      }),
    }),
    getFileDetails: builder.query<any, any>({
      query: ({ AttachmentKey, AcceptedLanguage }) => ({
        url: `/WeddiServices/V1/DownloadAttachment`,
        params: {
          AttachmentKey: AttachmentKey,
          AcceptedLanguage: AcceptedLanguage,
        },
      }),
    }),
    // getCaseDetails: builder.query<any, any>({
    //   query: ({ CaseID, AcceptedLanguage, SourceSystem }) => ({
    //     url: `/WeddiServices/V1/GetCaseDetails`,
    //     params: {
    //       CaseID: CaseID,
    //       AcceptedLanguage: AcceptedLanguage,
    //       SourceSystem: SourceSystem
    //     }
    //   }),
    // }),
    submitFinalReview: builder.mutation({
      query: (data) => ({
        url: `/WeddiCreateCaseServices/V1/FinalSubmit`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useSaveClaimantDetailsMutation,
  useSaveDefendantDetailsMutation,
  useSaveWorkDetailsMutation,
  useSaveHearingTopicsMutation,
  useUpdateHearingTopicsMutation,
  useSubmitReviewMutation,
  useGetAcknowledgementQuery,
  useGetFileDetailsQuery,
  useLazyGetFileDetailsQuery,
  useSubmitFinalReviewMutation,
} = caseApi;
