import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Target, TrendingUp, Plus, X, ListChecks, Flame, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setPlannedDate, toggleTask, toggleFocus } from "@/redux/tasksSlice";
import {
  addMonthlyGoal,
  deleteMonthlyGoal,
  setWeeklyGoal,
  updateMonthlyGoal,
} from "@/redux/planningSlice";
import { ProgressRing, ProgressBar } from "@/components/Progress";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning — Clarity" },
      {
        name: "description",
        content: "Plan your day, week, and month with focus, intention, and clarity.",
      },
      { property: "og:title", content: "Planning — Clarity" },
      { property: "og:description", content: "Plan your day, week, and month with intention." },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const [tab, setTab] = useState<"day" | "week" | "month">("day");
  const { t } = useTranslation();
  return (
    <div className="space-y-8 max-w-[1500px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t("plan.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{t("plan.subtitle")}</p>
        </div>
        <div className="inline-flex p-1 rounded-2xl bg-muted/60 border border-border">
          {(["day", "week", "month"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`relative px-4 py-2 text-sm font-medium rounded-xl capitalize transition ${tab === tabKey ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === tabKey && (
                <motion.span
                  layoutId="planTab"
                  className="absolute inset-0 rounded-xl bg-card shadow-soft"
                />
              )}
              <span className="relative">{t(`plan.${tabKey}`)}</span>
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {tab === "day" && <DailyPlan />}
          {tab === "week" && <WeeklyPlan />}
          {tab === "month" && <MonthlyPlan />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DailyPlan() {
  const today = new Date().toISOString().slice(0, 10);
  const all = useAppSelector((s) => s.tasks.items);
  const categories = useAppSelector((s) => s.categories.items);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const todays = all.filter((t) => t.plannedDate === today);
  const focus = todays.filter((t) => t.focus);
  const completed = todays.filter((t) => t.completed).length;
  const progress = todays.length ? Math.round((completed / todays.length) * 100) : 0;
  const totalEst = todays.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
  const productivityScore = Math.min(100, Math.round(progress * 0.8 + (focus.length ? 20 : 0)));

  const unscheduled = all.filter((t) => !t.plannedDate && !t.completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={ListChecks} label={t("plan.todaysTasks")} value={todays.length} />
          <Metric icon={Flame} label={t("plan.focus")} value={focus.length} accent="warning" />
          <Metric icon={Clock} label={t("plan.estMinutes")} value={totalEst} accent="info" />
          <Metric
            icon={TrendingUp}
            label={t("plan.score")}
            value={productivityScore}
            accent="success"
            suffix="%"
          />
        </div>

        <div className="rounded-3xl glass shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("plan.todaysPlan")}</h3>
            <div className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</div>
          </div>
          <div className="space-y-2">
            {todays.length === 0 && <Empty msg={t("plan.noTasksPlanned")} />}
            {todays.map((task) => {
              const cat = categories.find((c) => c.id === task.categoryId);
              return (
                <motion.div
                  layout
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border ${task.completed ? "opacity-60" : ""}`}
                >
                  <button
                    onClick={() => dispatch(toggleTask(task.id))}
                    className={`h-5 w-5 rounded-md border-2 grid place-items-center ${task.completed ? "bg-success border-success text-success-foreground" : "border-border"}`}
                  >
                    {task.completed && <span className="text-[10px]">✓</span>}
                  </button>
                  <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                  <span className={`flex-1 text-sm ${task.completed ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => dispatch(toggleFocus(task.id))}
                    className={`text-xs px-2 py-0.5 rounded-md ${task.focus ? "bg-warning/20 text-warning-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {task.focus ? t("plan.focusBadge") : t("plan.setFocus")}
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    {task.estimatedMinutes}m
                  </span>
                  <button
                    onClick={() => dispatch(setPlannedDate({ id: task.id, date: undefined }))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl glass shadow-soft p-5 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            {t("plan.todaysProgress")}
          </div>
          <ProgressRing value={progress} size={140} stroke={12} />
          <div className="mt-3 text-sm text-muted-foreground">
            {completed} {t("plan.ofDone", { total: todays.length })}
          </div>
        </div>

        <div className="rounded-3xl glass shadow-soft p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t("plan.addToToday")}
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {unscheduled.length === 0 && <Empty msg={t("plan.inboxEmpty")} />}
            {unscheduled.map((task) => {
              const cat = categories.find((c) => c.id === task.categoryId);
              return (
                <button
                  key={task.id}
                  onClick={() => dispatch(setPlannedDate({ id: task.id, date: today }))}
                  className="w-full text-start p-2.5 rounded-xl hover:bg-muted/60 flex items-center gap-2 group"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyPlan() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const tasks = useAppSelector((s) => s.tasks.items);
  const categories = useAppSelector((s) => s.categories.items);
  const planning = useAppSelector((s) => s.planning);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(planning.weeklyGoal);
  const { t } = useTranslation();

  const weekTasks = tasks.filter(
    (t) => t.plannedDate && days.some((d) => format(d, "yyyy-MM-dd") === t.plannedDate),
  );
  const completed = weekTasks.filter((t) => t.completed).length;
  const weekProgress = weekTasks.length ? Math.round((completed / weekTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl glass shadow-soft p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t("plan.weeklyIntention")}
            </div>
            {!editing ? (
              <div className="font-medium text-base truncate">
                {planning.weeklyGoal || t("plan.setWeeklyGoal")}
              </div>
            ) : (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="w-full bg-transparent outline-none text-base font-medium"
              />
            )}
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-primary hover:underline"
            >
              {t("common.edit")}
            </button>
          ) : (
            <button
              onClick={() => {
                dispatch(setWeeklyGoal(draft));
                setEditing(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground"
            >
              {t("common.save")}
            </button>
          )}
        </div>
        <div className="rounded-3xl glass shadow-soft p-5 flex items-center gap-4">
          <ProgressRing value={weekProgress} size={64} stroke={6} />
          <div>
            <div className="text-2xl font-semibold">
              {completed}/{weekTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">{t("plan.weekCompleted")}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const dayTasks = tasks.filter((t) => t.plannedDate === key);
          const isToday = key === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={key}
              className={`rounded-2xl p-3 min-h-[180px] glass shadow-soft ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {format(d, "EEE")}
                </div>
                <div className="text-lg font-semibold">{format(d, "d")}</div>
              </div>
              <div className="space-y-1.5">
                {dayTasks.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  return (
                    <div
                      key={t.id}
                      className={`text-xs p-2 rounded-lg bg-card border border-border ${t.completed ? "opacity-50 line-through" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: cat?.color }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    </div>
                  );
                })}
                {dayTasks.length === 0 && (
                  <div className="text-xs text-muted-foreground/70 text-center py-4">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyPlan() {
  const month = new Date().toISOString().slice(0, 7);
  const goals = useAppSelector((s) => s.planning.monthlyGoals).filter((g) => g.month === month);
  const categories = useAppSelector((s) => s.categories.items);
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const { t } = useTranslation();

  const overall = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl glass shadow-soft p-6 flex flex-col md:flex-row gap-6 items-center">
        <ProgressRing value={overall} size={120} stroke={10} />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {format(new Date(), "MMMM yyyy")}
          </div>
          <h3 className="text-2xl font-semibold mt-1">{t("plan.monthlyObjectives")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("plan.monthlyDesc")}</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          dispatch(addMonthlyGoal({ month, title: title.trim(), categoryId, progress: 0 }));
          setTitle("");
          setCategoryId(undefined);
        }}
        className="rounded-3xl glass shadow-soft p-4 flex flex-col sm:flex-row gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("plan.addMonthlyGoal")}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 outline-none focus:bg-background focus:ring-2 ring-ring text-sm"
        />
        <select
          value={categoryId || ""}
          onChange={(e) => setCategoryId(e.target.value || undefined)}
          className="px-4 py-2.5 rounded-xl bg-muted/50 text-sm outline-none"
        >
          <option value="">{t("plan.noCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> {t("common.add")}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const cat = categories.find((c) => c.id === g.categoryId);
          return (
            <motion.div layout key={g.id} className="rounded-2xl glass shadow-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{g.title}</div>
                  {cat && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />{" "}
                      {cat.name}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dispatch(deleteMonthlyGoal(g.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{t("plan.progress")}</span>
                  <span>{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} color={cat?.color || "var(--primary)"} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={g.progress}
                  onChange={(e) =>
                    dispatch(
                      updateMonthlyGoal({
                        ...g,
                        progress: Number(e.target.value),
                        done: Number(e.target.value) >= 100,
                      }),
                    )
                  }
                  className="w-full mt-2 accent-primary"
                />
              </div>
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="md:col-span-2">
            <Empty msg={t("plan.noGoals")} />
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent = "primary", suffix = "" }: any) {
  const colorMap: Record<string, string> = {
    primary: "var(--primary)",
    warning: "var(--warning)",
    info: "var(--info)",
    success: "var(--success)",
  };
  const color = colorMap[accent];
  return (
    <div className="rounded-2xl glass shadow-soft p-4 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl grid place-items-center"
        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xl font-semibold leading-none">
          {value}
          {suffix}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-sm text-muted-foreground">{msg}</div>;
}
