import { UseFormWatch } from "react-hook-form";
import {
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { Children, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";


export const useLegalRepPlaintiffFormLayout = (
  watch: UseFormWatch<FormData>,
  userTypeLegalRepData?: any,
  setValue?: any
): SectionLayout[] => {
  const { t: LegalRep, i18n } = useTranslation("legal_rep");
  const [getCookie, setCookie] = useCookieState({
    mainCategory: "mainCategory",
    subCategory: "subCategory",
  });


  const [selectedMainCategory, setSelectedMainCategory] = useState<any | null>(
    getCookie("mainCategory")
  );
  // //console.log("selectedMainCategory$$$", selectedMainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any | null>(
    getCookie("subCategory")
  );
  const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
    (item: any) => item.GOVTID === selectedMainCategory?.value
  );


  //#region Hassan Code Here  
  const userClaims: TokenClaims = getCookie("userClaims");

  const [userLegDataState, setUserLegDataState] = useState<any | null>({});

  const { data: userLegData, isLoading } = useGetUserTypeLegalRepQuery(
    {
      IDNumber: userClaims.UserID,
      UserType: userClaims.UserType,
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
    },
  );


  useEffect(() => {
    if (userLegData && userLegData.GovRepDetails &&
      userLegData.GovRepDetails.length > 0) {
      setUserLegDataState(
        userLegData.GovRepDetails?.find(
          (item: any) =>
            item.GOVTID === selectedMainCategory?.value || item.GOVTID
        ));

        //console.log(userLegData);
        //console.log(userLegDataState);
    }

  }, [userLegData])



  useEffect(() => {
    setValue("LegalRepEmail", userLegDataState?.EmailAddress, {
      shouldValidate: userLegDataState?.EmailAddress,
    });
    setValue("LegalRepMobileNumber", userLegDataState?.RepMobileNumber, {
      shouldValidate: userLegDataState?.RepMobileNumber,
    });
    setValue("LegalRepID", userLegDataState?.RepNationalid, {
      shouldValidate: userLegDataState?.RepNationalid,
    });
    setValue("LegalRepName", userLegDataState?.RepName, {
      shouldValidate: userLegDataState?.RepName,
    });
    setValue("SubGovtDefendant_Code", userLegDataState?.SubGOVTID, {
      shouldValidate: userLegDataState?.SubGOVTID,
    });
    setValue("MainGovtDefendant_Code", userLegDataState?.GOVTID, {
      shouldValidate: userLegDataState?.GOVTID,
    });
    setValue("SubGovtDefendant", userLegDataState?.SubGovernmentName, {
      shouldValidate: userLegDataState?.SubGovernmentName,
    });
    setValue("MainGovtDefendant", userLegDataState?.GovernmentName, {
      shouldValidate: userLegDataState?.GovernmentName,
    });
  }, [userLegDataState])

  //#endregion Hassan Code Here 


  const plaintiffStatus = watch("plaintiffStatus");


  // const conditionalSections = [];
  // conditionalSections.push(
  //   {
  //     data: {
  //       type: "readonly",
  //       fields: [
  //         {
  //           label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
  //           value: selectedMainCategory?.label,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
  //           value: selectedSubCategory?.label,
  //           isLoading: isLoading
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     title: LegalRep("LegalRepresentative"),
  //     data: {
  //       type: "readonly",
  //       fields: [
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeName"
  //           ),
  //           value: userLegDataState?.RepName,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeName"
  //           ),
  //           value: userLegDataState?.RepName,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeID"
  //           ),
  //           value: userLegDataState?.RepNationalid,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
  //           value: userLegDataState?.RepMobileNumber,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
  //           value: userLegDataState?.EmailAddress,
  //           isLoading: isLoading
  //         },
  //       ],
  //     },
  //   }
  // );

  const conditionalSection2 = [];
  conditionalSection2.push({
    title: LegalRep("LegalRepresentative"),
    children: [
      {
        type: "readonly",
        label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
        value: userLegDataState?.GovernmentName,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
        value: userLegDataState?.SubGovernmentName,
        isLoading: isLoading
      },
    ]
  }, {
    title: LegalRep("LegalRepresentative"),
    children: [
      {
        type: "readonly",
        label: LegalRep(
          "LegalRepresentativeDetails.LegalRepresentativeName"
        ),
        value: userLegDataState?.RepName,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep(
          "LegalRepresentativeDetails.LegalRepresentativeID"
        ),
        value: userLegDataState?.RepNationalid,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
        value: userLegDataState?.RepMobileNumber,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
        value: userLegDataState?.EmailAddress,
        isLoading: isLoading
      },
    ]
  })



  return [
    ...conditionalSection2,
  ].filter(Boolean) as SectionLayout[];
};
