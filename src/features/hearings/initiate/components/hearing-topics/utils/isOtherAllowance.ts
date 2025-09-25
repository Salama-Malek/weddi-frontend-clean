import { Option } from "@/shared/components/form/form.types";

export const isOtherAllowance = (opt?: Option | null) =>
  !!opt &&
  (String(opt.value) === "FA11" ||
    (opt.label ?? "").toLowerCase().includes("other"));
