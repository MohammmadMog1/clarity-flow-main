import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import type { Task, Subtask } from "@/redux/types";
import { todayKey } from "@/lib/date";

const now = () => new Date().toISOString();

/** Single source of truth for how a task's completion follows its subtasks. */
function deriveCompletion(task: Task) {
  if (!task.subtasks.length) return;
  const allDone = task.subtasks.every((s) => s.done);
  if (allDone && !task.completed) {
    task.completed = true;
    task.completedAt = now();
  } else if (!allDone && task.completed) {
    task.completed = false;
    task.completedAt = undefined;
  }
}

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
      else t.subtasks.forEach((s) => (s.done = false));
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
      deriveCompletion(t);
    },
    deleteSubtask(state, a: PayloadAction<{ taskId: string; subId: string }>) {
      const t = state.items.find((t) => t.id === a.payload.taskId);
      if (t) {
        t.subtasks = t.subtasks.filter((s) => s.id !== a.payload.subId);
        deriveCompletion(t);
      }
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
    /** Used to roll a task back to a known-good snapshot after a failed write. */
    setTaskLocal(state, a: PayloadAction<Task>) {
      const i = state.items.findIndex((t) => t.id === a.payload.id);
      if (i >= 0) state.items[i] = a.payload;
      else state.items.push(a.payload);
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
  setTaskLocal,
} = slice.actions;
export default slice.reducer;

export { todayKey };
