import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, type TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import readerReducer from "./readerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    reader: readerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;