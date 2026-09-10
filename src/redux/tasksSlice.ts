import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import type { Task, Subtask } from "./types";

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

interface State {
  items: Task[];
}
const initialState: State = { items: [] };

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: {
      reducer(state, a: PayloadAction<Task>) {
        state.items.push(a.payload);
      },
      prepare(
        input: Omit<Task, "id" | "createdAt" | "completed" | "subtasks" | "order"> & {
          subtasks?: Subtask[];
        },
      ) {
        return {
          payload: {
            ...input,
            id: nanoid(),
            createdAt: now(),
            completed: false,
            subtasks: input.subtasks ?? [],
            order: Date.now(),
          } as Task,
        };
      },
    },
    updateTask(state, a: PayloadAction<Partial<Task> & { id: string }>) {
      const i = state.items.findIndex((t) => t.id === a.payload.id);
      if (i >= 0) state.items[i] = { ...state.items[i], ...a.payload };
    },
    deleteTask(state, a: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== a.payload);
    },
    toggleTask(state, a: PayloadAction<string>) {
      const t = state.items.find((t) => t.id === a.payload);
      if (!t) return;
      t.completed = !t.completed;
      t.completedAt = t.completed ? now() : undefined;
      if (t.completed) t.subtasks.forEach((s) => (s.done = true));
    },
    addSubtask(state, a: PayloadAction<{ taskId: string; title: string }>) {
      const t = state.items.find((t) => t.id === a.payload.taskId);
      if (t) t.subtasks.push({ id: nanoid(), title: a.payload.title, done: false });
    },
    toggleSubtask(state, a: PayloadAction<{ taskId: string; subId: string }>) {
      const t = state.items.find((t) => t.id === a.payload.taskId);
      if (!t) return;
      const s = t.subtasks.find((s) => s.id === a.payload.subId);
      if (!s) return;
      s.done = !s.done;
      if (t.subtasks.length && t.subtasks.every((s) => s.done)) {
        t.completed = true;
        t.completedAt = now();
      } else if (t.completed && t.subtasks.some((s) => !s.done)) {
        t.completed = false;
        t.completedAt = undefined;
      }
    },
    deleteSubtask(state, a: PayloadAction<{ taskId: string; subId: string }>) {
      const t = state.items.find((t) => t.id === a.payload.taskId);
      if (t) t.subtasks = t.subtasks.filter((s) => s.id !== a.payload.subId);
    },
    setPlannedDate(state, a: PayloadAction<{ id: string; date?: string }>) {
      const t = state.items.find((t) => t.id === a.payload.id);
      if (t) t.plannedDate = a.payload.date;
    },
    toggleFocus(state, a: PayloadAction<string>) {
      const t = state.items.find((t) => t.id === a.payload);
      if (t) t.focus = !t.focus;
    },
    reorder(state, a: PayloadAction<{ id: string; order: number }>) {
      const t = state.items.find((t) => t.id === a.payload.id);
      if (t) t.order = a.payload.order;
    },
    hydrateTasks(state, a: PayloadAction<Task[]>) {
      state.items = a.payload ?? [];
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  setPlannedDate,
  toggleFocus,
  reorder,
  hydrateTasks,
} = slice.actions;
export default slice.reducer;
