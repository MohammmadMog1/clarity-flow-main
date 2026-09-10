import type { Middleware } from "@reduxjs/toolkit";
import {
  upsertCategory,
  deleteCategoryRow,
  upsertTask,
  deleteTaskRow,
  upsertGoal,
  deleteGoalRow,
  setWeeklyGoalRow,
  upsertReview,
} from "@/lib/dataSync";

// Middleware that mirrors mutations to Supabase.
// Reads the next state to send the fully-merged row.
export const syncMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Skip hydration & UI actions
  if (
    typeof action.type !== "string" ||
    action.type.startsWith("ui/") ||
    action.type.includes("hydrate") ||
    (action as any).meta?.fromRealtime
  ) {
    return result;
  }

  const state = store.getState() as any;

  try {
    switch (action.type) {
      // categories
      case "categories/addCategory":
      case "categories/updateCategory": {
        const c = state.categories.items.find((x: any) => x.id === action.payload.id);
        if (c) upsertCategory(c);
        break;
      }
      case "categories/deleteCategory":
        deleteCategoryRow(action.payload);
        break;

      // tasks (always upsert the full task after the reducer runs)
      case "tasks/addTask":
      case "tasks/updateTask":
      case "tasks/toggleTask":
      case "tasks/addSubtask":
      case "tasks/toggleSubtask":
      case "tasks/deleteSubtask":
      case "tasks/setPlannedDate":
      case "tasks/toggleFocus":
      case "tasks/reorder": {
        const id =
          action.type === "tasks/addTask"
            ? action.payload.id
            : action.type === "tasks/toggleTask" || action.type === "tasks/toggleFocus"
              ? action.payload
              : (action.payload.id ?? action.payload.taskId);
        const t = state.tasks.items.find((x: any) => x.id === id);
        if (t) upsertTask(t);
        break;
      }
      case "tasks/deleteTask":
        deleteTaskRow(action.payload);
        break;

      // monthly goals
      case "planning/addMonthlyGoal":
      case "planning/updateMonthlyGoal": {
        const id = action.payload.id;
        const g = state.planning.monthlyGoals.find((x: any) => x.id === id);
        if (g) upsertGoal(g);
        break;
      }
      case "planning/deleteMonthlyGoal":
        deleteGoalRow(action.payload);
        break;
      case "planning/setWeeklyGoal":
        setWeeklyGoalRow(state.planning.weeklyGoal);
        break;

      // analytics
      case "analytics/saveReview":
        upsertReview(action.payload);
        break;
    }
  } catch (e) {
    console.error("[sync] failed:", e);
  }

  return result;
};
