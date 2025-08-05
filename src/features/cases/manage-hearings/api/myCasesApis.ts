import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import apiClient from "@services/apiClient";

export type UserType =
  | "Worker"
  | "Establishment"
  | "Legal representative"
  | "Agent"
  | "Embassy User";
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
  Number700?: string;
  MainGovernment?: string;
  SubGovernment?: string;
}

export interface GetCaseDetailsRequest {
  CaseID: string;
  AcceptedLanguage?: string;
  SourceSystem?: string;
  IDNumber: string;
  UserType: UserType;
  FileNumber: string;
  MainGovernment: string;
  SubGovernment: string;
}

const getMyCases = async (params: GetMyCasesRequest) => {
  const { data } = await apiClient.get("/WeddiServices/V1/MyCases", { params });
  return data;
};

export const useGetMyCasesQuery = (params: GetMyCasesRequest) =>
  useQuery({ queryKey: ["myCases", params], queryFn: () => getMyCases(params) });

const getCaseDetails = async (params: GetCaseDetailsRequest) => {
  const { data } = await apiClient.get("/WeddiServices/V1/GetCaseDetails", { params });
  return data;
};

export const useGetCaseDetailsQuery = (params: GetCaseDetailsRequest, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["caseDetails", params],
    queryFn: () => getCaseDetails(params),
    ...options,
  });

export const useLazyGetCaseDetailsQuery = () => {
  const paramsRef = useRef<GetCaseDetailsRequest>();
  const query = useQuery({
    queryKey: ["caseDetailsLazy"],
    queryFn: () => getCaseDetails(paramsRef.current!),
    enabled: false,
  });
  const trigger = (params: GetCaseDetailsRequest) => {
    paramsRef.current = params;
    return query.refetch();
  };
  return [trigger, query] as const;
};
