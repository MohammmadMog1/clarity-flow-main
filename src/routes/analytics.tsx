import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, subDays, startOfWeek, isAfter } from "date-fns";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { saveReview } from "@/features/analytics/analyticsSlice";
import { ProgressRing } from "@/components/Progress";
import { todayKey } from "@/lib/date";
import type { DailyReview } from "@/redux/types";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Clarity" },
      {
        name: "description",
        content: "Insights on your productivity, completion rates, streaks, and daily reflections.",
      },
      { property: "og:title", content: "Analytics — Clarity" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { t } = useTranslation();
  const tasks = useAppSelector((s) => s.tasks.items);
  const categories = useAppSelector((s) => s.categories.items);
  const reviews = useAppSelector((s) => s.analytics.reviews);

  const today = todayKey();
  const completedToday = tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === today);

  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const key = format(d, "yyyy-MM-dd");
      const count = tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === key).length;
      return { date: format(d, "MMM d"), count };
    });
  }, [tasks]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekly = tasks.filter(
    (t) => t.completedAt && isAfter(new Date(t.completedAt), weekStart),
  ).length;
  const monthly = tasks.filter(
    (t) => t.completedAt?.slice(0, 7) === today.slice(0, 7) && t.completed,
  ).length;

  const categoryData = categories.map((c) => {
    const items = tasks.filter((t) => t.categoryId === c.id);
    const done = items.filter((t) => t.completed).length;
    return {
      name: c.name,
      value: done,
      total: items.length,
      color: c.color,
      rate: items.length ? Math.round((done / items.length) * 100) : 0,
    };
  });

  const difficultyBreakdown = (["easy", "medium", "hard"] as const).map((d) => ({
    name: t(`task.difficulty_${d}`),
    completed: tasks.filter((t) => t.difficulty === d && t.completed).length,
    pending: tasks.filter((t) => t.difficulty === d && !t.completed).length,
  }));

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const key = format(subDays(new Date(), i), "yyyy-MM-dd");
      const had = tasks.some((t) => t.completed && t.completedAt?.slice(0, 10) === key);
      if (had) count++;
      else break;
    }
    return count;
  }, [tasks]);

  // Most productive day
  const mostProductive = useMemo(() => {
    const map: Record<string, number> = {};
    tasks
      .filter((t) => t.completedAt)
      .forEach((t) => {
        const day = format(new Date(t.completedAt!), "EEEE");
        map[day] = (map[day] || 0) + 1;
      });
    const best = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : "—";
  }, [tasks]);

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {t("analytics.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{t("analytics.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BigStat
          label={t("analytics.doneToday")}
          value={completedToday.length}
          sub={t("analytics.tasksWord")}
        />
        <BigStat label={t("analytics.thisWeek")} value={weekly} sub={t("analytics.tasksWord")} />
        <BigStat label={t("analytics.thisMonth")} value={monthly} sub={t("analytics.tasksWord")} />
        <BigStat
          label={t("analytics.streak")}
          value={streak}
          sub={streak === 1 ? t("analytics.day") : t("analytics.days")}
          accent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card shadow-soft p-5">
          <h3 className="font-semibold mb-1">{t("analytics.last14")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("analytics.dailyFlow")}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-soft p-5">
          <h3 className="font-semibold mb-1">{t("analytics.byCategory")}</h3>
          <p className="text-xs text-muted-foreground mb-2">{t("analytics.completedShare")}</p>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {categoryData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="flex-1">{d.name}</span>
                <span className="text-muted-foreground">{d.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card shadow-soft p-5">
          <h3 className="font-semibold mb-1">{t("analytics.byDifficulty")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("analytics.easyHard")}</p>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={difficultyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" fill="var(--success)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="var(--muted-foreground)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-soft p-5 space-y-4">
          <div>
            <h3 className="font-semibold">{t("analytics.mostProductive")}</h3>
            <p className="text-2xl font-semibold text-gradient mt-2">{mostProductive}</p>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">
              {t("analytics.overallCompletion")}
            </div>
            <ProgressRing
              value={
                tasks.length
                  ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
                  : 0
              }
              size={92}
              stroke={8}
            />
          </div>
        </div>
      </div>

      <DailyReviewCard />
      <ReviewHistory reviews={reviews} />
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-5 shadow-soft ${accent ? "gradient-primary text-primary-foreground" : "border border-border bg-card"}`}
    >
      <div
        className={`text-xs uppercase tracking-wider ${accent ? "opacity-80" : "text-muted-foreground"}`}
      >
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="text-3xl font-semibold">{value}</div>
        <div className={`text-xs ${accent ? "opacity-80" : "text-muted-foreground"}`}>{sub}</div>
      </div>
    </motion.div>
  );
}

function DailyReviewCard() {
  const { t } = useTranslation();
  const today = todayKey();
  const tasks = useAppSelector((s) => s.tasks.items);
  const existing = useAppSelector((s) => s.analytics.reviews.find((r) => r.date === today));
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(existing?.rating || 0);
  const [productivity, setProductivity] = useState(existing?.productivity || 0);
  const [notes, setNotes] = useState(existing?.notes || "");

  const completed = tasks.filter((t) => t.completed && t.completedAt?.slice(0, 10) === today);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-semibold text-lg">{t("analytics.dailyReview")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("analytics.closeOut")}</p>
        </div>
        <div className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("analytics.howWasToday")}
            </label>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("analytics.productivity")}
            </label>
            <Stars value={productivity} onChange={setProductivity} color="var(--success)" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("analytics.reflection")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t("analytics.reflectionPh")}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-muted/50 outline-none focus:bg-background focus:ring-2 ring-ring text-sm resize-none"
            />
          </div>
          <button
            onClick={() =>
              dispatch(
                saveReview({
                  date: today,
                  rating,
                  productivity,
                  notes,
                  completedTaskIds: completed.map((c) => c.id),
                }),
              )
            }
            disabled={!rating}
            className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {t("analytics.saveReflection")}
          </button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("analytics.completedToday")} ({completed.length})
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {completed.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">
                {t("analytics.noCompletedToday")}
              </div>
            )}
            {completed.map((t) => (
              <div
                key={t.id}
                className="text-sm p-2.5 rounded-lg bg-muted/40 border border-border line-through opacity-70"
              >
                {t.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({
  value,
  onChange,
  color = "var(--warning)",
}: {
  value: number;
  onChange: (n: number) => void;
  color?: string;
}) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)}>
          <Star
            className="h-7 w-7 transition"
            style={{ color: n <= value ? color : "var(--muted)" }}
            fill={n <= value ? color : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewHistory({ reviews }: { reviews: DailyReview[] }) {
  const { t } = useTranslation();
  if (!reviews.length) return null;
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft p-5">
      <h3 className="font-semibold mb-4">{t("analytics.recentReflections")}</h3>
      <div className="space-y-3">
        {sorted.map((r) => (
          <div
            key={r.date}
            className="flex items-start gap-4 p-3 rounded-xl bg-muted/40 border border-border"
          >
            <div className="text-xs text-muted-foreground w-20 shrink-0">
              {format(new Date(r.date), "MMM d")}
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5"
                  style={{ color: i < r.rating ? "var(--warning)" : "var(--muted)" }}
                  fill={i < r.rating ? "var(--warning)" : "none"}
                />
              ))}
            </div>
            <div className="text-sm flex-1">
              {r.notes || (
                <span className="text-muted-foreground italic">{t("analytics.noNotes")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
