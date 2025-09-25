import { api } from "@/services/apiClient";
import { ApiResponse } from "@/features/hearings/initiate/modules/case-creation/components/StepNavigation";
import { processAttachmentKey } from "@/utils/helpers";

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    saveClaimantDetails: builder.mutation<ApiResponse, any>({
      query: ({ data, isCaseCreated }) => ({
        url: `/WeddiCreateCaseServices/V1/${
          isCaseCreated ? "Update" : "Create"
        }`,
        method: "POST",
        body: data,
      }),
    }),
    saveDefendantDetails: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveWorkDetails: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveHearingTopics: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    updateHearingTopics: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiServices/V1/UpdateCaseTopics",
        method: "POST",
        body: data,
      }),
    }),
    submitReview: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    getAcknowledgement: builder.query<any, any>({
      query: ({ LookupType, ModuleKey, ModuleName, AcceptedLanguage }) => ({
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
      query: ({ AttachmentKey, AcceptedLanguage }) => {
        const processedAttachmentKey = processAttachmentKey(AttachmentKey);
        return {
          url: `/WeddiServices/V1/DownloadAttachment`,
          params: {
            AttachmentKey: processedAttachmentKey,
            AcceptedLanguage: AcceptedLanguage,
          },
        };
      },
    }),

    submitFinalReview: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: `/WeddiCreateCaseServices/V1/FinalSubmit`,
        method: "POST",
        body: data,
      }),
    }),

    validateMojContract: builder.mutation<
      any,
      {
        CaseID: string;
        SubTopicID: string;
        IDNumber: string;
        UserType: string;
        AcceptedLanguage: string;
      }
    >({
      query: ({
        CaseID,
        SubTopicID,
        IDNumber,
        UserType,
        AcceptedLanguage,
      }) => ({
        url: `/WeddiServices/V1/MOJContract`,
        method: "POST",
        body: {
          CaseID,
          SubTopicID,
          IDNumber,
          UserType,
          AcceptedLanguage,
        },
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
  useValidateMojContractMutation,
} = caseApi;
