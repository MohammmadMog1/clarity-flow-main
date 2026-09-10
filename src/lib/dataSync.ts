import { supabase } from "@/integrations/supabase/client";
import type { Task, Category, MonthlyGoal, DailyReview, Subtask } from "@/redux/types";

// ============== Mappers (DB <-> Redux) ==============
const taskFromDb = (r: any): Task => ({
  id: r.id,
  categoryId: r.category_id,
  title: r.title,
  description: r.description ?? undefined,
  priority: r.priority,
  difficulty: r.difficulty,
  estimatedMinutes: r.estimated_minutes,
  dueDate: r.due_date ?? undefined,
  completed: r.completed,
  completedAt: r.completed_at ?? undefined,
  subtasks: (r.subtasks as Subtask[]) ?? [],
  notes: r.notes ?? undefined,
  plannedDate: r.planned_date ?? undefined,
  focus: r.focus ?? false,
  order: Number(r.order ?? 0),
  createdAt: r.created_at,
});

const taskToDb = (t: Task) => ({
  id: t.id,
  category_id: t.categoryId,
  title: t.title,
  description: t.description ?? null,
  priority: t.priority,
  difficulty: t.difficulty,
  estimated_minutes: t.estimatedMinutes,
  due_date: t.dueDate ?? null,
  completed: t.completed,
  completed_at: t.completedAt ?? null,
  subtasks: (t.subtasks ?? []) as any,
  notes: t.notes ?? null,
  planned_date: t.plannedDate ?? null,
  focus: !!t.focus,
  order: t.order,
});

const goalFromDb = (r: any): MonthlyGoal => ({
  id: r.id,
  month: r.month,
  title: r.title,
  categoryId: r.category_id ?? undefined,
  progress: r.progress,
  done: r.done,
});
const goalToDb = (g: MonthlyGoal) => ({
  id: g.id,
  month: g.month,
  title: g.title,
  category_id: g.categoryId ?? null,
  progress: g.progress,
  done: g.done,
});

const reviewToDb = (r: DailyReview) => ({
  date: r.date,
  rating: r.rating,
  productivity: r.productivity,
  notes: r.notes,
  completed_task_ids: r.completedTaskIds,
});

// ============== Fetch all ==============
export async function fetchAll() {
  const [cats, tasks, goals, settings, reviews] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase.from("tasks").select("*").order("order", { ascending: true }),
    supabase.from("monthly_goals").select("*"),
    supabase.from("app_settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("daily_reviews").select("*"),
  ]);

  return {
    categories: (cats.data ?? []).map(
      (c: any): Category => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        createdAt: c.created_at,
      }),
    ),
    tasks: (tasks.data ?? []).map(taskFromDb),
    monthlyGoals: (goals.data ?? []).map(goalFromDb),
    weeklyGoal: (settings.data?.weekly_goal as string) ?? "",
    reviews: (reviews.data ?? []).map((r: any) => ({
      date: r.date,
      rating: r.rating,
      productivity: r.productivity,
      notes: r.notes,
      completedTaskIds: (r.completed_task_ids as string[]) ?? [],
    })) as DailyReview[],
  };
}

// ============== Writes ==============
const handleDbResult = ({ error }: any) => {
  if (error) console.error("Supabase sync error:", error);
};

export const upsertCategory = (c: Category) =>
  supabase.from("categories").upsert({ id: c.id, name: c.name, color: c.color, icon: c.icon }).then(handleDbResult);
export const deleteCategoryRow = (id: string) => supabase.from("categories").delete().eq("id", id).then(handleDbResult);

export const upsertTask = (t: Task) => supabase.from("tasks").upsert(taskToDb(t)).then(handleDbResult);
export const deleteTaskRow = (id: string) => supabase.from("tasks").delete().eq("id", id).then(handleDbResult);

export const upsertGoal = (g: MonthlyGoal) => supabase.from("monthly_goals").upsert(goalToDb(g)).then(handleDbResult);
export const deleteGoalRow = (id: string) => supabase.from("monthly_goals").delete().eq("id", id).then(handleDbResult);

export const setWeeklyGoalRow = (weeklyGoal: string) =>
  supabase
    .from("app_settings")
    .upsert({ id: "default", weekly_goal: weeklyGoal, updated_at: new Date().toISOString() })
    .then(handleDbResult);

export const upsertReview = (r: DailyReview) =>
  supabase.from("daily_reviews").upsert(reviewToDb(r)).then(handleDbResult);
