import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import tasks from "@/features/tasks/tasksSlice";
import categories from "@/features/categories/categoriesSlice";
import planning from "@/features/planning/planningSlice";
import analytics from "@/features/analytics/analyticsSlice";
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

// Reducers stay pure (no localStorage writes inside them) — persistence is a
// side effect, so it lives here instead, outside the store's own dispatch cycle.
if (typeof window !== "undefined") {
  let lastTheme = store.getState().ui.theme;
  let lastLanguage = store.getState().ui.language;
  store.subscribe(() => {
    const { theme, language } = store.getState().ui;
    if (theme !== lastTheme) {
      lastTheme = theme;
      localStorage.setItem("theme", theme);
    }
    if (language !== lastLanguage) {
      lastLanguage = language;
      localStorage.setItem("language", language);
    }
  });
}
