import { NICDetailsResponse, useLazyGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { SectionLayout } from "@/shared/components/form/form.types";
import { formatDateString } from "@/shared/lib/helpers";
import { useEffect } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
interface FormLayoutProps {
    watch?: any;
    setValue?: any;
    RegionOptions: any;
    CityOptions: any;
    OccupationOptions: any;
    GenderOptions: any;
    NationalityOptions: any;
}
const EmbasyUserAsPlaintiffFormLayout = (
    {
        setValue,
        watch,
        RegionOptions,
        CityOptions,
        OccupationOptions,
        GenderOptions,
        NationalityOptions
    }: FormLayoutProps
) => {
 
    const { t } = useTranslation("hearingdetails");
    const [getCookie] = useCookieState();
 
    const userClaims: TokenClaims = getCookie("userClaims");
    const getNicData: NICDetailsResponse = getCookie("storeAllNicData");
    const idNumber = userClaims.UserID;
    const claimType = watch("claimantStatus");
 
    useEffect(() => {
        if (claimType === "principal") {
            if (getNicData?.NICDetails) {
                const nic = getNicData.NICDetails;
                if (nic?.PlaintiffName) {
                    setValue("userName", nic?.PlaintiffName || "");
                }
                if (nic?.Region_Code) {
                    setValue("region", {
                        value: nic?.Region_Code || "",
                        label: nic?.Region || "",
                    });
                }
                if (nic?.City_Code) {
                    setValue("city", { value: nic?.City_Code || "", label: nic?.City || "" });
                }
                if (nic?.Occupation_Code) {
                    setValue("occupation", {
                        value: nic?.Occupation_Code || "",
                        label: nic?.Occupation || "",
                    });
                }
                if (nic?.Gender_Code) {
                    setValue("gender", {
                        value: nic?.Gender_Code || "",
                        label: nic?.Gender || "",
                    });
                }
                if (nic?.Nationality_Code) {
                    setValue("nationality", {
                        value: nic?.Nationality_Code || "",
                        label: nic?.Nationality || "",
                    });
 
                }
                if (nic?.DateOfBirthHijri) {
                    setValue("hijriDate", nic?.DateOfBirthHijri || "");
                }
                if (nic?.DateOfBirthGregorian) {
                    setValue("gregorianDate", nic?.DateOfBirthGregorian || "");
                }
                if (nic?.Applicant) {
                    setValue("applicant", nic?.Applicant || "");
                }
                if (nic.PhoneNumber) {
                    setValue("phoneNumber", nic.PhoneNumber.toString());
                }
            }
        }
    }, [claimType]);
 
    const formLayout: SectionLayout[] = [
        {
            title: t("nicDetails.plaintiffData"),
            className: "personal-info-section",
            gridCols: 3,
            children: [
                // ID Number (readonly)
                {
                    type: "readonly" as const,
                    label: t("nicDetails.idNumber"),
                    value: idNumber,
 
                },
 
                // Name
                ...(getNicData?.NICDetails?.PlaintiffName
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.name"),
                            value: getNicData?.NICDetails?.PlaintiffName,
                        },
                    ]
                    : [
                        {
                            type: "input" as const,
                            name: "userName",
                            inputType: "text",
                            label: t("nicDetails.name"),
                            value: watch("userName"),
                            onChange: (v: string) => setValue("userName", v),
                            validation: { required: t("nameValidation") },
                        },
                    ]),
 
                // Region
                ...(getNicData?.NICDetails?.Region
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.region"),
                            value: getNicData?.NICDetails?.Region,
                        },
                    ]
                    : [
                        {
                            type: "autocomplete" as const,
                            name: "region",
                            label: t("nicDetails.region"),
                            options: RegionOptions,
                            value: watch("region"),
                            onChange: (v: string) => setValue("region", v),
                            validation: { required: t("regionValidation") },
                        },
                    ]),
 
                // City
                ...(getNicData?.NICDetails?.City
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.city"),
                            value: getNicData?.NICDetails?.City,
                            onChange: (v: string) => setValue("city", v),
                            validation: { required: t("cityValidation") },
                        },
                    ]
                    : [
                        {
                            type: "autocomplete" as const,
                            name: "city",
                            label: t("nicDetails.city"),
                            options: CityOptions,
                            value: watch("city"),
                            onChange: (v: string) => setValue("city", v),
                            validation: { required: t("cityValidation") },
                        },
                    ]),
 
                {
                    type: "readonly" as const,
                    label: t("nicDetails.dobHijri"),
                    value: formatDateString(getNicData?.NICDetails?.DateOfBirthHijri) || "",
                },
                {
                    type: "readonly" as const,
                    label: t("nicDetails.dobGrog"),
                    value: formatDateString(getNicData?.NICDetails?.DateOfBirthGregorian),
                },
 
                // Phone Number
                ...(getNicData?.NICDetails?.PhoneNumber
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.phoneNumber"),
                            value: getNicData?.NICDetails?.PhoneNumber,
                        },
                    ]
                    : [
                        {
                            type: "input" as const,
                            name: "phoneNumber",
                            inputType: "text",
                            placeholder: "05xxxxxxxx",
                            label: t("nicDetails.phoneNumber"),
                            value: watch("phoneNumber"),
                            onChange: (v: string) => setValue("phoneNumber", v),
                            validation: {
                                required: t("phoneNumberValidation"),
                                pattern: {
                                    value: /^05\d{8}$/,
                                    message: t("phoneValidationMessage"),
                                },
                            },
                        },
                    ]),
 
                // Occupation
                ...(getNicData?.NICDetails?.Occupation
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.occupation"),
                            value: getNicData?.NICDetails?.Occupation,
                        },
                    ]
                    : [
                        {
                            type: "autocomplete" as const,
                            name: "occupation",
                            label: t("nicDetails.occupation"),
                            options: OccupationOptions,
                            value: watch("occupation"),
                            onChange: (v: string) => setValue("occupation", v),
                            validation: { required: t("occupationValidation") },
                        },
                    ]),
 
                // Gender
                ...(getNicData?.NICDetails?.Gender
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.gender"),
                            value: getNicData?.NICDetails?.Gender,
                        },
                    ]
                    : [
                        {
                            type: "autocomplete" as const,
                            name: "gender",
                            label: t("nicDetails.gender"),
                            options: GenderOptions,
                            value: watch("gender"),
                            onChange: (v: string) => setValue("gender", v),
                            validation: { required: t("genderValidation") },
                        },
                    ]),
 
                // Nationality
                ...(getNicData?.NICDetails?.Nationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.nationality"),
                            value: getNicData?.NICDetails?.Nationality,
                        },
                    ]
                    : [
                        {
                            type: "autocomplete" as const,
                            name: "nationality",
                            label: t("nicDetails.nationality"),
                            options: NationalityOptions,
                            value: watch("nationality"),
                            onChange: (v: string) => setValue("nationality", v),
                            validation: { required: t("nationalityValidation") },
                        },
                    ]),
 
 
            ],
        }
    ].filter(Boolean) as SectionLayout[];
 
    return formLayout;
};
 
 
export default EmbasyUserAsPlaintiffFormLayout;