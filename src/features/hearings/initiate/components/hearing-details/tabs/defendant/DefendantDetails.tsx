import React, { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation from "@/features/hearings/initiate/hoc/with-step-navigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import Loader from "@/shared/components/loader";
import {
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
  useGetExtractedEstablishmentDataQuery,
} from "@/features/hearings/initiate/api/create-case/defendantDetailsApis";

import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";
import { useAPIFormsData } from "@/providers/FormContext";
import { useFormLayout } from "./defendant.forms.formLayout";
import { useLegelDefendantFormLayout } from "../../establishment-tabs/legal-representative/defendant/legdefendant.forms.formLayout";
import useDefendantDetailsPrefill from "@/features/hearings/initiate/hooks/useDefendantDetailsPrefill";

const DefendantDetailsContainer: React.FC<any> = ({ setIsPhoneVerify }) => {
  const { i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();

  const userType = getCookie("userType") || "";
  const caseId = getCookie("caseId");
  const lang = i18n.language.toUpperCase();
  const plaintiffId = (() => {
    try {
      const storedData = localStorage.getItem("CaseDetails");
      if (!storedData || storedData === "null" || storedData === "") {
        return "";
      }
      const caseDetails = JSON.parse(storedData);
      return caseDetails?.PlaintiffId || "";
    } catch {
      return "";
    }
  })();

  const { data: extractedEstData } = useGetExtractedEstablishmentDataQuery(
    {
      WorkerId: plaintiffId,
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      UserType: userType,
      CaseID: caseId,
    },
    {
      skip:
        userType?.toLocaleLowerCase() === "legal representative" ||
        userType?.toLocaleLowerCase() === "establishment" ||
        !plaintiffId ||
        !caseId ||
        !userType,
    },
  );

  useEffect(() => {}, [extractedEstData]);

  const { register, setValue, watch, control, formState, trigger } =
    useAPIFormsData();
  const { errors } = formState;
  const {
    isFeatched: caseDetailsLoading,
    defendantData,
    hasDefendantPrefill,
  } = useDefendantDetailsPrefill({
    setValue: setValue as any,
    trigger: trigger as any,
    prefillType: "defendant",
  });

  useEffect(() => {
    const currentDefendantStatus = watch("defendantStatus");
    const currentDefendantDetails = watch("defendantDetails");
    const prefilledRegion = watch("defendantRegion");
    const prefilledCity = watch("defendantCity");
    const selectedEstObj = watch("Defendant_Establishment_data");
    const selectedEstObjNon = watch(
      "Defendant_Establishment_data_NON_SELECTED",
    );
    if (
      currentDefendantStatus === "Establishment" &&
      currentDefendantDetails === "Others"
    ) {
      const hasPrefill = !!(
        selectedEstObj ||
        selectedEstObjNon ||
        prefilledRegion ||
        prefilledCity
      );
      if (!hasPrefill) {
        setValue("defendantRegion", null);
        setValue("defendantCity", null);
        setValue("establishment_phoneNumber", "");
        localStorage.removeItem("defendantFormData");
      }
    }
  }, [
    watch("defendantStatus"),
    watch("defendantDetails"),
    watch("defendantRegion"),
    watch("defendantCity"),
    watch("Defendant_Establishment_data"),
    watch("Defendant_Establishment_data_NON_SELECTED"),
    setValue,
  ]);

  useEffect(() => {
    const selected = watch("Defendant_Establishment_data");
    const details = watch("defendantDetails");
    try {
    } catch {}
    if (typeof setIsPhoneVerify === "function") {
      if (selected && details !== "Others") {
        setIsPhoneVerify(true);
      } else if (details === "Others") {
        setIsPhoneVerify(undefined);
      }
    }
  }, [watch("Defendant_Establishment_data"), watch("defendantDetails")]);

  useEffect(() => {
    const value = watch("defendantDetails");
    if (value === "Others") {
      setCookie("isEstablishment", false as any);
    }
  }, [watch("defendantDetails")]);

  const defendantStatus = watch("defendantStatus");
  const mainCategory = watch("main_category_of_the_government_entity") as any;

  const { data: governmentData, isLoading: isGovernmentLoading } =
    useGetGovernmentLookupDataQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          userType?.toLocaleLowerCase() === "legal representative" ||
          userType?.toLocaleLowerCase() === "establishment",
      },
    );

  const { data: subGovernmentData, isLoading: isSubGovernmentLoading } =
    useGetSubGovernmentLookupDataQuery(
      mainCategory && mainCategory.value
        ? {
            AcceptedLanguage: lang,
            SourceSystem: "E-Services",
            mainGovernmentSelected: mainCategory,
          }
        : skipToken,
    );

  const getFormLayout = (getUserType: string) => {
    getUserType = getUserType?.toLocaleLowerCase();

    switch (getUserType) {
      case "legal representative":
      case "establishment":
        return useLegelDefendantFormLayout({
          setValue,
          watch,
          control,
        });
      case "individual":
      case "worker":
      case "embassy user":
      default:
        return useFormLayout(
          setValue,
          watch,
          trigger,
          governmentData,
          subGovernmentData,
          caseDetailsLoading,
          defendantData,
          hasDefendantPrefill,
        );
    }
  };

  const DefendantType = defendantStatus || "";

  useEffect(() => {
    setCookie("defendantTypeInfo", DefendantType);
  }, [DefendantType]);

  useEffect(() => {
    if (defendantStatus === "Establishment") {
      setValue("main_category_of_the_government_entity", "", {
        shouldValidate: false,
      });
      setValue("subcategory_of_the_government_entity", "", {
        shouldValidate: false,
      });

      setCookie("defendantStatus", "Establishment");
      setValue("EstablishmentData", null, { shouldValidate: false });
    } else if (defendantStatus === "Government") {
      setCookie("defendantStatus", "Government");
      setValue("EstablishmentData", null, { shouldValidate: false });
    }
  }, [defendantStatus, setValue]);

  const formLayoutResult = getFormLayout(userType);
  const formLayout =
    "layout" in formLayoutResult ? formLayoutResult.layout : formLayoutResult;

  const showBlockingLoader = Boolean(
    (formLayoutResult as any)?.showBlockingLoader || false,
  );

  return (
    <>
      {(isGovernmentLoading ||
        isSubGovernmentLoading ||
        showBlockingLoader) && <Loader />}
      <div className={`relative`}>
        <div>
          <DynamicForm
            formLayout={formLayout}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
          />
        </div>
      </div>
    </>
  );
};

export default withStepNavigation(DefendantDetailsContainer);
