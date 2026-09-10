import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export const selectTasks = (s: RootState) => s.tasks.items;
export const selectCategories = (s: RootState) => s.categories.items;
export const selectSearch = (s: RootState) => s.ui.search;

export const selectFilteredTasks = createSelector([selectTasks, selectSearch], (tasks, search) => {
  const q = search.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q),
  );
});

export const selectTasksByCategory = (categoryId: string) =>
  createSelector([selectFilteredTasks], (tasks) =>
    tasks.filter((t) => t.categoryId === categoryId).sort((a, b) => a.order - b.order),
  );

export const taskProgress = (task: { completed: boolean; subtasks: { done: boolean }[] }) => {
  if (!task.subtasks.length) return task.completed ? 100 : 0;
  const done = task.subtasks.filter((s) => s.done).length;
  return Math.round((done / task.subtasks.length) * 100);
};

export const categoryStats = (
  tasks: { categoryId: string; completed: boolean; estimatedMinutes: number }[],
  categoryId: string,
) => {
  const items = tasks.filter((t) => t.categoryId === categoryId);
  const completed = items.filter((t) => t.completed).length;
  const total = items.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const minutes = items.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  return { total, completed, remaining: total - completed, progress, minutes };
};
