import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Lang = "en" | "ar";

interface State {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  search: string;
  quickAddOpen: boolean;
  quickAddCategoryId?: string;
  language: Lang;
}

// Load initial state from localStorage (client-side only — no-op during SSR)
const loadFromStorage = () => {
  if (typeof window === "undefined") {
    return { theme: "light" as const, language: "en" as const };
  }
  try {
    const theme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    const language = (localStorage.getItem("language") as Lang) || "en";
    return { theme, language };
  } catch {
    return { theme: "light" as const, language: "en" as const };
  }
};

const initialState: State = {
  theme: loadFromStorage().theme,
  sidebarOpen: true,
  search: "",
  quickAddOpen: false,
  language: loadFromStorage().language,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, a: PayloadAction<"light" | "dark">) {
      state.theme = a.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSearch(state, a: PayloadAction<string>) {
      state.search = a.payload;
    },
    setLanguage(state, a: PayloadAction<Lang>) {
      state.language = a.payload;
    },
    openQuickAdd(state, a: PayloadAction<string | undefined>) {
      state.quickAddOpen = true;
      state.quickAddCategoryId = a.payload;
    },
    closeQuickAdd(state) {
      state.quickAddOpen = false;
      state.quickAddCategoryId = undefined;
    },
    hydrateUi(_state, a: PayloadAction<Partial<State>>) {
      return { ..._state, ...a.payload };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSearch,
  setLanguage,
  openQuickAdd,
  closeQuickAdd,
  hydrateUi,
} = slice.actions;
export default slice.reducer;
