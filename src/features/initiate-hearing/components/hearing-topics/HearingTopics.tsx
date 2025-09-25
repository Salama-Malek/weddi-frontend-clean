import { FormResetProvider } from "@/providers/FormResetProvider";
import { useFormContext } from "react-hook-form";

interface HearingTopicsProps {
  t: (key: string) => string;
  isEditing?: boolean;
  editTopic?: any;
}

export const HearingTopics = ({}: HearingTopicsProps) => {
  const { setValue, clearErrors } = useFormContext();

  return (
    <FormResetProvider setValue={setValue} clearErrors={clearErrors}>
      <div className="flex flex-col gap-4">{}</div>
    </FormResetProvider>
  );
};
