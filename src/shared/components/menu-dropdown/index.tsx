import { MyDropdownContext, MyDropdownItemsProps } from "@/providers";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export const MyDropdownItems: React.FC<
  MyDropdownItemsProps & { onChange?: (item: any) => void }
> = ({
  items,

  onSelect,
  onChange,

  customItems,
  header,
}) => {
  const { isOpen, toggle } = useContext(MyDropdownContext);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!isOpen) return null;

  return (
    <div className="relative">
      <ul
        className={`absolute ${isRTL ? "left-0" : "right-0"} z-50 mt-2
         w-56 origin-top-right bg-white ring-1 shadow-md ring-black/5 transition b-radius
          p-2 ${items?.length > 5 ? "max-h-[300px] overflow-y-auto" : ""}`}
      >
        {header && (
          <>
            <div className=" px-4 py-2 text-sm bg-primary-600 text-white hover:bg-green-800 cursor-pointer">
              {header}
            </div>
            <hr />
          </>
        )}
        {items.map((item, idx) => (
          <li
            key={idx}
            className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-300"
            onClick={() => {
              item.onClick?.();

              onSelect?.(item);

              onChange?.(item);

              toggle();
            }}
          >
            {item.label}
          </li>
        ))}

        {customItems &&
          customItems?.map((item, idx) => (
            <li
              key={idx + "extraitem"}
              className="block px-4 py-2 text-center text-sm text-blue-700 cursor-pointer hover:bg-gray-300"
              onClick={() => {
                item.onClick?.();

                onSelect?.(item);

                onChange?.(item);

                toggle();
              }}
            >
              {item.label}
            </li>
          ))}

        {/* {languageChange && (
          <li
            className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-300 lg:hidden sm:block md:hidden"
            onClick={() => {
              languageChange();
              toggle();
            }}
          >
            {t("language")}
          </li>
        )} */}
      </ul>
    </div>
  );
};
