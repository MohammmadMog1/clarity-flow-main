import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import type { MonthlyGoal } from "@/redux/types";

interface State {
  monthlyGoals: MonthlyGoal[];
  weeklyGoal: string;
}
const initialState: State = {
  monthlyGoals: [],
  weeklyGoal: "",
};

const slice = createSlice({
  name: "planning",
  initialState,
  reducers: {
    addMonthlyGoal: {
      reducer(state, a: PayloadAction<MonthlyGoal>) {
        state.monthlyGoals.push(a.payload);
      },
      prepare(input: Omit<MonthlyGoal, "id" | "done" | "progress"> & { progress?: number }) {
        return {
          payload: {
            ...input,
            id: nanoid(),
            done: false,
            progress: input.progress ?? 0,
          } as MonthlyGoal,
        };
      },
    },
    updateMonthlyGoal(state, a: PayloadAction<MonthlyGoal>) {
      const i = state.monthlyGoals.findIndex((g) => g.id === a.payload.id);
      if (i >= 0) state.monthlyGoals[i] = a.payload;
    },
    deleteMonthlyGoal(state, a: PayloadAction<string>) {
      state.monthlyGoals = state.monthlyGoals.filter((g) => g.id !== a.payload);
    },
    setWeeklyGoal(state, a: PayloadAction<string>) {
      state.weeklyGoal = a.payload;
    },
    hydratePlanning(_state, a: PayloadAction<Partial<State>>) {
      return { ..._state, ...a.payload };
    },
    setGoalLocal(state, a: PayloadAction<MonthlyGoal>) {
      const i = state.monthlyGoals.findIndex((g) => g.id === a.payload.id);
      if (i >= 0) state.monthlyGoals[i] = a.payload;
      else state.monthlyGoals.push(a.payload);
    },
  },
});

export const {
  addMonthlyGoal,
  updateMonthlyGoal,
  deleteMonthlyGoal,
  setWeeklyGoal,
  hydratePlanning,
  setGoalLocal,
} = slice.actions;
export default slice.reducer;
