import { createSlice } from "@reduxjs/toolkit";

const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    isLoading: false,
    pendingCount: 0,
  } as { isLoading: boolean; pendingCount: number },
  reducers: {
    startLoading: (state) => {
      state.pendingCount += 1;
      state.isLoading = true;
    },
    stopLoading: (state) => {
      state.pendingCount = Math.max(0, state.pendingCount - 1);
      state.isLoading = state.pendingCount > 0;
    },
  },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
