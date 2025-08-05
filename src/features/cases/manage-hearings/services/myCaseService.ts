import { useGetMyCasesQuery } from "../api/myCasesApis";
import type { GetMyCasesRequest, GetCaseDetailsRequest } from "../api/myCasesApis";
import apiClient from "@services/apiClient";

import { PlaintiffCasesResponse, DefendantCasesResponse, CaseRecord } from "../types/myCases";

// ---------- USE My Cases Data (List) ----------
interface UseMyCasesDataParams extends GetMyCasesRequest {}

export const useMyCasesData = ({
  UserType,
  IDNumber,
  PageNumber,
  TableFor,
  CaseStatus,
  FileNumber,
  MainGovernment,
  SubGovernment,
  SearchID,
  Number700,
  AcceptedLanguage,
  SourceSystem,
}: UseMyCasesDataParams): {
  data: CaseRecord[];
  isLoading: boolean;
  totalPages: number;
} => {
  const { data, isLoading } = useGetMyCasesQuery({
    UserType,
    IDNumber,
    PageNumber,
    TableFor,
    CaseStatus,
    FileNumber,
    MainGovernment,
    SubGovernment,
    SearchID,
    Number700,
    AcceptedLanguage,
    SourceSystem,
  });

  let cases: CaseRecord[] = [];
  let totalPages = 1;

  if (TableFor === "Plaintiff" && (data as PlaintiffCasesResponse)?.PlaintiffCases) {
    const typedData = data as PlaintiffCasesResponse;
    cases = typedData.PlaintiffCases;
    totalPages = parseInt(typedData.PaginationInfo?.TotalPagesCount ?? "1", 10);
  } else if (TableFor === "Defendant" && (data as DefendantCasesResponse)?.DefendantCases) {
    const typedData = data as DefendantCasesResponse;
    cases = typedData.DefendantCases;
    totalPages = parseInt(typedData.PaginationInfo?.TotalPagesCount ?? "1", 10);
  }

  return {
    data: cases,
    isLoading,
    totalPages,
  };
};

// ---------- GET Case Details (Single) ----------
export const getCaseDetailsApi = async ({
  CaseID,
  AcceptedLanguage = "EN",
  SourceSystem = "E-Services",
  IDNumber,
  UserType,
  FileNumber,
  MainGovernment,
  SubGovernment,
}: GetCaseDetailsRequest) => {
  const params: Record<string, any> = {
    CaseID,
    AcceptedLanguage,
    SourceSystem,
    IDNumber,
    UserType,
    FileNumber,
    MainGovernment,
    SubGovernment,
  };
  const { data } = await apiClient.get("/WeddiServices/V1/GetCaseDetails", { params });
  return data;
};
