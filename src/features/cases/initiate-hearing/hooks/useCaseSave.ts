import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAPIFormsData } from "@app/providers/FormContext";

export interface ApiResponse {
  ServiceStatus: string;
  SuccessCode: string;
  CaseNumber?: string;
  S2Cservicelink?: string;
  ErrorDescription?: string;
  ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
}

interface UseCaseSaveResult {
  onSave: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  isSaveLoading: boolean;
  isSaveSuccess: boolean;
  isSaveError: boolean;
}

const useCaseSave = (
  handleSave?: () => Promise<ApiResponse>
): UseCaseSaveResult => {
  const { t: tStepper } = useTranslation("stepper");
  const { clearErrors } = useAPIFormsData();

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);

  const onSave = useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      if (!handleSave || isSaveLoading) return;

      setIsSaveLoading(true);
      setIsSaveSuccess(false);
      setIsSaveError(false);

      try {
        const response = await handleSave();

        const validErrors =
          response?.ErrorCodeList?.filter(
            (element: any) => element.ErrorCode || element.ErrorDesc
          ) || [];

        if (validErrors.length > 0) {
          validErrors.forEach((error: any) => {
            toast.error(error.ErrorDesc || "Validation error");
          });
          setIsSaveError(true);
          return;
        }

        const hasSuccessCode = response?.SuccessCode === "200";
        const hasSuccessStatus = response?.ServiceStatus === "Success";
        const hasNoErrors =
          !response?.ErrorCodeList || response.ErrorCodeList.length === 0;
        const hasOnlyWarnings = response?.ErrorCodeList?.every((error: any) =>
          error.ErrorCode?.startsWith("W") ||
          error.ErrorDesc?.toLowerCase().includes("warning")
        );

        const isSuccessful =
          (hasSuccessStatus && (hasNoErrors || hasOnlyWarnings)) ||
          (hasSuccessCode && (hasNoErrors || hasOnlyWarnings));

        if (isSuccessful) {
          clearErrors?.();
          toast.success(tStepper("save_success"));
          setIsSaveSuccess(true);
        } else if (response?.SuccessCode !== "IN_PROGRESS") {
          if (response?.ErrorCodeList?.length > 0) {
            console.log("[useCaseSave] Error details:", response.ErrorCodeList);
          }
          setIsSaveError(true);
        }
      } catch (error: any) {
        console.error("[useCaseSave] Save error:", error);
        const errorMessage =
          error?.data?.ErrorDetails?.[0]?.ErrorDesc ||
          error?.data?.ErrorDescription ||
          error?.message ||
          tStepper("save_error");
        toast.error(errorMessage);
        setIsSaveError(true);
      } finally {
        setIsSaveLoading(false);
      }
    },
    [handleSave, isSaveLoading, clearErrors, tStepper]
  );

  return { onSave, isSaveLoading, isSaveSuccess, isSaveError };
};

export default useCaseSave;

