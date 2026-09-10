import type { Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import type { RootState } from "./store";
import type { DailyReview } from "./types";
import {
  upsertCategory,
  deleteCategoryRow,
  upsertTask,
  deleteTaskRow,
  upsertGoal,
  deleteGoalRow,
  setWeeklyGoalRow,
  upsertReview,
  type SyncResult,
} from "@/lib/dataSync";
import { setTaskLocal, deleteTask } from "@/features/tasks/tasksSlice";
import { setCategoryLocal, deleteCategory } from "@/features/categories/categoriesSlice";
import { setGoalLocal, deleteMonthlyGoal, setWeeklyGoal } from "@/features/planning/planningSlice";
import { removeReviewLocal } from "@/features/analytics/analyticsSlice";

/** The shape this middleware cares about — every slice's actions fit this
 * loosely, since the payload varies per action type by design. */
interface SyncAction {
  type: string;
  payload?: unknown;
  meta?: { fromRealtime?: boolean };
}

const idOf = (action: SyncAction): string | undefined => {
  switch (action.type) {
    // payload IS the id for these
    case "tasks/toggleTask":
    case "tasks/toggleFocus":
    case "tasks/deleteTask":
    case "categories/deleteCategory":
    case "planning/deleteMonthlyGoal":
      return action.payload as string | undefined;
    default: {
      const p = action.payload as { id?: string; taskId?: string } | undefined;
      return p?.id ?? p?.taskId;
    }
  }
};

function reportFailure(result: SyncResult, revert: () => void) {
  if (!result.error) return;
  console.error("Supabase sync error:", result.error);
  revert();
  toast.error(i18n.t("common.syncFailed"));
}

// Mirrors mutations to Supabase and rolls the optimistic Redux update back
// (with a toast) if the write fails, so local state never silently drifts
// from the database.
export const syncMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const a = action as SyncAction;

  if (
    typeof a.type !== "string" ||
    a.type.startsWith("ui/") ||
    a.type.includes("hydrate") ||
    a.type.endsWith("Local") ||
    a.meta?.fromRealtime
  ) {
    return next(action);
  }

  const prevState = store.getState() as RootState;
  const id = idOf(a);
  const prevTask = id ? prevState.tasks.items.find((t) => t.id === id) : undefined;
  const prevCategory = id ? prevState.categories.items.find((c) => c.id === id) : undefined;
  const prevGoal = id ? prevState.planning.monthlyGoals.find((g) => g.id === id) : undefined;
  const prevWeeklyGoal = prevState.planning.weeklyGoal;
  const prevReviewDate =
    a.type === "analytics/saveReview"
      ? (a.payload as { date?: string } | undefined)?.date
      : undefined;
  const prevReview = prevReviewDate
    ? prevState.analytics.reviews.find((r) => r.date === prevReviewDate)
    : undefined;

  const result = next(action);
  const state = store.getState() as RootState;

  switch (a.type) {
    // categories
    case "categories/addCategory":
    case "categories/updateCategory": {
      const payloadId = (a.payload as { id: string }).id;
      const c = state.categories.items.find((x) => x.id === payloadId);
      if (c) {
        upsertCategory(c).then((r) =>
          reportFailure(r, () =>
            prevCategory
              ? store.dispatch(setCategoryLocal(prevCategory))
              : store.dispatch(deleteCategory(c.id)),
          ),
        );
      }
      break;
    }
    case "categories/deleteCategory": {
      const deletedId = a.payload as string;
      deleteCategoryRow(deletedId).then((r) =>
        reportFailure(r, () => {
          if (prevCategory) store.dispatch(setCategoryLocal(prevCategory));
        }),
      );
      break;
    }

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
      const t = state.tasks.items.find((x) => x.id === id);
      if (t) {
        upsertTask(t).then((r) =>
          reportFailure(r, () =>
            prevTask ? store.dispatch(setTaskLocal(prevTask)) : store.dispatch(deleteTask(t.id)),
          ),
        );
      }
      break;
    }
    case "tasks/deleteTask": {
      const deletedId = a.payload as string;
      deleteTaskRow(deletedId).then((r) =>
        reportFailure(r, () => {
          if (prevTask) store.dispatch(setTaskLocal(prevTask));
        }),
      );
      break;
    }

    // monthly goals
    case "planning/addMonthlyGoal":
    case "planning/updateMonthlyGoal": {
      const payloadId = (a.payload as { id: string }).id;
      const g = state.planning.monthlyGoals.find((x) => x.id === payloadId);
      if (g) {
        upsertGoal(g).then((r) =>
          reportFailure(r, () =>
            prevGoal
              ? store.dispatch(setGoalLocal(prevGoal))
              : store.dispatch(deleteMonthlyGoal(g.id)),
          ),
        );
      }
      break;
    }
    case "planning/deleteMonthlyGoal": {
      const deletedId = a.payload as string;
      deleteGoalRow(deletedId).then((r) =>
        reportFailure(r, () => {
          if (prevGoal) store.dispatch(setGoalLocal(prevGoal));
        }),
      );
      break;
    }
    case "planning/setWeeklyGoal":
      setWeeklyGoalRow(state.planning.weeklyGoal).then((r) =>
        reportFailure(r, () => store.dispatch(setWeeklyGoal(prevWeeklyGoal))),
      );
      break;

    // analytics
    case "analytics/saveReview": {
      const review = a.payload as DailyReview;
      upsertReview(review).then((r) =>
        reportFailure(r, () => {
          if (prevReview) store.dispatch({ type: "analytics/saveReview", payload: prevReview });
          else store.dispatch(removeReviewLocal(review.date));
        }),
      );
      break;
    }
  }

  return result;
};
