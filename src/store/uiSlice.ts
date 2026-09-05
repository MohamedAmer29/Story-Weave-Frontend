import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  mobileNavOpen: boolean;
}

const initialState: UiState = {
  mobileNavOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openMobileNav(state) {
      state.mobileNavOpen = true;
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false;
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
  },
});

export const { openMobileNav, closeMobileNav, toggleMobileNav } = uiSlice.actions;
export default uiSlice.reducer;