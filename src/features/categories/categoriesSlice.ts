import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import type { Category } from "@/redux/types";

interface State {
  items: Category[];
}
const initialState: State = { items: [] };

const slice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory: {
      reducer(state, a: PayloadAction<Category>) {
        state.items.push(a.payload);
      },
      prepare(input: { name: string; color: string; icon: string }) {
        return {
          payload: { ...input, id: nanoid(), createdAt: new Date().toISOString() } as Category,
        };
      },
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
    setCategoryLocal(state, a: PayloadAction<Category>) {
      const i = state.items.findIndex((c) => c.id === a.payload.id);
      if (i >= 0) state.items[i] = a.payload;
      else state.items.push(a.payload);
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, hydrateCategories, setCategoryLocal } =
  slice.actions;
export default slice.reducer;
