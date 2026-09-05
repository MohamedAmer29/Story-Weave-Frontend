import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ReaderState {
  currentStoryId: string | null;
  lastPageByStory: Record<string, number>;
}

const initialState: ReaderState = {
  currentStoryId: null,
  lastPageByStory: {},
};

const readerSlice = createSlice({
  name: "reader",
  initialState,
  reducers: {
    openStory(state, action: PayloadAction<string>) {
      state.currentStoryId = action.payload;
    },
    setPage(state, action: PayloadAction<{ storyId: string; page: number }>) {
      state.currentStoryId = action.payload.storyId;
      state.lastPageByStory[action.payload.storyId] = action.payload.page;
    },
    clearReader(state) {
      state.currentStoryId = null;
    },
  },
});

export const { openStory, setPage, clearReader } = readerSlice.actions;
export default readerSlice.reducer;