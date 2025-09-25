import { useState, useEffect } from "react";

type Breakpoint =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl";

interface ResponsiveConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
  "5xl": number;
  "6xl": number;
  "7xl": number;
  "8xl": number;
}

const breakpoints: ResponsiveConfig = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1920,
  "4xl": 2560,
  "5xl": 3200,
  "6xl": 3840,
  "7xl": 5120,
  "8xl": 7680,
};

export const useResponsive = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("xs");
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width >= breakpoints["8xl"]) {
        setCurrentBreakpoint("8xl");
      } else if (width >= breakpoints["7xl"]) {
        setCurrentBreakpoint("7xl");
      } else if (width >= breakpoints["6xl"]) {
        setCurrentBreakpoint("6xl");
      } else if (width >= breakpoints["5xl"]) {
        setCurrentBreakpoint("5xl");
      } else if (width >= breakpoints["4xl"]) {
        setCurrentBreakpoint("4xl");
      } else if (width >= breakpoints["3xl"]) {
        setCurrentBreakpoint("3xl");
      } else if (width >= breakpoints["2xl"]) {
        setCurrentBreakpoint("2xl");
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint("xl");
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint("lg");
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint("md");
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint("sm");
      } else {
        setCurrentBreakpoint("xs");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, []);

  const isMobile = currentBreakpoint === "xs" || currentBreakpoint === "sm";
  const isTablet = currentBreakpoint === "md";
  const isDesktop = currentBreakpoint === "lg" || currentBreakpoint === "xl";
  const isLargeDesktop =
    currentBreakpoint === "2xl" || currentBreakpoint === "3xl";
  const isUltraWide =
    currentBreakpoint === "4xl" ||
    currentBreakpoint === "5xl" ||
    currentBreakpoint === "6xl" ||
    currentBreakpoint === "7xl" ||
    currentBreakpoint === "8xl";

  const isAbove = (breakpoint: Breakpoint) => {
    return windowWidth >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    return windowWidth < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint) => {
    return windowWidth >= breakpoints[min] && windowWidth < breakpoints[max];
  };

  return {
    currentBreakpoint,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isUltraWide,
    isAbove,
    isBelow,
    isBetween,
    breakpoints,
  };
};
