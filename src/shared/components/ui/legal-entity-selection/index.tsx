import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

interface GovRepDetail {
  GovernmentName: string;
  SubGOVTID: string;
  SubGovernmentName: string;
  GOVTID: string;
  RepMobileNumber: string;
  RepNationalid: string;
  EmailAddress: string;
  RepName: string;
}

interface UserTypeData {
  GovRepDetails: GovRepDetail[];
}

interface LegalEntitySelectionProps {
  isLegalRep?: boolean;
  setSelectedSubCategory?: any;
  selectedSubCategory?: any;
  setSelectedMainCategory?: any;
  selectedMainCategory?: any;
}

const LegalEntitySelection = ({
  isLegalRep,
  setSelectedSubCategory,
  selectedSubCategory,
  setSelectedMainCategory,
  selectedMainCategory,
}: LegalEntitySelectionProps) => {
  const { t } = useTranslation("login");
  const [getCookie] = useCookieState();
  const userTypeData = getCookie("storeAllUserTypeData") as UserTypeData;

  // If there's exactly one GovRepDetail, pre-select both main & sub
  useEffect(() => {
    if (userTypeData?.GovRepDetails?.length === 1) {
      const singleItem = userTypeData.GovRepDetails[0];
      setSelectedMainCategory({
        value: singleItem.GOVTID,
        label: singleItem.GovernmentName,
      });
      setSelectedSubCategory({
        value: singleItem.SubGOVTID,
        label: singleItem.SubGovernmentName,
      });
    }
  }, [userTypeData]);

  // Build unique "main" list from all GovRepDetails
  const mainCategories = userTypeData?.GovRepDetails
    ? Array.from(
        new Set(
          userTypeData.GovRepDetails.map((item: GovRepDetail) => ({
            name: item.GovernmentName,
            id: item.GOVTID
          }))
        ),
        (item) => item.name
      ).map((name) => {
        const matchingItem = userTypeData.GovRepDetails.find(
          (item: GovRepDetail) => item.GovernmentName === name
        );
        return {
          value: matchingItem?.GOVTID ?? "",
          label: name,
        };
      })
    : [];

  // Build "sub" list based on selectedMainCategory
  const subCategories =
    selectedMainCategory && userTypeData?.GovRepDetails
      ? userTypeData.GovRepDetails
          .filter(
            (item: GovRepDetail) => item.GOVTID === selectedMainCategory.value
          )
          .map((item: GovRepDetail) => ({
            value: item.SubGOVTID,
            label: item.SubGovernmentName,
          }))
      : [];

  const handleMainCategoryChange = (option: any | null) => {
    setSelectedMainCategory(option);
    setSelectedSubCategory(null);
  };

  const handleSubCategoryChange = (option: any | null) => {
    setSelectedSubCategory(option);
  };

  // If there's no GovRepDetails at all, show a "no data" message
  if (!userTypeData?.GovRepDetails) {
    return <div>{t("no_data_available")}</div>;
  }

  const isSingleItem = userTypeData.GovRepDetails.length === 1;

  // If there's exactly one, we've already auto-selected; no need to render either dropdown.
  if (isSingleItem) {
    return null;
  }

  // Otherwise: render two AutoCompleteField side by side
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <AutoCompleteField
          label={t("main_category")}
          options={mainCategories}
          value={selectedMainCategory}
          onChange={handleMainCategoryChange}
        />
      </div>
      <div className="flex-1">
        <AutoCompleteField
          label={t("sub_category")}
          options={subCategories}
          value={selectedSubCategory}
          onChange={handleSubCategoryChange}
        />
      </div>
    </div>
  );
};

export default LegalEntitySelection;
