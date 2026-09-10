import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DailyReview } from "@/redux/types";

interface State {
  reviews: DailyReview[];
}
const initialState: State = { reviews: [] };

const slice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    saveReview(state, a: PayloadAction<DailyReview>) {
      const i = state.reviews.findIndex((r) => r.date === a.payload.date);
      if (i >= 0) state.reviews[i] = a.payload;
      else state.reviews.push(a.payload);
    },
    hydrateAnalytics(state, a: PayloadAction<DailyReview[]>) {
      if (a.payload) state.reviews = a.payload;
    },
    removeReviewLocal(state, a: PayloadAction<string>) {
      state.reviews = state.reviews.filter((r) => r.date !== a.payload);
    },
  },
});

export const { saveReview, hydrateAnalytics, removeReviewLocal } = slice.actions;
export default slice.reducer;
