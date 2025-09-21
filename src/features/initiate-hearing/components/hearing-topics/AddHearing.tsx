import HearingTopicsDetails from ".";
import EditHearingTopicsDetails from "./edit-index";

const AddHearing = ({ displayFooter }: { displayFooter: boolean }) => {
  return (
    <>
      {displayFooter && (
        <div>
          <HearingTopicsDetails showFooter={displayFooter} />
        </div>
      )}
      {!displayFooter && (
        <div>
          {}
          <EditHearingTopicsDetails showFooter={displayFooter} />
        </div>
      )}
    </>
  );
};

export default AddHearing;
