import { api } from "@/config/api";

export type UserType = "Worker" | "Establishment" | "Legal representative" | "Agent";
export type TableForType = "Plaintiff" | "Defendant";

export interface GetMyCasesRequest {
  UserType: UserType;
  IDNumber: string;
  PageNumber: number;
  TableFor: TableForType;
  CaseStatus?: string;
  AcceptedLanguage?: string;
  SourceSystem?: string;
  FileNumber?: string;
  SearchID: string;
  MainGovernment?: string;
  SubGovernment?: string;
}

export interface GetCaseDetailsRequest {
  CaseID: string;
  AcceptedLanguage?: string;
  SourceSystem?: string;
  IDNumber: string;
  UserType: UserType;
}

export const myCasesApi = api.injectEndpoints({
  overrideExisting: true,  // ⬅️ allow redefinition of endpoints
  endpoints: (builder) => ({
    getMyCases: builder.query<any, GetMyCasesRequest>({
      query: ({
        UserType,
        IDNumber,
        PageNumber,
        TableFor,
        CaseStatus,
        FileNumber,
        MainGovernment,
        SubGovernment,
        SearchID,
        AcceptedLanguage,
        SourceSystem = "E-Services",
      }) => {
        const params: Record<string, any> = {
          UserType,
          IDNumber,
          PageNumber,
          TableFor,
          CaseStatus,
          SearchID,
          AcceptedLanguage,
          SourceSystem,
        };

        // //console.log("UserType", UserType);
        

        if (UserType === "Establishment" && FileNumber) {
          params.FileNumber = FileNumber;
        }

        if (
          UserType === "Legal representative" &&
          MainGovernment &&
          SubGovernment
        ) {
          params.MainGovernment = MainGovernment;
          params.SubGovernment = SubGovernment;
        }

        return { url: "/WeddiServices/V1/MyCases", params };
      },
    }),

    getCaseDetails: builder.query<any, GetCaseDetailsRequest>({
      query: ({
        CaseID,
        AcceptedLanguage = "EN",
        SourceSystem = "E-Services",
        IDNumber,
        UserType,
      }) => ({
        url: "/WeddiServices/V1/GetCaseDetails",
        params: { CaseID, AcceptedLanguage, SourceSystem, IDNumber, UserType },
      }),
    }),
  }),
});

// Updated Exports
export const { useGetMyCasesQuery, useGetCaseDetailsQuery, useLazyGetCaseDetailsQuery } = myCasesApi;
