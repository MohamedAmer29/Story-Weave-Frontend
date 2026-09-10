import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, type TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import uiReducer from "./uiSlice";
import readerReducer from "./readerSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    reader: readerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;