import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/hearings/manage/api/myCasesApis";
import { useCookieState } from "./useCookieState";

const useEmbassyCaseDetailsPrefill = (
  setValue: (field: string, value: any) => void,
  trigger?: (name?: string | string[]) => Promise<boolean>,
) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading: apiIsLoading }] =
    useLazyGetCaseDetailsQuery();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const caseId = getCookie("caseId");
    const userClaims = getCookie("userClaims");
    const userType = getCookie("userType");
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (
      !caseId ||
      !userType ||
      !userType.toLowerCase().includes("embassy user")
    ) {
      return;
    }

    setIsProcessing(true);

    const storedCaseDetails = localStorage.getItem("CaseDetails");
    if (storedCaseDetails) {
      const parsedCaseDetails = JSON.parse(storedCaseDetails);

      if (parsedCaseDetails.CaseID === caseId) {
        try {
          if (parsedCaseDetails.PlaintiffType_Code === "Self(Worker)") {
            setValue("claimantStatus", "principal");
            setValue("applicantType", "principal");
          } else if (parsedCaseDetails.PlaintiffType_Code === "Agent") {
            setValue("claimantStatus", "representative");
            setValue("applicantType", "representative");
          }

          if (parsedCaseDetails.PlaintiffId) {
            setValue(
              "embassyPrincipal_idNumber",
              parsedCaseDetails.PlaintiffId,
            );
          }
          if (parsedCaseDetails.PlaintiffHijiriDOB) {
            setValue(
              "embassyPrincipal_hijriDate",
              parsedCaseDetails.PlaintiffHijiriDOB,
            );
          }
          if (parsedCaseDetails.PlaintiffName) {
            setValue(
              "embassyPrincipal_userName",
              parsedCaseDetails.PlaintiffName,
            );
          }
          if (parsedCaseDetails.Plaintiff_PhoneNumber) {
            setValue(
              "embassyPrincipal_phoneNumber",
              parsedCaseDetails.Plaintiff_PhoneNumber,
            );
          }
          if (parsedCaseDetails.Plaintiff_ApplicantBirthDate) {
            setValue(
              "embassyPrincipal_gregorianDate",
              parsedCaseDetails.Plaintiff_ApplicantBirthDate,
            );
          }

          if (
            parsedCaseDetails.Plaintiff_Region_Code ||
            parsedCaseDetails.Plaintiff_Region
          ) {
            setValue("embassyPrincipal_region", {
              value: parsedCaseDetails.Plaintiff_Region_Code || "",
              label: parsedCaseDetails.Plaintiff_Region || "",
            });
          }

          if (
            parsedCaseDetails.Plaintiff_City_Code ||
            parsedCaseDetails.Plaintiff_City
          ) {
            setValue("embassyPrincipal_city", {
              value: parsedCaseDetails.Plaintiff_City_Code || "",
              label: parsedCaseDetails.Plaintiff_City || "",
            });
          }

          if (
            parsedCaseDetails.Plaintiff_Occupation_Code ||
            parsedCaseDetails.Plaintiff_Occupation
          ) {
            setValue("embassyPrincipal_occupation", {
              value: parsedCaseDetails.Plaintiff_Occupation_Code || "",
              label: parsedCaseDetails.Plaintiff_Occupation || "",
            });
          }

          if (
            parsedCaseDetails.Plaintiff_Gender_Code ||
            parsedCaseDetails.Plaintiff_Gender
          ) {
            setValue("embassyPrincipal_gender", {
              value: parsedCaseDetails.Plaintiff_Gender_Code || "",
              label: parsedCaseDetails.Plaintiff_Gender || "",
            });
          }

          if (
            parsedCaseDetails.Plaintiff_Nationality_Code ||
            parsedCaseDetails.Plaintiff_Nationality
          ) {
            setValue("embassyPrincipal_nationality", {
              value: parsedCaseDetails.Plaintiff_Nationality_Code || "",
              label: parsedCaseDetails.Plaintiff_Nationality || "",
            });
          }

          if (
            parsedCaseDetails.PlaintiffType_Code === "Agent" ||
            parsedCaseDetails.PlaintiffType === "Agent"
          ) {
            setValue(
              "embassyAgent_agentType",
              parsedCaseDetails.CertifiedBy === "CB1"
                ? "local_agency"
                : "external_agency",
            );
            setValue(
              "embassyAgent_agencyNumber",
              parsedCaseDetails.Agent_MandateNumber || "",
            );
            setValue(
              "embassyAgent_mobileNumber",
              parsedCaseDetails.Plaintiff_MobileNumber || "",
            );
            setValue(
              "embassyAgent_agentName",
              parsedCaseDetails.PlaintiffName || "",
            );
            setValue(
              "embassyAgent_agencyStatus",
              parsedCaseDetails.Agent_MandateStatus || "",
            );
            setValue(
              "embassyAgent_agencySource",
              parsedCaseDetails.Agent_MandateSource || "",
            );
            setValue(
              "embassyAgent_Agent_ResidencyAddress",
              parsedCaseDetails.Agent_ResidencyAddress || "",
            );
            setValue(
              "embassyAgent_Agent_CurrentPlaceOfWork",
              parsedCaseDetails.Agent_CurrentPlaceOfWork || "",
            );

            if (parsedCaseDetails.PlaintiffId) {
              setValue(
                "embassyAgent_workerAgentIdNumber",
                parsedCaseDetails.PlaintiffId,
              );
            }
            if (parsedCaseDetails.PlaintiffHijiriDOB) {
              setValue(
                "embassyAgent_workerAgentDateOfBirthHijri",
                parsedCaseDetails.PlaintiffHijiriDOB,
              );
            }
            if (parsedCaseDetails.PlaintiffName) {
              setValue(
                "embassyAgent_userName",
                parsedCaseDetails.PlaintiffName,
              );
            }
            if (parsedCaseDetails.Plaintiff_ApplicantBirthDate) {
              setValue(
                "embassyAgent_gregorianDate",
                parsedCaseDetails.Plaintiff_ApplicantBirthDate,
              );
            }
            if (parsedCaseDetails.Plaintiff_PhoneNumber) {
              setValue(
                "embassyAgent_phoneNumber",
                parsedCaseDetails.Plaintiff_PhoneNumber,
              );
            }

            if (
              parsedCaseDetails.Plaintiff_Region_Code ||
              parsedCaseDetails.Plaintiff_Region
            ) {
              setValue("embassyAgent_region", {
                value: parsedCaseDetails.Plaintiff_Region_Code || "",
                label: parsedCaseDetails.Plaintiff_Region || "",
              });
            }
            if (
              parsedCaseDetails.Plaintiff_City_Code ||
              parsedCaseDetails.Plaintiff_City
            ) {
              setValue("embassyAgent_city", {
                value: parsedCaseDetails.Plaintiff_City_Code || "",
                label: parsedCaseDetails.Plaintiff_City || "",
              });
            }
            if (
              parsedCaseDetails.Plaintiff_Occupation_Code ||
              parsedCaseDetails.Plaintiff_Occupation
            ) {
              setValue("embassyAgent_occupation", {
                value: parsedCaseDetails.Plaintiff_Occupation_Code || "",
                label: parsedCaseDetails.Plaintiff_Occupation || "",
              });
            }
            if (
              parsedCaseDetails.Plaintiff_Gender_Code ||
              parsedCaseDetails.Plaintiff_Gender
            ) {
              setValue("embassyAgent_gender", {
                value: parsedCaseDetails.Plaintiff_Gender_Code || "",
                label: parsedCaseDetails.Plaintiff_Gender || "",
              });
            }
            if (
              parsedCaseDetails.Plaintiff_Nationality_Code ||
              parsedCaseDetails.Plaintiff_Nationality
            ) {
              setValue("embassyAgent_nationality", {
                value: parsedCaseDetails.Plaintiff_Nationality_Code || "",
                label: parsedCaseDetails.Plaintiff_Nationality || "",
              });
            }

            if (parsedCaseDetails.Plaintiff_Nationality_Code) {
              setValue(
                "embassyAgent_Nationality_Code",
                parsedCaseDetails.Plaintiff_Nationality_Code,
              );
            }

            if (parsedCaseDetails.EmbassyName) {
              setValue(
                "embassyAgent_Agent_EmbassyName",
                parsedCaseDetails.EmbassyName,
              );
            }
            if (parsedCaseDetails.EmbassyPhone) {
              setValue(
                "embassyAgent_Agent_EmbassyPhone",
                parsedCaseDetails.EmbassyPhone,
              );
            }
            if (parsedCaseDetails.EmbassyNationality) {
              setValue(
                "embassyAgent_Agent_EmbassyNationality",
                parsedCaseDetails.EmbassyNationality,
              );
            }
            if (parsedCaseDetails.EmbassyEmailAddress) {
              setValue(
                "embassyAgent_Agent_EmbassyEmailAddress",
                parsedCaseDetails.EmbassyEmailAddress,
              );
            }
            if (parsedCaseDetails.EmbassyFirstLanguage) {
              setValue(
                "embassyAgent_Agent_EmbassyFirstLanguage",
                parsedCaseDetails.EmbassyFirstLanguage,
              );
            }

            if (parsedCaseDetails.ApplicantType) {
              setValue(
                "embassyAgent_applicant",
                parsedCaseDetails.ApplicantType,
              );
            }
          }

          if (trigger) {
            trigger();
          }
        } catch (error) {
        } finally {
          setIsFetched(true);
          setIsProcessing(false);
        }
        return;
      }
    }

    const payload = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber:
        userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment:
        userType === "Legal representative"
          ? getCookie("mainCategory")?.value || ""
          : "",
      SubGovernment:
        userType === "Legal representative"
          ? getCookie("subCategory")?.value || ""
          : "",
    };

    triggerCaseDetailsQuery(payload)
      .then((result) => {
        const details = result?.data?.CaseDetails;

        if (!details) return;

        localStorage.setItem("EmbassyCaseDetails", JSON.stringify(details));

        if (
          details.PlaintiffType_Code === "Self(Worker)" ||
          details.PlaintiffType === "Self(Worker)"
        ) {
          setValue("claimantStatus", "principal");
          setValue("applicantType", "principal");
        } else if (
          details.PlaintiffType_Code === "Agent" ||
          details.PlaintiffType === "Agent"
        ) {
          setValue("claimantStatus", "representative");
          setValue("applicantType", "representative");
        }

        if (
          details.PlaintiffId !== undefined &&
          details.PlaintiffId !== null &&
          details.PlaintiffId !== ""
        ) {
          setValue("embassyPrincipal_idNumber", details.PlaintiffId);
        }

        if (
          details.PlaintiffHijiriDOB !== undefined &&
          details.PlaintiffHijiriDOB !== null &&
          details.PlaintiffHijiriDOB !== ""
        ) {
          setValue("embassyPrincipal_hijriDate", details.PlaintiffHijiriDOB);
        }

        if (
          details.PlaintiffName !== undefined &&
          details.PlaintiffName !== null &&
          details.PlaintiffName !== ""
        ) {
          setValue("embassyPrincipal_userName", details.PlaintiffName);
        }

        if (
          details.Plaintiff_PhoneNumber !== undefined &&
          details.Plaintiff_PhoneNumber !== null &&
          details.Plaintiff_PhoneNumber !== ""
        ) {
          setValue(
            "embassyPrincipal_phoneNumber",
            details.Plaintiff_PhoneNumber,
          );
        }

        if (
          details.Plaintiff_ApplicantBirthDate !== undefined &&
          details.Plaintiff_ApplicantBirthDate !== null &&
          details.Plaintiff_ApplicantBirthDate !== ""
        ) {
          setValue(
            "embassyPrincipal_gregorianDate",
            details.Plaintiff_ApplicantBirthDate,
          );
        }

        if (
          details.Plaintiff_EmailAddress !== undefined &&
          details.Plaintiff_EmailAddress !== null &&
          details.Plaintiff_EmailAddress !== ""
        ) {
          setValue(
            "embassyPrincipal_emailAddress",
            details.Plaintiff_EmailAddress,
          );
        }

        if (
          details.Plaintiff_MobileNumber !== undefined &&
          details.Plaintiff_MobileNumber !== null &&
          details.Plaintiff_MobileNumber !== ""
        ) {
          setValue(
            "embassyPrincipal_mobileNumber",
            details.Plaintiff_MobileNumber,
          );
        }

        if (
          details.Plaintiff_FirstLanguage !== undefined &&
          details.Plaintiff_FirstLanguage !== null &&
          details.Plaintiff_FirstLanguage !== ""
        ) {
          setValue(
            "embassyPrincipal_firstLanguage",
            details.Plaintiff_FirstLanguage,
          );
        }

        if (
          (details.Plaintiff_FirstLanguage_Code !== undefined &&
            details.Plaintiff_FirstLanguage_Code !== null &&
            details.Plaintiff_FirstLanguage_Code !== "") ||
          (details.Plaintiff_FirstLanguage !== undefined &&
            details.Plaintiff_FirstLanguage !== null &&
            details.Plaintiff_FirstLanguage !== "")
        ) {
          setValue("embassyPrincipal_firstLanguage", {
            value: details.Plaintiff_FirstLanguage_Code || "",
            label: details.Plaintiff_FirstLanguage || "",
          });
        }

        if (
          (details.Plaintiff_Region_Code !== undefined &&
            details.Plaintiff_Region_Code !== null &&
            details.Plaintiff_Region_Code !== "") ||
          (details.Plaintiff_Region !== undefined &&
            details.Plaintiff_Region !== null &&
            details.Plaintiff_Region !== "")
        ) {
          const regionValue = {
            value: details.Plaintiff_Region_Code || "",
            label: details.Plaintiff_Region || "",
          };
          setValue("embassyPrincipal_region", regionValue);
        }

        if (
          (details.Plaintiff_City_Code !== undefined &&
            details.Plaintiff_City_Code !== null &&
            details.Plaintiff_City_Code !== "") ||
          (details.Plaintiff_City !== undefined &&
            details.Plaintiff_City !== null &&
            details.Plaintiff_City !== "")
        ) {
          const cityValue = {
            value: details.Plaintiff_City_Code || "",
            label: details.Plaintiff_City || "",
          };
          setValue("embassyPrincipal_city", cityValue);
        }

        if (
          (details.Plaintiff_Occupation_Code !== undefined &&
            details.Plaintiff_Occupation_Code !== null &&
            details.Plaintiff_Occupation_Code !== "") ||
          (details.Plaintiff_Occupation !== undefined &&
            details.Plaintiff_Occupation !== null &&
            details.Plaintiff_Occupation !== "")
        ) {
          const occupationValue = {
            value: details.Plaintiff_Occupation_Code || "",
            label: details.Plaintiff_Occupation || "",
          };
          setValue("embassyPrincipal_occupation", occupationValue);
        }

        if (
          (details.Plaintiff_Gender_Code !== undefined &&
            details.Plaintiff_Gender_Code !== null &&
            details.Plaintiff_Gender_Code !== "") ||
          (details.Plaintiff_Gender !== undefined &&
            details.Plaintiff_Gender !== null &&
            details.Plaintiff_Gender !== "")
        ) {
          const genderValue = {
            value: details.Plaintiff_Gender_Code || "",
            label: details.Plaintiff_Gender || "",
          };
          setValue("embassyPrincipal_gender", genderValue);
        }

        if (
          (details.Plaintiff_Nationality_Code !== undefined &&
            details.Plaintiff_Nationality_Code !== null &&
            details.Plaintiff_Nationality_Code !== "") ||
          (details.Plaintiff_Nationality !== undefined &&
            details.Plaintiff_Nationality !== null &&
            details.Plaintiff_Nationality !== "")
        ) {
          const nationalityValue = {
            value: details.Plaintiff_Nationality_Code || "",
            label: details.Plaintiff_Nationality || "",
          };
          setValue("embassyPrincipal_nationality", nationalityValue);
        }

        if (
          details.PlaintiffType === "Agent" ||
          details.PlaintiffType_Code === "Agent"
        ) {
          setValue(
            "embassyAgent_agentType",
            details.CertifiedBy === "CB1" ? "local_agency" : "external_agency",
          );
          setValue(
            "embassyAgent_agencyNumber",
            details.Agent_MandateNumber || "",
          );
          setValue(
            "embassyAgent_mobileNumber",
            details.Plaintiff_MobileNumber || "",
          );
          setValue("embassyAgent_agentName", details.PlaintiffName || "");
          setValue(
            "embassyAgent_agencyStatus",
            details.Agent_MandateStatus || "",
          );
          setValue(
            "embassyAgent_agencySource",
            details.Agent_MandateSource || "",
          );
          setValue(
            "embassyAgent_Agent_ResidencyAddress",
            details.Agent_ResidencyAddress || "",
          );
          setValue(
            "embassyAgent_Agent_CurrentPlaceOfWork",
            details.Agent_CurrentPlaceOfWork || "",
          );

          if (details.PlaintiffId) {
            setValue("embassyAgent_workerAgentIdNumber", details.PlaintiffId);
          }

          if (details.PlaintiffHijiriDOB) {
            setValue(
              "embassyAgent_workerAgentDateOfBirthHijri",
              details.PlaintiffHijiriDOB,
            );
          }

          if (details.PlaintiffName) {
            setValue("embassyAgent_userName", details.PlaintiffName);
          }

          if (details.Plaintiff_ApplicantBirthDate) {
            setValue(
              "embassyAgent_gregorianDate",
              details.Plaintiff_ApplicantBirthDate,
            );
          }

          if (details.Plaintiff_PhoneNumber) {
            setValue("embassyAgent_phoneNumber", details.Plaintiff_PhoneNumber);
          }

          if (details.EmbassyName) {
            setValue("embassyAgent_Agent_EmbassyName", details.EmbassyName);
          }

          if (details.EmbassyPhone) {
            setValue("embassyAgent_Agent_EmbassyPhone", details.EmbassyPhone);
          }

          if (details.EmbassyNationality) {
            setValue(
              "embassyAgent_Agent_EmbassyNationality",
              details.EmbassyNationality,
            );
          }

          if (details.EmbassyEmailAddress) {
            setValue(
              "embassyAgent_Agent_EmbassyEmailAddress",
              details.EmbassyEmailAddress,
            );
          }

          if (details.EmbassyFirstLanguage) {
            setValue(
              "embassyAgent_Agent_EmbassyFirstLanguage",
              details.EmbassyFirstLanguage,
            );
          }

          if (
            (details.Plaintiff_Region_Code !== undefined &&
              details.Plaintiff_Region_Code !== null &&
              details.Plaintiff_Region_Code !== "") ||
            (details.Plaintiff_Region !== undefined &&
              details.Plaintiff_Region !== null &&
              details.Plaintiff_Region !== "")
          ) {
            const regionValue = {
              value: details.Plaintiff_Region_Code || "",
              label: details.Plaintiff_Region || "",
            };
            setValue("embassyAgent_region", regionValue);
          }

          if (
            (details.Plaintiff_City_Code !== undefined &&
              details.Plaintiff_City_Code !== null &&
              details.Plaintiff_City_Code !== "") ||
            (details.Plaintiff_City !== undefined &&
              details.Plaintiff_City !== null &&
              details.Plaintiff_City !== "")
          ) {
            const cityValue = {
              value: details.Plaintiff_City_Code || "",
              label: details.Plaintiff_City || "",
            };
            setValue("embassyAgent_city", cityValue);
          }

          if (
            (details.Plaintiff_Occupation_Code !== undefined &&
              details.Plaintiff_Occupation_Code !== null &&
              details.Plaintiff_Occupation_Code !== "") ||
            (details.Plaintiff_Occupation !== undefined &&
              details.Plaintiff_Occupation !== null &&
              details.Plaintiff_Occupation !== "")
          ) {
            const occupationValue = {
              value: details.Plaintiff_Occupation_Code || "",
              label: details.Plaintiff_Occupation || "",
            };
            setValue("embassyAgent_occupation", occupationValue);
          }

          if (
            (details.Plaintiff_Gender_Code !== undefined &&
              details.Plaintiff_Gender_Code !== null &&
              details.Plaintiff_Gender_Code !== "") ||
            (details.Plaintiff_Gender !== undefined &&
              details.Plaintiff_Gender !== null &&
              details.Plaintiff_Gender !== "")
          ) {
            const genderValue = {
              value: details.Plaintiff_Gender_Code || "",
              label: details.Plaintiff_Gender || "",
            };
            setValue("embassyAgent_gender", genderValue);
          }

          if (
            (details.Plaintiff_Nationality_Code !== undefined &&
              details.Plaintiff_Nationality_Code !== null &&
              details.Plaintiff_Nationality_Code !== "") ||
            (details.Plaintiff_Nationality !== undefined &&
              details.Plaintiff_Nationality !== null &&
              details.Plaintiff_Nationality !== "")
          ) {
            const nationalityValue = {
              value: details.Plaintiff_Nationality_Code || "",
              label: details.Plaintiff_Nationality || "",
            };
            setValue("embassyAgent_nationality", nationalityValue);
          }

          if (details.Plaintiff_Nationality_Code) {
            setValue(
              "embassyAgent_Nationality_Code",
              details.Plaintiff_Nationality_Code,
            );
          }

          if (details.ApplicantType) {
            setValue("embassyAgent_applicant", details.ApplicantType);
          }
        }

        setIsFetched(true);
        setIsProcessing(false);
      })
      .catch(() => {
        setIsFetched(true);
        setIsProcessing(false);
      });
  }, [getCookie, triggerCaseDetailsQuery, setValue, trigger]);

  return { isFetched, isLoading: isProcessing || apiIsLoading };
};

export default useEmbassyCaseDetailsPrefill;
