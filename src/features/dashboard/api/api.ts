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
      query: (params) => ({
        url: `/WeddiCreateCaseServices/V1/GetIncompleteCase`,
        params,
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
        params: params,
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