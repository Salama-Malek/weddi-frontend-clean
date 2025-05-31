import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

interface LegalEntitySelectionProps {
  isLegalRep?: boolean;
  setSelectedSubCategory?: any;
  selectedSubCategory?: any;
  setSelectedMainCategory?: any;
  selectedMainCategory?: any;
}

type OptionType = { value: string; label: string };

const LegalEntitySelection = ({
  isLegalRep,
  setSelectedSubCategory,
  selectedSubCategory,
  setSelectedMainCategory,
  selectedMainCategory,
}: LegalEntitySelectionProps) => {
  const { t, i18n } = useTranslation("login");
  const [getCookie] = useCookieState();
  const userId = getCookie("userClaims").UserID;
  const userType = getCookie("userClaims").UserType;

  const { data: userTypeLegalRepData, isFetching } =
    useGetUserTypeLegalRepQuery(
      {
        IDNumber: userId,
        UserType: userType,
        AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
      },
      { skip: !isLegalRep }
    );
  // //console.log("userTypeLegalRepData", userTypeLegalRepData);

  useEffect(() => {
    if (userTypeLegalRepData?.GovRepDetails?.length === 1) {
      const singleItem = userTypeLegalRepData.GovRepDetails[0];
      setSelectedMainCategory({
        value: singleItem.GOVTID,
        label: singleItem.GovernmentName,
      });
      setSelectedSubCategory({
        value: singleItem.SubGOVTID,
        label: singleItem.SubGovernmentName,
      });
    }
  }, [userTypeLegalRepData]);

  const mainCategories: any[] = userTypeLegalRepData?.GovRepDetails
    ? Array.from(
        new Set(
          userTypeLegalRepData.GovRepDetails.map((item) => item.GovernmentName)
        )
      ).map((name) => {
        const firstItem = userTypeLegalRepData.GovRepDetails.find(
          (item) => item.GovernmentName === name
        );
        return {
          value: firstItem?.GOVTID ?? "",
          label: name,
        };
      })
    : [];

  const subCategories: any[] =
    selectedMainCategory && userTypeLegalRepData?.GovRepDetails
      ? userTypeLegalRepData.GovRepDetails.filter(
          (item) => item.GOVTID === selectedMainCategory.value
        ).map((item) => ({
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

  if (isFetching) {
    return (
      <>
        <div className="flex gap-4">
          <div className="wave-loading h-8 w-72 rounded-xs"></div>
          <div className="wave-loading h-8 w-72 rounded-xs"></div>
        </div>
      </>
    );
  }

  if (!userTypeLegalRepData?.GovRepDetails) {
    return <div>{t("no_data_available")}</div>;
  }

  const isSingleItem = userTypeLegalRepData.GovRepDetails.length === 1;

  return (
    <>
      <p className="text-sm28 text-gray-500 normal">{t("entity_select")}</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          {isSingleItem ? (
            <div className="form-group">
              <label className="text-sm !leading-5 normal">
                {t("main_category")}
              </label>
              <div className="medium text-2md">
                {selectedMainCategory?.label}
              </div>
            </div>
          ) : (
            <AutoCompleteField
              options={mainCategories}
              label={t("main_category")}
              value={selectedMainCategory}
              onChange={handleMainCategoryChange}
              invalidFeedback={
                selectedMainCategory === null ? t("select_main_category") : ""
              }
            />
          )}
        </div>
        <div>
          {isSingleItem ? (
            <div className="form-group">
              <label className="text-sm !leading-5 normal">
                {t("sub_category")}
              </label>
              <div className="medium text-2md">
                {selectedSubCategory?.label}
              </div>
            </div>
          ) : (
            <AutoCompleteField
              options={subCategories}
              label={t("sub_category")}
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              invalidFeedback={
                selectedSubCategory === null ? t("select_sub_category") : ""
              }
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LegalEntitySelection;
