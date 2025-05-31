import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { classes } from "@/shared/lib/clsx";

export interface BreadcrumbItemProps {
  href: string;
  children: React.ReactNode;
  isLast?: boolean; 
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ href, children, isLast }) => {
  return (
    <div className="flex items-center">
      <Link
        to={href}
        className={classes(
          "regular  text-sm md:text-lg ",
          isLast ? "text-primary-600" : "text-gray-400"
        )}
      >
        {children}
      </Link>
    </div>
  );
};

export default BreadcrumbItem;
