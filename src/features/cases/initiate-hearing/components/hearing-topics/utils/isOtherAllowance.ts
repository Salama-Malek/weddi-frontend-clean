// import { Option } from "@shared/components/form/form.types";

// export const isOtherAllowance = (opt?: Option | null) =>
//   !!opt &&
//   (["FA11", "OTHER", "3"].includes(String(opt.value)) ||
//     (opt.label ?? "").toLowerCase().includes("other")); 
import { Option } from "@shared/components/form/form.types";

export const isOtherAllowance = (opt?: Option | null) =>
  !!opt &&
  (String(opt.value) === "FA11" ||
    (opt.label ?? "").toLowerCase().includes("other")); 