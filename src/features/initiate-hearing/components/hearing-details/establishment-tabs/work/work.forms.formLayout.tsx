import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./worker.forms.formOptions";


export const useWorkFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>
): SectionLayout[] => {
  const { TypeOfWageOptions, RegionOptions, CityOptions, ContractTypeOptions } =
    useFormOptions({
      context: "worker"
    });

  const { t } = useTranslation("hearingdetails");
  // const claimantStatus = watch("claimantStatus");
  // const applicant = watch("applicant");
  // const isPhone = watch("isPhone");
  // const phoneCode = watch("phoneCode");

  return [
    // Work Details Section

    {
      title: t("tab3_title"),
      children: [
        {
          type: "autocomplete",
          name: "typeOfWage",
          label: t("typeOfWage"),
          options: TypeOfWageOptions,
          //@ts-ignore
          onChange: (value: Option) => setValue("typeOfWage", value),
        },

        {
          type: "input",
          name: "salary",
          label: t("currentSalary"),
          inputType: "number",
          min: 0,
          placeholder: "10000 SAR",
        },
        {
          type: "autocomplete",
          name: "contractType",
          label: t("contractType"),
          options: ContractTypeOptions,
          //@ts-ignore
          onChange: (value: Option) => setValue("contractType", value),
        },
        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: "123457543",
        },
        {
            type: "readonly",
            name: "contractDateHijri",
            label: t("contractDateHijri"),
            value: "09/19/1426" 
          
          },
        {
            type: "readonly",
            name: "contractDateGregorian",
            label: t("contractDateGregorian"),
            value: "09/19/1426" 
          
          },
        {
            type: "readonly",
            name: "contractExpiryDateHijri",
            label: t("contractExpiryDateHijri"),
            value: "09/19/1426" 
          
          },
        {
            type: "readonly",
            name: "contractExpiryDateGregorian",
            label: t("contractExpiryDateGregorian"),
            value: "09/19/1426" 
          
          },
        {
            type: "readonly",
            name: "contractExpiryDateGregorian",
            label: t("stillEmployed"),
            value: "---:---",
          },
        
      ],
    },

   
    
   
    {
      title: t("workLocationDetails"),
      children: [
        {
          type: "autocomplete",
          name: "region",
          label: t("region"),
          options: RegionOptions,
          onChange: (value: Option) => setValue("region", value),
        },
        {
          type: "autocomplete",
          name: "city",
          label: t("city"),
          options: CityOptions,
          onChange: (value: Option) => setValue("city", value),
        },
      ],
    },
  ] as SectionLayout[];
};
