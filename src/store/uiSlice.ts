import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  mobileNavOpen: boolean;
  sidebarCollapsed: boolean;
}

const SIDEBAR_COLLAPSED_KEY = "storyforge.sidebarCollapsed";

const initialState: UiState = {
  mobileNavOpen: false,
  sidebarCollapsed:
    typeof window !== "undefined" &&
    window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1",
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
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const SIDEBAR_COLLAPSED_STORAGE_KEY = SIDEBAR_COLLAPSED_KEY;
export const {
  openMobileNav,
  closeMobileNav,
  toggleMobileNav,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
} = uiSlice.actions;
export default uiSlice.reducer;