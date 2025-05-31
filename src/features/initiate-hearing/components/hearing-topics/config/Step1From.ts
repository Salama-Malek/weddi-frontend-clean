import { FormElement } from "@/shared/components/form/form.types";

interface Option {
  value: string;
  label: string;
}

interface BR1FormProps {
  t: (key: string) => string;
  setValue: (field: string, value: unknown) => void;
  MainCategoryOptions: Option[];
  mainCategory:any;
  SubCategoryOptions: Option[];
  subCategory:any;
  handleAdd: () => void;
  isMainCategoryLoading?:boolean
  isSubCategoryLoading?:boolean;
}

export const getStep1FormFields = ({
  t,
  setValue,
  MainCategoryOptions,
  mainCategory,
  SubCategoryOptions,
  subCategory,
  handleAdd,
  isMainCategoryLoading,
  isSubCategoryLoading
}: BR1FormProps): FormElement[] => {
  return [
        {
          isLoading:isMainCategoryLoading,
          type: "autocomplete",
          name: "mainCategory",
          label: t("main_category"),
          options: MainCategoryOptions,
          value: mainCategory,
          onChange: (option: Option | null) => {
            setValue("mainCategory", option);
            setValue("subCategory", null);
          },
        },
        {
          isLoading:isSubCategoryLoading,
          type: "autocomplete",
          name: "subCategory",
          label: t("sub_category"),
          options: SubCategoryOptions,
          value: subCategory,
          onChange: (option: Option | null) => setValue("subCategory", option),
        },
        {
          disabled: !(mainCategory && subCategory),
          type: "button",
          label: t("add"),
          onClick: handleAdd,
          size: "sm",
          colSpan: 2,
        },
      ]
};