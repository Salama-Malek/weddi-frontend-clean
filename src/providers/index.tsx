import React, { createContext, ReactNode, useRef } from "react";
import { MyDropdownItems } from "@/shared/components/menu-dropdown";
import { MyDropdownButton } from "@/shared/components/menu-dropdown/MyDropdownButton";
import useOutsideClick from "@/shared/hooks/useOutsideClick";
import useToggle from "@/shared/hooks/generalSate";
import { ApplyStyle } from "@/features/dashboard/components/home.styles";

export const MyDropdownContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
}>({
  isOpen: false,
  toggle: () => { },
});

interface MyDropdownProps {
  buttonLabel?: string;
  items: { label: string; value: string }[];
  applyStyle?: ApplyStyle;
  className?: string;
  selected?: { label: string; value: string };
  onClick?: () => void;
  onChange?: (option: { label: string; value: string }) => void;
  trigger?: ReactNode;
  isFetching?: boolean;
  languageChange?: () => void
}

const MyDropdown: React.FC<MyDropdownProps> = ({
  buttonLabel,
  items,
  applyStyle,
  className,
  selected,
  onChange,
  trigger,
  isFetching,
  languageChange
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isOpen, close, toggle } = useToggle();

  useOutsideClick(dropdownRef, close);

  <MyDropdownContext.Provider value={{ isOpen, toggle }}>
    <div ref={dropdownRef}>
      {trigger ? (
        <div onClick={toggle}>{trigger}</div>
      ) : (
        <MyDropdownButton className={className} applyStyle={applyStyle}>
          {buttonLabel}
        </MyDropdownButton>
      )}
      <MyDropdownItems items={items} />
    </div>
  </MyDropdownContext.Provider>;

  return (
    <MyDropdownContext.Provider value={{ isOpen, toggle }}>
      <div ref={dropdownRef}>
        {trigger ? (
          <div onClick={toggle}>{trigger}</div>
        ) : (
          <MyDropdownButton className={className} applyStyle={applyStyle}>
            {buttonLabel}
          </MyDropdownButton>
        )}
        <MyDropdownItems
          items={items}
          selected={selected}
          languageChange={languageChange}
          onSelect={(option) => {
            if (option && option.value) {
              onChange!(option);
            }
            close();
          }}
        />
      </div>
    </MyDropdownContext.Provider>
  );
};

export default MyDropdown;

export interface MyDropdownItemsProps {
  items: { label: string; value: string, onClick?: () => void }[];
  selected?: { label: string; value?: string };
  onSelect?: (item: { label: string; value: string }) => void;
  languageChange?: () => void
}
