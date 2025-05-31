import AddHearing from "@/features/initiate-hearing/components/hearing-topics/AddHearing";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const UpdateTopicComponent = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { t, i18n } = useTranslation("manageHearingDetails");

  return (
    <div className="space-y-8 p-5">
      <AddHearing displayFooter={false} />
    </div>
  );
};

export default UpdateTopicComponent;
