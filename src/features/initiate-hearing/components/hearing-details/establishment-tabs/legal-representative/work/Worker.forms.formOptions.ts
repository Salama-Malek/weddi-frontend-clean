import { Option } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";

interface FormOptionsProps {
  context?: "worker" | "establishment" | "default";
}

export const useFormOptions = ({
  context = "default",
}: FormOptionsProps = {}) => {
  const { data: regionData } = useGetRegionLookupDataQuery({
    AcceptedLanguage: "EN",

    context,
  });

  const RegionOptions =
    regionData?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const CityOptions = [] as Option[];

  return {
    TypeOfWageOptions: [
      { value: "monthly", label: "Monthly" },
      { value: "weekly", label: "Weekly" },
    ] as Option[],

    RegionOptions,
    CityOptions,
  };
};

export const useWorkerFormOptions = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getSalaryTypeLookup: () => ({
      url: `/WeddiServices/V1/MainLookUp`,
      params: {
        LookupType: "DataElements",
        ModuleKey: "MST1",
        ModuleName: "SalaryType",
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),
  };
};
