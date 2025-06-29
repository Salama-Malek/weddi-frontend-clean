import { NICDetailsResponse, useLazyGetNICDetailsQuery, useGetNICDetailsQuery, useLazyGetNICDetailsForEmbasyQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { SectionLayout } from "@/shared/components/form/form.types";
import { formatDateString } from "@/shared/lib/helpers";
import { useEffect, useMemo, useState } from "react";
import {
    Control,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
interface FormLayoutProps {
    control: any;
    watch?: any;
    setValue?: any;
    RegionOptions: any;
    CityOptions: any;
    OccupationOptions: any;
    GenderOptions: any;
    NationalityOptions: any;
    setError: (name: string, error: any) => void;
    clearErrors: (name: string) => void;
}

interface EmbassyUserInfo {
    EmbassyUserId: string;
    EmbassyFirstLanguage: string;
    EmbassyID: string;
    EmbassyName: string;
    EmbassyNationality: string;
    EmabassyEmail: string;
    EmbassyPhone: string;
    Nationality_Code: string;
}
interface NICDetails {
    PlaintiffName?: string;
    Region?: string;
    City?: string;
    DateOfBirthHijri?: string;
    DateOfBirthGregorian?: string;
    Occupation?: string;
    Gender?: string;
    Nationality?: string;
    Applicant_Code?: string;
    Applicant?: string;
    PhoneNumber?: string;
    Occupation_Code?: string
    City_Code?: string
    Gender_Code?: string
    Region_Code?: string
    Nationality_Code?: string
}


const EmbasyUserAsAgentFormLayout = ({
    control,
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
    setError,
    clearErrors,
}: FormLayoutProps) => {

    const { t, i18n } = useTranslation("hearingdetails");
    const [getCookie] = useCookieState();

    const userClaims: TokenClaims = getCookie("userClaims");
    const embasyUserData = getCookie("storeAllUserTypeData");
    const idNumber = userClaims.UserID;
    const claimStatus = watch("claimantStatus");
    const PlaintiffId = watch("workerAgentIdNumber");
    const PlaintifDOB = watch("workerAgentDateOfBirthHijri");
    const nationality = watch("nationality");
    const [isValid, setIsValid] = useState<boolean>(false);
    const [validNationality, setValidNationality] = useState<boolean>(false);
    let rd: NICDetails = {
        PlaintiffName: "",
        Region: "",
        City: "",
        DateOfBirthHijri: "",
        DateOfBirthGregorian: "",
        Occupation: "",
        Gender: "",
        Nationality: "",
        Applicant_Code: "",
        Applicant: "",
        PhoneNumber: "",
        Occupation_Code: "",
        City_Code: "",
        Gender_Code: "",
        Region_Code: "",
        Nationality_Code: "",
    };
    const claimType = watch("claimantStatus");

    useEffect(() => {
        if (claimType === "representative") {
            console.log("ented here to get the embasy data");

            if (embasyUserData && embasyUserData?.EmbassyInfo
                && embasyUserData?.EmbassyInfo?.length > 0
            ) {
                setValue("Agent_EmbassyName", embasyUserData?.EmbassyInfo?.[0]?.EmbassyName);
                setValue("Agent_EmbassyNationality", embasyUserData?.EmbassyInfo?.[0]?.EmbassyNationality);
                setValue("Agent_EmbassyPhone", embasyUserData?.EmbassyInfo?.[0]?.EmbassyPhone);
                setValue("Agent_EmbassyFirstLanguage", embasyUserData?.EmbassyInfo?.[0]?.EmbassyFirstLanguage);
                setValue("Agent_EmbassyEmailAddress", embasyUserData?.EmbassyInfo?.[0]?.EmabassyEmail);
                setValue("Nationality_Code", embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code);
            } else {
                setValue("Agent_EmbassyName", "");
                setValue("Agent_EmbassyNationality", "");
                setValue("Agent_EmbassyPhone", "");
                setValue("Agent_EmbassyFirstLanguage", "");
                setValue("Agent_EmbassyEmailAddress", "");
                setValue("Nationality_Code", "");
            }

            [
                "workerAgentDateOfBirthHijri",
                "workerAgentIdNumber",
                "userName",
                "region",
                "city",
                "occupation",
                "gender",
                "nationality",
                "hijriDate",
                "gregorianDate",
                "applicant",
                "phoneNumber",
            ].forEach((f) => {
                console.log("this is the field", f);
                setValue(f as any, "");

            });
        }
    }, [claimType])


    useEffect(() => {
        if (PlaintifDOB && PlaintiffId?.length == 10) {
            console.log("Valid Nic Call Fom Embasy ");
            setIsValid(true);
            const unFormattedNic = unFormattedNicDate(PlaintifDOB);
            getNicData({
                IDNumber: PlaintiffId,
                DateOfBirth: unFormattedNic || "",
                AcceptedLanguage: i18n.language.toUpperCase(),
                SourceSystem: "E-Services",
            });
        } else {
            setIsValid(false);
        }
    }, [PlaintiffId, PlaintifDOB]);

    const unFormattedNicDate = (date: string) => {
        if (date) {
            return date?.replaceAll("/", "");
        }
    };

    // Add the API query
    const [getNicData, { data: nicData, isFetching: nicLoading, }] = useLazyGetNICDetailsForEmbasyQuery(

    );

    useEffect(() => {
        console.log("this is the nicData", nicData);
        if (nicData?.NICDetails) {

            if (nicData?.NICDetails?.Nationality_Code !== embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code) {
                setValidNationality(false);
                toast.error(t("nationality_error"));
                console.log("this is the nationality code",
                    nicData?.NICDetails?.Nationality_Code,
                    embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code
                );
                return;
            } else {
                setValidNationality(true);
            }

            if (nicData?.NICDetails?.PlaintiffName) {
                setValue("userName", nicData?.NICDetails?.PlaintiffName || "");
            }
            if (nicData?.NICDetails?.Region_Code) {
                setValue("region", {
                    value: nicData?.NICDetails?.Region_Code || "",
                    label: nicData?.NICDetails?.Region || "",
                });
            }
            if (nicData?.NICDetails?.City_Code) {
                setValue("city", { value: nicData?.NICDetails?.City_Code || "", label: nicData?.NICDetails?.City || "" });
            }
            if (nicData?.NICDetails?.Occupation_Code) {
                setValue("occupation", {
                    value: nicData?.NICDetails?.Occupation_Code || "",
                    label: nicData?.NICDetails?.Occupation || "",
                });
            }
            if (nicData?.NICDetails?.Gender_Code) {
                setValue("gender", {
                    value: nicData?.NICDetails?.Gender_Code || "",
                    label: nicData?.NICDetails?.Gender || "",
                });
            }
            if (nicData?.NICDetails?.Nationality_Code) {
                setValue("nationality", {
                    value: nicData?.NICDetails?.Nationality_Code || "",
                    label: nicData?.NICDetails?.Nationality || "",
                });
            }
            if (nicData?.NICDetails?.DateOfBirthHijri) {
                setValue("hijriDate", nicData?.NICDetails?.DateOfBirthHijri || "");
            }
            if (nicData?.NICDetails?.DateOfBirthGregorian) {
                setValue("gregorianDate", nicData?.NICDetails?.DateOfBirthGregorian || "");
            }
            if (nicData?.NICDetails?.PhoneNumber) {
                setValue("phoneNumber", nicData?.NICDetails?.PhoneNumber.toString());
            }

        }
    }, [nicData]);

    useEffect(() => {
        console.log("this is the nationality and claimantStatus ", nationality, watch("claimantStatus"));
        if (watch("claimantStatus") !== "representative") return;

        if (nationality && nationality.value !== embasyUserData.EmbassyInfo[0].Nationality_Code) {
            console.log("Entered Here");
            toast.error(t("nationality_error"));
            [
                "userName",
                "region",
                "city",
                "occupation",
                "gender",
                "nationality",
                "hijriDate",
                "gregorianDate",
                "applicant",
                "phoneNumber",
            ].forEach((f) => setValue(f as any, undefined));
            setError("nationality", { message: t("nationality_error") });
        }


    }, [nationality]);





    const formLayout: SectionLayout[] = [

        ...[{
            title: t("nicDetails.agentData"),
            className: "agent-data-section",
            gridCols: 3,
            children: [
                {
                    type: "readonly" as const,
                    label: t("nicDetails.idNumber"),
                    value: idNumber,
                },
                {

                    type: "readonly" as const,
                    label: t("embassyUser.name"),
                    name: "Agent_EmbassyName",
                    value: watch("Agent_EmbassyName"),
                },
                {
                    type: "readonly" as const,
                    label: t("embassyUser.phoneNumber"),
                    name: "Agent_EmbassyPhone",
                    value: watch("Agent_EmbassyPhone"),
                },
                {
                    type: "readonly" as const,
                    label: t("embassyUser.nationality"),
                    name: "Agent_EmbassyNationality",
                    value: watch("Agent_EmbassyNationality"),
                },
                {
                    type: "readonly" as const,
                    label: t("embassyUser.emailAddress"),
                    name: "Agent_EmbassyEmailAddress",
                    value: watch("Agent_EmbassyEmailAddress"),
                },
                {
                    type: "readonly" as const,
                    label: t("embassyUser.firstLanguage"),
                    name: "Agent_EmbassyFirstLanguage",
                    value: watch("Agent_EmbassyFirstLanguage"),
                },

            ],
        }],
        ...[{
            title: t("nicDetails.plaintiffData"),
            className: "plaintiff-data-section",
            gridCols: 3,
            children: [
                // 1) Plaintiff ID

                {
                    type: "input",
                    name: "workerAgentIdNumber",
                    label: t("nicDetails.idNumber"),
                    value: watch("workerAgentIdNumber"),
                    onChange: (v: string) => {
                        setValue("workerAgentIdNumber", v);
                        clearErrors("workerAgentIdNumber");
                    },
                    validation: {
                        required: t("idNumberValidation"),
                        pattern: { value: /^\d{10}$/, message: t("max10ValidationDesc") },
                    },
                    isLoading: nicLoading,
                },

                // 2) Hijri DOB
                {
                    name: "dateOfBirth",
                    type: "dateOfBirth",
                    hijriLabel: t("nicDetails.dobHijri"),
                    gregorianLabel: t("nicDetails.dobGrog"),
                    hijriFieldName: "workerAgentDateOfBirthHijri",
                    gregorianFieldName: "gregorianDate",
                    validation: { required: t("dateValidation") },
                    invalidFeedback: t("dateValidationDesc"),
                    isLoading: nicLoading,
                    control, // ← wire up the RHF control
                    value: watch("workerAgentDateOfBirthHijri"), // ← current hijri value
                },



                ...(nicData?.NICDetails?.PlaintiffName && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.name"),
                            value: nicData?.NICDetails?.PlaintiffName,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.Region && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.region"),
                            value: nicData?.NICDetails?.Region,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.City && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.city"),
                            value: nicData?.NICDetails?.City,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.PhoneNumber && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.phoneNumber"),
                            value: nicData?.NICDetails?.PhoneNumber,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.Occupation && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.occupation"),
                            value: nicData?.NICDetails?.Occupation,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.Gender && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.gender"),
                            value: nicData?.NICDetails?.Gender,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),
                ...(nicData?.NICDetails?.Nationality && validNationality
                    ? [
                        {
                            type: "readonly" as const,
                            label: t("nicDetails.nationality"),
                            value: nicData?.NICDetails?.Nationality,
                            isLoading: nicLoading,
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
                            isLoading: nicLoading,
                        },
                    ]),

            ],

        }]
    ].filter(Boolean) as SectionLayout[];

    return formLayout;
};

export default EmbasyUserAsAgentFormLayout;