import React, { useCallback, memo } from "react";
import Button from "@/shared/components/button";

interface Card {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  isHearing?: string;
  isHearingManage?: string;
}

interface CardSectionProps {
  cardData: Card[];
  handleRedirect: (isHearing?: string, isHearingManage?: string) => void;
}

const HearingCards = memo(({ cardData, handleRedirect }: CardSectionProps) => {
  const handleButtonClick = useCallback(
    (isHearing?: string, isHearingManage?: string) => {
      return () => handleRedirect(isHearing, isHearingManage);
    },
    [handleRedirect]
  );

  return (
    <section className="flex flex-wrap">
      {cardData.map((card) => (
        <CardItem key={card.id} card={card} onButtonClick={handleButtonClick} />
      ))}
    </section>
  );
});

const CardItem = memo(
  ({
    card,
    onButtonClick,
  }: {
    card: Card;
    onButtonClick: (isHearing?: string, isHearingManage?: string) => () => void;
  }) => {
    return (
      <div className="w-full sm:w-1/2 lg:w-1/2 p-1 md:p-2">
        <div className="overflow-hidden h-[200px] sm:h-[250px] md:h-[276px] p-3 md:p-4xl bg-light-alpha-white rounded-md flex flex-col items-center justify-between relative shadow-md">
          <div className="absolute top-[20px] sm:top-[24px] md:top-[28px] left-[12px] sm:left-[14px] md:left-[16px] bg-primary-50 p-2 md:p-3 rounded-md">
            {card.icon}
          </div>

          <div className="text-start mt-6 sm:mt-7 md:mt-8 flex justify-start items-center h-full w-full">
            <div className="flex flex-col space-y-[10px] sm:space-y-[12px] md:space-y-[14px]">
              <h3 className="text-sm sm:text-base md:text-lg bold">
                {card.title}
              </h3>
              <p className="!text-xs sm:!text-sm md:!text-md regular text-gray-800 flex">
                {card.description}
              </p>
            </div>
          </div>

          <div className="w-full flex justify-end items-center pb-2">
            <Button
              value="primary"
              onClick={onButtonClick(card?.isHearing, card?.isHearingManage)}
              className="!text-xs sm:!text-sm md:!text-base !px-2 sm:!px-3 md:!px-4"
            >
              {card.footerText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

export default HearingCards;
