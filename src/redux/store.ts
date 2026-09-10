import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import tasks from "./tasksSlice";
import categories from "./categoriesSlice";
import planning from "./planningSlice";
import analytics from "./analyticsSlice";
import ui from "./uiSlice";
import { syncMiddleware } from "./syncMiddleware";

export const store = configureStore({
  reducer: { tasks, categories, planning, analytics, ui },
  middleware: (getDefault) => getDefault().concat(syncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
