import { supabase } from "@/integrations/supabase/client";
import type { Task, Category, MonthlyGoal, DailyReview, Subtask } from "@/redux/types";
import type { Json, Tables } from "@/integrations/supabase/types";

// ============== Mappers (DB <-> Redux) ==============
const taskFromDb = (r: Tables<"tasks">): Task => ({
  id: r.id,
  categoryId: r.category_id,
  title: r.title,
  description: r.description ?? undefined,
  priority: r.priority as Task["priority"],
  difficulty: r.difficulty as Task["difficulty"],
  estimatedMinutes: r.estimated_minutes,
  dueDate: r.due_date ?? undefined,
  completed: r.completed,
  completedAt: r.completed_at ?? undefined,
  subtasks: (r.subtasks as unknown as Subtask[]) ?? [],
  notes: r.notes ?? undefined,
  plannedDate: r.planned_date ?? undefined,
  focus: r.focus ?? false,
  order: Number(r.order ?? 0),
  createdAt: r.created_at,
});

const taskToDb = (t: Task, userId: string) => ({
  id: t.id,
  user_id: userId,
  category_id: t.categoryId,
  title: t.title,
  description: t.description ?? null,
  priority: t.priority,
  difficulty: t.difficulty,
  estimated_minutes: t.estimatedMinutes,
  due_date: t.dueDate ?? null,
  completed: t.completed,
  completed_at: t.completedAt ?? null,
  subtasks: (t.subtasks ?? []) as unknown as Json,
  notes: t.notes ?? null,
  planned_date: t.plannedDate ?? null,
  focus: !!t.focus,
  order: t.order,
});

const goalFromDb = (r: Tables<"monthly_goals">): MonthlyGoal => ({
  id: r.id,
  month: r.month,
  title: r.title,
  categoryId: r.category_id ?? undefined,
  progress: r.progress,
  done: r.done,
});
const goalToDb = (g: MonthlyGoal, userId: string) => ({
  id: g.id,
  user_id: userId,
  month: g.month,
  title: g.title,
  category_id: g.categoryId ?? null,
  progress: g.progress,
  done: g.done,
});

const reviewToDb = (r: DailyReview, userId: string) => ({
  user_id: userId,
  date: r.date,
  rating: r.rating,
  productivity: r.productivity,
  notes: r.notes,
  completed_task_ids: r.completedTaskIds,
});

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error("Not signed in");
  return uid;
}

// ============== Fetch all (RLS already scopes every row to the caller) ==============
export async function fetchAll() {
  const [cats, tasks, goals, settings, reviews] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase.from("tasks").select("*").order("order", { ascending: true }),
    supabase.from("monthly_goals").select("*"),
    supabase.from("app_settings").select("*").maybeSingle(),
    supabase.from("daily_reviews").select("*"),
  ]);

  return {
    categories: (cats.data ?? []).map(
      (c): Category => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        createdAt: c.created_at,
      }),
    ),
    tasks: (tasks.data ?? []).map(taskFromDb),
    monthlyGoals: (goals.data ?? []).map(goalFromDb),
    weeklyGoal: settings.data?.weekly_goal ?? "",
    reviews: (reviews.data ?? []).map(
      (r): DailyReview => ({
        date: r.date,
        rating: r.rating,
        productivity: r.productivity,
        notes: r.notes,
        completedTaskIds: (r.completed_task_ids as unknown as string[]) ?? [],
      }),
    ),
  };
}

// ============== Writes ==============
// Every write reports back whether it succeeded so the caller (syncMiddleware)
// can roll the optimistic Redux update back and tell the user.
export interface SyncResult {
  error?: string;
}

const toResult = ({ error }: { error: { message: string } | null }): SyncResult =>
  error ? { error: error.message } : {};

export const upsertCategory = async (c: Category): Promise<SyncResult> => {
  try {
    const userId = await requireUserId();
    return toResult(
      await supabase
        .from("categories")
        .upsert({ id: c.id, user_id: userId, name: c.name, color: c.color, icon: c.icon }),
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};
export const deleteCategoryRow = async (id: string): Promise<SyncResult> =>
  toResult(await supabase.from("categories").delete().eq("id", id));

export const upsertTask = async (t: Task): Promise<SyncResult> => {
  try {
    const userId = await requireUserId();
    return toResult(await supabase.from("tasks").upsert(taskToDb(t, userId)));
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};
export const deleteTaskRow = async (id: string): Promise<SyncResult> =>
  toResult(await supabase.from("tasks").delete().eq("id", id));

export const upsertGoal = async (g: MonthlyGoal): Promise<SyncResult> => {
  try {
    const userId = await requireUserId();
    return toResult(await supabase.from("monthly_goals").upsert(goalToDb(g, userId)));
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};
export const deleteGoalRow = async (id: string): Promise<SyncResult> =>
  toResult(await supabase.from("monthly_goals").delete().eq("id", id));

export const setWeeklyGoalRow = async (weeklyGoal: string): Promise<SyncResult> => {
  try {
    const userId = await requireUserId();
    return toResult(
      await supabase
        .from("app_settings")
        .upsert({ user_id: userId, weekly_goal: weeklyGoal, updated_at: new Date().toISOString() }),
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};

export const upsertReview = async (r: DailyReview): Promise<SyncResult> => {
  try {
    const userId = await requireUserId();
    return toResult(await supabase.from("daily_reviews").upsert(reviewToDb(r, userId)));
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};
