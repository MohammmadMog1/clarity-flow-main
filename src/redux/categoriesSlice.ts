import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Category } from "./types";

interface State {
  items: Category[];
}
const initialState: State = { items: [] };

const slice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory(state, a: PayloadAction<Category>) {
      state.items.push(a.payload);
    },
    updateCategory(state, a: PayloadAction<Category>) {
      const i = state.items.findIndex((c) => c.id === a.payload.id);
      if (i >= 0) state.items[i] = a.payload;
    },
    deleteCategory(state, a: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== a.payload);
    },
    hydrateCategories(state, a: PayloadAction<Category[]>) {
      state.items = a.payload ?? [];
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, hydrateCategories } = slice.actions;
export default slice.reducer;
