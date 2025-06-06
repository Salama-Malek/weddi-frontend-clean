import { DynamicForm } from "@/shared/components/form/DynamicForm";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { useFormLayout } from "./worker.forms.formLayout";
import {
  useLazyGetContractTypeLookupQuery,
  useGetSalaryTypeLookupQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useEffect, useMemo, useState } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useAPIFormsData } from "@/providers/FormContext";
import { legRepVsWorkerUseFormLayout } from "../../establishment-tabs/legal-representative/work/legworker.forms.formLayout";
import { useTranslation } from "react-i18next";

export interface WorkDetailsProps {
  register?: any;
  errors?: any;
  setValue?: any;
  watch?: any;
  control?: any;
  isVerifiedInput?: boolean;
}

const WorkDetails = ({
  register,
  errors,
  setValue,
  watch,
  control,
  isVerifiedInput = true,
}: WorkDetailsProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  // const [DefendantType, setDefendantApi] = useState(
  //   getCookie("defendantTypeInfo")
  // );
 
  // //console.log("DefendantType", DefendantType);
//  const userType = getCookie("userType");
const userType = getCookie("userType") || "";

   const legalRepType = getCookie("legalRepType");
   const defendantStatus = getCookie("defendantStatus") || "";

  const { formData, forceValidateForm, clearFormData } = useAPIFormsData();
  useEffect(() => {
    forceValidateForm();

    setValue("region", null);
    setValue("city", null);
  }, []);



  const [ExtractEstbAData] = useState(
    getCookie("estPlatif-WorkDefentef") &&
      typeof getCookie("estPlatif-WorkDefentef").ErrorDetails === "object"
      ? null
      : getCookie("estPlatif-WorkDefentef") &&
        getCookie("estPlatif-WorkDefentef").EstablishmentData &&
        getCookie("estPlatif-WorkDefentef").EstablishmentData.length > 0
        ? getCookie("estPlatif-WorkDefentef").EstablishmentData[0]
        : ""
  );

  const selectedWorkerRegion = watch("region");
  const selectedWorkerCity = watch("city");
  const { data } = useGetSalaryTypeLookupQuery({
    AcceptedLanguage: currentLanguage,
  });
  

  // 1. Setup the lazy hook
const [
  triggerContractType,
  { data: contractTypeData, isFetching: isContractTypeLoading }
] = useLazyGetContractTypeLookupQuery();

// 2. Fire it once our cookies are decoded
useEffect(() => {
  if (userType || legalRepType || defendantStatus) {
    triggerContractType({
      userType,
      legalRepType,
      defendantStatus,
      AcceptedLanguage: currentLanguage,
    });
  }
}, [
  userType,
  legalRepType,
  defendantStatus,
  currentLanguage,
  triggerContractType,
]);



  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: currentLanguage, // Pass current language
      SourceSystem: "E-Services",
      ModuleKey: "JobLocation",
      ModuleName: "JobLocation",
    });

  const { data: cityData, isFetching: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {

        AcceptedLanguage: currentLanguage, // Pass current language

        SourceSystem: "E-Services",
        selectedWorkerRegion,
        ModuleName: "JobLocationCity",
      },
      { skip: !selectedWorkerRegion }
    );

  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {

        AcceptedLanguage: currentLanguage, // Pass current language

        SourceSystem: "E-Services",
        selectedWorkerCity,
      },
      { skip: !selectedWorkerCity }
    );

  useEffect(() => {
    if (laborOfficeData && laborOfficeData?.DataElements && laborOfficeData?.DataElements?.length !== 0
    ) {
      console.log(laborOfficeData?.DataElements?.[0]);
      setValue("laborOffice", {
        value: laborOfficeData?.DataElements?.[0]?.ElementKey || "",
        label:
          laborOfficeData?.DataElements?.[0]?.ElementValue || ""
      });

    }
  }, [laborOfficeData])



  const formLayout = useFormLayout(
    setValue,
    control,
    watch,
    data?.DataElements,
    contractTypeData?.DataElements,
    ExtractEstbAData,
    regionData?.DataElements,
    cityData?.DataElements,
    laborOfficeData?.DataElements,
    selectedWorkerCity,
    isRegionLoading,
    isCityLoading,
    isLaborLoading,
    defendantStatus
  );

  const legRepVsWorkerLayouForm = legRepVsWorkerUseFormLayout(
    setValue,
    control,
    watch);


  // hassan add this 
  const memoizedFormLayout = useMemo(
    () => formLayout,
    [formLayout]
  );
  const memoizedLegleFormLayout = useMemo(
    () => legRepVsWorkerLayouForm,
    [legRepVsWorkerLayouForm]
  );

  // Determine which form layout to use based on userType
  const getFormLayout = (getUserType: string) => {
    // hassan edit this 
    getUserType = getUserType?.toLocaleLowerCase();
    switch (getUserType) {
      case "legal representative":
        return memoizedLegleFormLayout;
      // hassan change this  memoizedFormLayout  with memoizedLegleFormLayout  
      default:
        return memoizedLegleFormLayout;
    }
  };




  // const workFormLayout = useWorkFormLayout(setValue, watch);




  const getWorkDetails = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage, // Pass current language
        SourceSystem: "E-Services",
      });
      const response = await fetch(`WeddiServices/V1/WorkDetails?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching work details:", error);
      throw error;
    }
  };

  const getWorkDetailsByCaseId = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage, // Pass current language
        SourceSystem: "E-Services",
      });
      const response = await fetch(`WeddiServices/V1/WorkDetailsByCaseId?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching work details by case ID:", error);
      throw error;
    }
  };

  const getWorkDetailsByWorkerId = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage, // Pass current language
        SourceSystem: "E-Services",
      });
      const response = await fetch(`WeddiServices/V1/WorkDetailsByWorkerId?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching work details by worker ID:", error);
      throw error;
    }
  };

  return (
    <DynamicForm
      formLayout={getFormLayout(userType)}
      register={register}
      errors={errors}
      setValue={setValue}
      control={control}
      watch={watch}
    />
  );
};

export default withStepNavigation(WorkDetails);