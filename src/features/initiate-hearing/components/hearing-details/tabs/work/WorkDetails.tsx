import { DynamicForm } from "@/shared/components/form/DynamicForm";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { useEffect } from "react";

import { useAPIFormsData } from "@/providers/FormContext";
import { legRepVsWorkerUseFormLayout } from "../../establishment-tabs/legal-representative/work/legworker.forms.formLayout";
import { FormResetProvider } from "@/providers/FormResetProvider";
import useWorkDetailsPrefill from "@/features/initiate-hearing/hooks/useWorkDetailsPrefill";

export interface WorkDetailsProps {
  register?: any;
  errors?: any;
  setValue?: any;
  watch?: any;
  control?: any;
  trigger?: any;
  isVerifiedInput?: boolean;
}

const WorkDetails = ({
  register,
  errors,
  setValue,
  watch,
  control,
  trigger,
}: WorkDetailsProps) => {
  const { handleRemoveValidation } = useAPIFormsData();

  const { isFeatched: caseDetailsLoading, workData } = useWorkDetailsPrefill(
    {},
  );
  useEffect(() => {
    [
      "typeOfWage",
      "salary",
      "contractType",
      "contractNumber",
      "contractDateHijri",
      "contractDateGregorian",
      "contractExpiryDateHijri",
      "contractExpiryDateGregorian",
      "isStillEmployed",
      "dateofFirstworkingdayHijri",
      "dateOfFirstWorkingDayGregorian",
      "dateoflastworkingdayHijri",
      "dateOfLastWorkingDayGregorian",
      "jobLocation",
      "jobLocationCity",
      "laborOffice",
    ].forEach((e: any) => setValue(e, null));
  }, []);

  const getFormLayout = () => {
    return legRepVsWorkerUseFormLayout(
      setValue,
      control,
      watch,
      trigger,
      caseDetailsLoading,
      workData,
    );
  };

  return (
    <FormResetProvider setValue={setValue} clearErrors={handleRemoveValidation}>
      <div className="flex flex-col gap-4">
        <DynamicForm
          formLayout={getFormLayout()}
          register={register}
          errors={errors}
          setValue={setValue}
          control={control}
          watch={watch}
        />
      </div>
    </FormResetProvider>
  );
};

export default withStepNavigation(WorkDetails);
