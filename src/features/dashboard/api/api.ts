import { api } from "@/config/api";
import { ICaseRecord } from "../types/caseRecord.modal";
 
export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCaseAduit: builder.query<ICaseRecord, any>({
      query: (params) => ({
        url: `/WeddiServices/V1/GetCasesAudit`,
        params,
      }),
    }),
    getIncompleteCase: builder.query<any, any>({
      query: ({ UserType, IDNumber, FileNumber, MainGovernment, SubGovernment, AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiCreateCaseServices/V1/GetIncompleteCase`,
        params: {
          UserType,
          IDNumber,
          ...(FileNumber && { FileNumber }),
          ...(MainGovernment && { MainGovernment }),
          ...(SubGovernment && { SubGovernment }),
          AcceptedLanguage,
          SourceSystem
        },
      }),
    }),
    saveUINotification: builder.query({
      query: (data) => ({
        url: `/WeddiServices/V1/WeddiCaseUINotifications`,
        method: "POST",
        body: data,
      }),
    }),
    getMySchedules: builder.query({
      query: (params) => ({
        url: `/WeddiServices/V1/MySchedules`,
        params,
      }),
    }),
 
  }),
});
 
export const { useGetCaseAduitQuery,
  useLazySaveUINotificationQuery,
  useGetIncompleteCaseQuery,
  useLazyGetIncompleteCaseQuery,
  useGetMySchedulesQuery,
  useLazyGetMySchedulesQuery
} = caseApi;