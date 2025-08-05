import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import useCaseSave, { ApiResponse } from "./useCaseSave";

const toastSuccess = vi.fn();
const toastError = vi.fn();
const clearErrors = vi.fn();

vi.mock("react-toastify", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@app/providers/FormContext", () => ({
  useAPIFormsData: () => ({ clearErrors }),
}));

function renderHook<T>(callback: () => T) {
  const result: { current: T } = { current: undefined as unknown as T };
  function TestComponent() {
    result.current = callback();
    return null;
  }
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => {
    root.render(<TestComponent />);
  });
  return result;
}

describe("useCaseSave", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("handles successful save", async () => {
    const apiResponse: ApiResponse = {
      ServiceStatus: "Success",
      SuccessCode: "200",
      ErrorCodeList: [],
    };
    const saveFn = vi.fn().mockResolvedValue(apiResponse);
    const { current } = renderHook(() => useCaseSave(saveFn));

    await act(async () => {
      await current.onSave();
    });

    expect(saveFn).toHaveBeenCalled();
    expect(clearErrors).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("save_success");
    expect(current.isSaveSuccess).toBe(true);
    expect(current.isSaveError).toBe(false);
  });

  it("handles save error", async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error("failed"));
    const { current } = renderHook(() => useCaseSave(saveFn));

    await act(async () => {
      await current.onSave();
    });

    expect(saveFn).toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
    expect(current.isSaveError).toBe(true);
  });
});

