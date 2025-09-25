import { SectionLayout } from "@/shared/components/form/form.types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";
import { useGetUserTypeLegalRepQuery } from "@/features/auth/api/loginApis";
import { TokenClaims } from "@/features/auth/components/AuthProvider";
export const useLegalRepPlaintiffFormLayout = (
  setValue?: any,
): SectionLayout[] => {
  const { t: LegalRep, i18n } = useTranslation("legal_rep");
  const [getCookie, setCookie] = useCookieState({
    mainCategory: "mainCategory",
    subCategory: "subCategory",
  });

  const [selectedMainCategory, _setSelectedMainCategory] = useState<any | null>(
    getCookie("mainCategory"),
  );
  const [selectedSubCategory, _setSelectedSubCategory] = useState<any | null>(
    getCookie("subCategory"),
  );

  const userClaims: TokenClaims = getCookie("userClaims");

  const [userLegDataState, setUserLegDataState] = useState<any | null>({});

  const { data: userLegData, isLoading } = useGetUserTypeLegalRepQuery({
    IDNumber: userClaims.UserID,
    UserType: userClaims.UserType,
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
  });

  useEffect(() => {
    if (
      userLegData &&
      userLegData.GovRepDetails &&
      userLegData.GovRepDetails.length > 0
    ) {
      const matchingEntity = userLegData.GovRepDetails?.find(
        (item: any) =>
          item.GOVTID === selectedMainCategory?.value &&
          item.SubGOVTID === selectedSubCategory?.value,
      );

      if (matchingEntity) {
        setUserLegDataState(matchingEntity);

        if (selectedMainCategory?.value !== matchingEntity.GOVTID) {
          setCookie("mainCategory", {
            value: matchingEntity.GOVTID,
            label: matchingEntity.GovernmentName,
          });
        }
        if (selectedSubCategory?.value !== matchingEntity.SubGOVTID) {
          setCookie("subCategory", {
            value: matchingEntity.SubGOVTID,
            label: matchingEntity.SubGovernmentName,
          });
        }
      } else {
        const firstEntity = userLegData.GovRepDetails[0];
        setUserLegDataState(firstEntity);
        setCookie("mainCategory", {
          value: firstEntity.GOVTID,
          label: firstEntity.GovernmentName,
        });
        setCookie("subCategory", {
          value: firstEntity.SubGOVTID,
          label: firstEntity.SubGovernmentName,
        });
      }
    }
  }, [userLegData, selectedMainCategory, selectedSubCategory, setCookie]);

  useEffect(() => {
    if (userLegDataState) {
      const formUpdates = {
        LegalRepEmail: userLegDataState?.EmailAddress,
        LegalRepMobileNumber: userLegDataState?.RepMobileNumber,
        LegalRepID: userLegDataState?.RepNationalid,
        LegalRepName: userLegDataState?.RepName,
        SubGovtDefendant_Code: userLegDataState?.SubGOVTID,
        MainGovtDefendant_Code: userLegDataState?.GOVTID,
        SubGovtDefendant: userLegDataState?.SubGovernmentName,
        MainGovtDefendant: userLegDataState?.GovernmentName,
      };

      Object.entries(formUpdates).forEach(([key, value]) => {
        setValue(key, value, {
          shouldValidate: !!value,
        });
      });
    }
  }, [userLegDataState, setValue]);

  const conditionalSection2 = [];
  conditionalSection2.push(
    {
      title: LegalRep("LegalRepresentative"),
      children: [
        {
          type: "readonly",
          label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
          value:
            userLegDataState?.GovernmentName || selectedMainCategory?.label,
          isLoading: isLoading,
        },
        {
          type: "readonly",
          label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
          value:
            userLegDataState?.SubGovernmentName || selectedSubCategory?.label,
          isLoading: isLoading,
        },
      ],
    },
    {
      title: LegalRep("LegalRepresentative"),
      children: [
        {
          type: "readonly",
          label: LegalRep("LegalRepresentativeDetails.LegalRepresentativeName"),
          value: userLegDataState?.RepName,
          isLoading: isLoading,
        },
        {
          type: "readonly",
          label: LegalRep("LegalRepresentativeDetails.LegalRepresentativeID"),
          value: userLegDataState?.RepNationalid,
          isLoading: isLoading,
        },
        {
          type: "readonly",
          label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
          value: userLegDataState?.RepMobileNumber,
          isLoading: isLoading,
        },
        {
          type: "readonly",
          label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
          value: userLegDataState?.EmailAddress,
          isLoading: isLoading,
        },
      ],
    },
  );

  return [...conditionalSection2].filter(Boolean) as SectionLayout[];
};
