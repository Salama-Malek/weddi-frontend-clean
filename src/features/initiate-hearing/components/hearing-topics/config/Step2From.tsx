import { FormElement } from "@/shared/components/form/form.types";
import { TextAreaField } from "@/shared/components/form/TextArea";
import { ReactNode } from "react";

interface Step2FormProps {
  t: (key: string) => string;
  isEditing: boolean;
  mainCategory: any;
  subCategory?: any;
  subTopicsLoading: boolean | undefined;
  matchedSubCategory?: {
    LegalFormal?: string;
    ElementValue?: string;
  };
  acknowledged: boolean;
  showTopicData: boolean;
  handleAcknowledgeChange: any;
}

export const getStep2FormFields = ({
  t,
  isEditing,
  mainCategory,
  subTopicsLoading,
  matchedSubCategory,
  acknowledged,
  showTopicData,
  handleAcknowledgeChange,
}: Step2FormProps): FormElement | any => {
  return [
    !isEditing && {
      type: "custom",
      name: "divider",
      colSpan: 2,
      component: (<hr className="my-4 mb-[-16px]" />) as ReactNode,
    },
    !isEditing && {
      type: "custom",
      name: "categoryFieldsGroup",
      colSpan: 2,
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm !leading-5 normal">
              {t("main_category")}
            </label>
            <div className="w-full text-md rounded-sm py-0.5 medium">
              {mainCategory?.label || "-----"}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm !leading-5 normal">
              {t("sub_category")}
            </label>
            <div className="w-full text-md rounded-sm py-0.5 medium">
              {matchedSubCategory?.ElementValue || "-----"}
            </div>
          </div>
        </div>
      ) as ReactNode,
    },
    {
      type: "custom",
      name: "legalHeader",
      colSpan: 2,
      component: (
        <h2 className="font-primary font-medium text-[16px] leading-[35px] text-primary-600">
          {t("legal_acknowledgment")}
        </h2>
      ) as ReactNode,
    },
    {
      type: "custom",
      name: "regulatoryText",
      colSpan: 2,
      component: (
        <TextAreaField
          isLoading={subTopicsLoading}
          label={t("regulatory_text_label")}
          readOnly
          value={
            isEditing
              ? matchedSubCategory?.LegalFormal
              : matchedSubCategory?.LegalFormal
          }
          className="w-full h-32"
          notRequired={true}
        />
      ) as ReactNode,
    },

    {
      type: "checkbox",
      name: "acknowledged",
      label: t("acknowledgment_text"),
      checked: acknowledged,
      onChange: handleAcknowledgeChange,
      colSpan: 2,
      className: "mb-7",
      disabled: acknowledged && showTopicData,
    },
  ].filter(Boolean);
};
