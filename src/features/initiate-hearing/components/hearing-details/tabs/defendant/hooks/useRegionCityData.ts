import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

export const useRegionCityData = (
  i18n: { language: string },
  defendantRegion: any,
) => {
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });

  const {
    data: cityData,
    isFetching: isCityLoading,
    isError: isCityError,
  } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      selectedWorkerRegion:
        typeof defendantRegion === "object"
          ? defendantRegion?.value
          : defendantRegion || "",
      ModuleName: "EstablishmentCity",
    },
    {
      skip: !(typeof defendantRegion === "object"
        ? defendantRegion?.value
        : defendantRegion),
    },
  );

  useEffect(() => {
    if (cityData && isCityError) {
      toast.error("Error fetching city data");
    }
  }, [cityData, isCityError]);

  const RegionOptions =
    regionData?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const CityOptions =
    cityData?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  return { RegionOptions, CityOptions, isCityLoading };
};
