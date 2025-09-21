import AddHearing from "@/features/initiate-hearing/components/hearing-topics/AddHearing";
import { useSearchParams } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useEffect } from "react";

const UpdateTopicComponent = () => {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [, setCookie] = useCookieState();

  useEffect(() => {
    if (caseId) {
      setCookie("caseId", caseId);
    }
  }, [caseId, setCookie]);

  return (
    <div className="space-y-8 p-5">
      <AddHearing displayFooter={false} />
    </div>
  );
};

export default UpdateTopicComponent;
