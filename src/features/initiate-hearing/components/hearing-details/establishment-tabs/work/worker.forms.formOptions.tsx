import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";

export const useFormOptions = (p0: { context: string; }) => {
  const { t } = useTranslation("hearingdetails");

  return {
   

    TypeOfWageOptions: [
      { value: "monthly", label: "Monthly" },
      { value: "weekly", label: "Weekly" },
    ] as Option[],

    RegionOptions: [
      { value: "riyadh", label: "Riyadh" },
      { value: "makkah", label: "Makkah" },
    ] as Option[],

    CityOptions: [
      { value: "riyadh", label: "Riyadh" },
      { value: "makkah", label: "Makkah" },
    ] as Option[],

    ContractTypeOptions: [ { value: "fullTime", label: "Full Time" },
        { value: "partTime", label: "Part Time" },] as Option[],

    
  };
};
