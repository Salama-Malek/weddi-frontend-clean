import React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/layouts/Section";
import { ReadOnlyField } from "@/shared/components/ui/read-only-view";
import { formatDate } from "@/utils/formatters";
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";

function formatHijriWithSlashes(date: string): string {
  if (!date) return "";
  if (date.includes("/")) return date;
  if (/^\d{8}$/.test(date)) return formatDate(date);
  if (/^\d{6}$/.test(date)) {
    const year = date.substring(0, 2);
    const month = date.substring(2, 4);
    const day = date.substring(4, 6);
    return `${day}/${month}/14${year}`;
  }
  return date;
}

interface DataDetailsProps {
  hearing: any;
}
interface SectionOrder {
  [key: string]: {
    title: string;
    fields: string[];
  };
}

const formatLabel = (key: string): string =>
  key
    .replace(/[_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const sectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: ["Plaintiff_MainGovt", "Plaintiff_SubGovt"],
  },
  representative: {
    title: "representative_details",
    fields: [
      "RepresentativeType",
      "RepresentativeName",
      "RepresentativeID",
      "Rep_PhoneNumber",
      "Rep_EmailAddress",
      "Rep_BirthDate",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantId",
      "DefendantName",
      "Defendant_ApplicantBirthDate",
      "DefendantHijiriDOB",
      "Defendant_PhoneNumber",
      "Defendant_MobileNumber",
      "Defendant_EmailAddress",
      "Defendant_Occupation",
      "Defendant_Region",
      "Defendant_City",
      "Defendant_Gender",
      "Defendant_Nationality",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Defendant_SalaryType",
      "Defendant_Salary",
      "Defendant_ContractType",
      "Defendant_ContractNumber",
      "Defendant_ContractStartDate",
      "Defendant_ContractEndDate",
      "Defendant_StillWorking",
      "Defendant_JobStartDate",
      "Defendant_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Defendant_JobLocation", "DefendantJobCity", "OfficeName"],
  },
};

const legelRepSectionOrderAsDef: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },

  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const sectionForEstablishmentOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffEstFileNumber",
      "Plaintiff_CRNumber",
      "Plaintiff_Number700",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantId",
      "DefendantName",
      "Defendant_PhoneNumber",
      "DefendantHijiriDOB",
      "Defendant_ApplicantBirthDate",

      "Defendant_Region",
      "Defendant_City",
      "Defendant_Gender",
      "Defendant_Nationality",
      "Defendant_Occupation",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Defendant_SalaryType",
      "Defendant_Salary",
      "Defendant_ContractType",
      "Defendant_ContractNumber",
      "Defendant_ContractStartDateHijri",
      "Defendant_ContractStartDate",
      "Defendant_ContractEndDateHijri",
      "Defendant_ContractEndDate",
      "Defendant_StillWorking",
      "Defendant_JobStartDate",
      "Defendant_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Defendant_JobLocation", "DefendantJobCity", "OfficeName"],
  },
};

const EstablishmentSectionOrderAsDef: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },

  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
      "Defendant_Number700",
      "DefendantName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const embasyAsAgentVsGovSectionOrder: SectionOrder = {
  agent: {
    title: "AgentInformation",
    fields: [
      "EmbassyName",
      "EmbassyEmailAddress",
      "EmbassyNationality",
      "EmbassyPhone",
      "EmbassyFirstLanguage",
    ],
  },
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const embasyAsAgentVsEstSectionOrder: SectionOrder = {
  agent: {
    title: "AgentInformation",
    fields: [
      "EmbassyName",
      "EmbassyEmailAddress",
      "EmbassyNationality",
      "EmbassyPhone",
      "EmbassyFirstLanguage",
    ],
  },
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
      "Defendant_Number700",
      "DefendantName",
      "EstablishmentFullName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const embasyAsSelfVsGovSectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const embasyAsSelfVsEstSectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
      "Defendant_Number700",
      "DefendantName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const plaintiffAsWorkerFelids = () => ({
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
});

const plaintiffAsAgentWorkerFelids = () => ({
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
});

const plaintiffAsLegelrepFelids = () => ({
  plaintiff: {
    title: "plaintiff_details",
    fields: ["Plaintiff_MainGovt", "Plaintiff_SubGovt"],
  },
});

const plaintiffAsEstablishmentFelids = () => ({
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffEstFileNumber",
      "Plaintiff_CRNumber",
      "Plaintiff_Number700",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
});

const deffendentAsWorkerFelids = (DefendantType_Code: string) => {
  if (DefendantType_Code === "Government") {
    return {
      defendant: {
        title: "defendant_details",
        fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
      },
    };
  } else {
    return {
      defendant: {
        title: "defendant_details",
        fields: [
          "DefendantEstFileNumber",
          "Defendant_CRNumber",
          "Defendant_Number700",
          "DefendantName",
          "EstablishmentFullName",
          "Defendant_Region",
          "Defendant_City",
        ],
      },
    };
  }
};

const defendentAsWorkerFelids = () => ({
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantId",
      "DefendantName",
      "Defendant_PhoneNumber",
      "DefendantHijiriDOB",
      "Defendant_ApplicantBirthDate",
      "Defendant_Region",
      "Defendant_City",
      "Defendant_Gender",
      "Defendant_Nationality",
      "Defendant_Occupation",
    ],
  },
});

const workDetailsFelids = (workDetailsType: string) => {
  if (workDetailsType === "Plaintiff") {
    return {
      work: {
        title: "work_details",
        fields: [
          "Plaintiff_SalaryType",
          "Plaintiff_Salary",
          "Plaintiff_ContractType",
          "Plaintiff_ContractNumber",
          "Plaintiff_ContractStartDate",
          "Plaintiff_ContractEndDate",
          "Plaintiff_StillWorking",
          "Plaintiff_JobStartDate",
          "Plaintiff_JobEndDate",
        ],
      },
      location: {
        title: "work_location_details",
        fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
      },
    };
  }
  return {
    work: {
      title: "work_details",
      fields: [
        "Defendant_SalaryType",
        "Defendant_Salary",
        "Defendant_ContractType",
        "Defendant_ContractNumber",
        "Defendant_ContractStartDateHijri",
        "Defendant_ContractStartDate",
        "Defendant_ContractEndDateHijri",
        "Defendant_ContractEndDate",
        "Defendant_StillWorking",
        "Defendant_JobStartDate",
        "Defendant_JobEndDate",
      ],
    },
    location: {
      title: "work_location_details",
      fields: ["Defendant_JobLocation", "DefendantJobCity", "OfficeName"],
    },
  };
};

const WorkerViewAsPalintiffVsEstablishemtn: SectionOrder = {
  ...plaintiffAsWorkerFelids(),
  ...deffendentAsWorkerFelids("Establishment"),
  ...workDetailsFelids("Plaintiff"),
};
const WorkerViewAsPalintiffVsGovernment: SectionOrder = {
  ...plaintiffAsWorkerFelids(),
  ...deffendentAsWorkerFelids("Government"),
  ...workDetailsFelids("Plaintiff"),
};
const WorkerViewAsAgentVsEstablishemtn: SectionOrder = {
  ...plaintiffAsAgentWorkerFelids(),
  ...deffendentAsWorkerFelids("Establishment"),
  ...workDetailsFelids("Plaintiff"),
};
const WorkerViewAsAgentVsGovernment: SectionOrder = {
  ...plaintiffAsAgentWorkerFelids(),
  ...deffendentAsWorkerFelids("Government"),
  ...workDetailsFelids("Plaintiff"),
};

const EstablishmentViewAsPalintiff: SectionOrder = {
  ...plaintiffAsEstablishmentFelids(),
  ...defendentAsWorkerFelids(),
  ...workDetailsFelids("Defendant"),
};

const LegelRepViewAsPalintiff: SectionOrder = {
  ...plaintiffAsLegelrepFelids(),
  ...defendentAsWorkerFelids(),
  ...workDetailsFelids("Defendant"),
};

const filterAndOrderData = (data: any, userType?: string, t?: any) => {
  let selected_Section: SectionOrder = {};

  if (userType?.toLowerCase() === "legal representative") {
    if (data["DefendantType_Code"] === "Government") {
      selected_Section = legelRepSectionOrderAsDef;
    } else {
      selected_Section = sectionOrder;
    }
  }
  if (userType?.toLowerCase() === "establishment") {
    if (data["DefendantType_Code"] === "Establishment") {
      selected_Section = EstablishmentSectionOrderAsDef;
    } else {
      selected_Section = sectionForEstablishmentOrder;
    }
  }
  if (userType?.toLowerCase() === "embassy user") {
    if (
      data["RepresentativeType_Code"] &&
      data["RepresentativeType_Code"] === "Legal representative"
    ) {
      selected_Section = LegelRepViewAsPalintiff;
    } else if (data["ApplicantType_Code"] === "Establishment") {
      selected_Section = EstablishmentViewAsPalintiff;
    } else if (data["PlaintiffType_Code"].toLowerCase() === "agent") {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = embasyAsAgentVsGovSectionOrder;
      } else {
        selected_Section = embasyAsAgentVsEstSectionOrder;
      }
    } else {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = embasyAsSelfVsGovSectionOrder;
      } else {
        selected_Section = embasyAsSelfVsEstSectionOrder;
      }
    }
  }
  if (userType?.toLowerCase() === "worker") {
    if (
      data["RepresentativeType_Code"] &&
      data["RepresentativeType_Code"].toLowerCase() === "legal representative"
    ) {
      selected_Section = LegelRepViewAsPalintiff;
    } else if (data["ApplicantType_Code"].toLowerCase() === "establishment") {
      selected_Section = EstablishmentViewAsPalintiff;
    } else if (data["PlaintiffType_Code"].toLowerCase() === "agent") {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = WorkerViewAsAgentVsGovernment;
      } else {
        selected_Section = WorkerViewAsAgentVsEstablishemtn;
      }
    } else {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = WorkerViewAsPalintiffVsGovernment;
      } else {
        selected_Section = WorkerViewAsPalintiffVsEstablishemtn;
      }
    }
  }

  const orderedSections = Object.entries(selected_Section).map(
    ([_key, section]) => {
      const filteredFields = section?.fields
        .map((fieldName) => {
          let value = data[fieldName];
          if (
            fieldName === "Defendant_StillWorking" ||
            fieldName === "Plaintiff_StillWorking"
          ) {
            const codeField =
              fieldName === "Defendant_StillWorking"
                ? "Defendant_StillWorking_Code"
                : "Plaintiff_StillWorking_Code";
            const codeValue = data[codeField];

            value =
              codeValue === "SW1"
                ? t("yes", { ns: "reviewdetails" })
                : t("not", { ns: "reviewdetails" });
          }

          if (value !== null && value !== undefined && value !== "") {
            return [fieldName, value];
          }
          return [fieldName, "-------"];
        })
        .filter(Boolean);

      return {
        title: section.title,
        fields: filteredFields,
      };
    },
  );

  return orderedSections;
};

const DataDetails: React.FC<DataDetailsProps> = ({ hearing }) => {
  const { t } = useTranslation("manageHearingDetails");
  const { t: tReview } = useTranslation("reviewdetails");
  const caseData = hearing || {};

  const [getCookie] = useCookieState();
  const userType = getCookie("userType");
  const newCaseDetailsView = filterAndOrderData(caseData, userType, tReview);

  const entries = Object.entries(caseData);
  const filterFields = (prefix: string) =>
    entries.filter(([key]) => key.toLowerCase().startsWith(prefix));

  const renderSection = (title: string, fields: [string, any][]) => {
    const filter_include_Data = fields.filter(
      (item) => !item[0].toLowerCase().includes("code") && item,
    );
    const filter_format_date = filter_include_Data.filter((item) => {
      if (
        item[0].toLowerCase().includes("date") &&
        !item[0].toLowerCase().includes("/")
      ) {
        item[1] = formatDate(item[1]);
      }
      return item;
    });

    return (
      <Section title={title} gridCols={6}>
        {filter_format_date.map(([key, value]) => {
          const isContractNumber = key.toLowerCase().includes("contractnumber");
          const formattedValue =
            value !== null && value !== undefined && value !== ""
              ? isContractNumber
                ? value
                : formatHijriWithSlashes(value)
              : "-------";

          return (
            <ReadOnlyField
              key={key}
              label={t(key) !== key ? t(key) : formatLabel(key)}
              value={formattedValue}
              notRequired
            />
          );
        })}
      </Section>
    );
  };

  const representativeType = caseData?.RepresentativeType_Code?.toLowerCase();
  const isGovernmentUser = representativeType === "legal representative";

  const plaintiffFields = filterFields("plaintiff");
  const defendantFields = filterFields("defendant");
  const workFields = entries?.filter(([key]) =>
    ["contract", "salary", "stillworking"].some((prefix) =>
      key.toLowerCase().includes(prefix),
    ),
  );
  const workLocationFields = entries?.filter(
    ([key]) =>
      key === "Plaintiff_JobLocation" ||
      key === "PlaintiffJobCity" ||
      key === "Defendant_JobLocation" ||
      key === "DefendantJobCity" ||
      key === "OfficeName",
  );
  const representativeFields = entries.filter(
    ([key]) =>
      key.toLowerCase().startsWith("rep") ||
      key.toLowerCase().startsWith("representative"),
  );

  const additionalRepFields = (
    [
      ["RepresentativeName", caseData.RepresentativeName],
      ["RepresentativeID", caseData.RepresentativeID],
      ["Rep_PhoneNumber", caseData.Rep_PhoneNumber],
      ["Rep_EmailAddress", caseData.Rep_EmailAddress],
    ] as [string, any][]
  ).filter(([_, val]) => val !== undefined);

  const mergedRepMap = new Map<string, any>([
    ...representativeFields,
    ...additionalRepFields,
  ]);
  const mergedRepFields: [string, any][] = Array.from(mergedRepMap.entries());

  return (
    <div className="space-y-6">
      {userType?.toLowerCase() === "legal representative" ||
      userType?.toLowerCase() === "establishment" ||
      userType?.toLowerCase() === "embassy user" ||
      userType?.toLowerCase() === "worker" ? (
        newCaseDetailsView &&
        newCaseDetailsView?.map((item) =>
          item?.fields
            ? renderSection(t(`${item?.title}`), item?.fields as any[])
            : null,
        )
      ) : (
        <>
          {renderSection(
            t("plaintiff_details") || "Plaintiff's Details",
            plaintiffFields,
          )}
          {isGovernmentUser &&
            mergedRepFields.length > 0 &&
            renderSection(
              t("representative_details") || "Legal Representative's Details",
              mergedRepFields,
            )}
          {renderSection(
            t("defendant_details") || "Defendant Details",
            defendantFields,
          )}
          {renderSection(t("work_details") || "Work Details", workFields)}
          {renderSection(
            t("work_location_details") || "Work Location Details",
            workLocationFields,
          )}
        </>
      )}
    </div>
  );
};

export default DataDetails;
