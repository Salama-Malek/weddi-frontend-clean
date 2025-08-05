import { api } from "@services/config/api";
// interface ExtractEstablishmentParams {
//   WorkerId: string,
//   AcceptedLanguage: string,
//   SourceSystem: string,
//   FileNumber?: string
// }

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    GetExtractedEstablishmentData: builder.query<any, any>({
      query: ({ WorkerId, AcceptedLanguage, SourceSystem, FileNumber, UserType, CaseID }) => ({
        url: `/WeddiServices/V1/ExtractEstabData`,
        params: {
          WorkerID: WorkerId,
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem,
          FileNumber: FileNumber,
          UserType: UserType,
          CaseID: CaseID
        }
      }),
    }),
    GetEstablishmentDetails: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem, FileNumber }) => ({
        url: `/WeddiServices/V1/GetEstablishmentData`,
        params: {
          FileNumber: FileNumber,
          // CRNumber:"1010193202", //will pass from Extra establishment api
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        }
      }),
    }),
    GetGovernmentLookupData: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: "GovernmentName",
          ModuleName: "GovernmentName",
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        }
      }),
    }),
    GetSubGovernmentLookupData: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem, mainGovernmentSelected }) => ({
        url: `/WeddiServices/V1/SubLookup`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: (typeof mainGovernmentSelected === "object" ? mainGovernmentSelected?.value : mainGovernmentSelected) || "",
          ModuleName: "SubgovernmentName",
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        }
      }),
    }),
  }),
});

export const {
  useGetExtractedEstablishmentDataQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
  useGetEstablishmentDetailsQuery,
  useLazyGetEstablishmentDetailsQuery,

} = caseApi;
