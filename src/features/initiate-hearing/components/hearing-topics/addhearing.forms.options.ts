import { Option } from "@/shared/components/form/form.types";

export const useFormOptions = ({  }: any) => {
  return {    
    doesBylawsIncludeAddingAccommodationsOptions: [
      { value: "law_yes", label: "Yes" },
      { value: "law_no", label: "No" },
    ] as Option[],
  };
};