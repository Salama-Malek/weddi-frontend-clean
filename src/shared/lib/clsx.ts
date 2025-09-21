import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param classes 
 * @returns 
 */
export function classes(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}

/**
 * A utility function that combines clsx and tailwind-merge for conditional class names
 * @param classes 
 * @returns 
 */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}
