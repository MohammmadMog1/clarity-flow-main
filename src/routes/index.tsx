import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectFilteredTasks, categoryStats } from "@/redux/selectors";
import { addCategory, deleteCategory } from "@/redux/categoriesSlice";
import { openQuickAdd } from "@/redux/uiSlice";
import { TaskCard } from "@/components/TaskCard";
import { ProgressRing } from "@/components/Progress";
import { DynamicIcon } from "@/components/DynamicIcon";
import { nanoid } from "@reduxjs/toolkit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brain Dump — Clarity" },
      {
        name: "description",
        content:
          "Empty your mind. Organize tasks across categories with progress and focus tracking.",
      },
      { property: "og:title", content: "Brain Dump — Clarity" },
      { property: "og:description", content: "Empty your mind. Organize tasks across categories." },
    ],
  }),
  component: BrainDumpPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--info)",
];
const ICONS = [
  "GraduationCap",
  "Briefcase",
  "Heart",
  "Activity",
  "Lightbulb",
  "BookOpen",
  "Music",
  "Code",
  "Palette",
  "Rocket",
];

function BrainDumpPage() {
  const categories = useAppSelector((s) => s.categories.items);
  const tasks = useAppSelector(selectFilteredTasks);
  const dispatch = useAppDispatch();

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const overallProgress = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <Hero progress={overallProgress} total={tasks.length} done={totalCompleted} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {categories.map((c, i) => (
          <CategoryColumn key={c.id} category={c} index={i} />
        ))}
        <NewCategoryCard
          onCreate={(name, color, icon) =>
            dispatch(
              addCategory({ id: nanoid(), name, color, icon, createdAt: new Date().toISOString() }),
            )
          }
        />
      </div>
    </div>
  );
}

function Hero({ progress, total, done }: { progress: number; total: number; done: number }) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? t("common.morning") : h < 18 ? t("common.afternoon") : t("common.evening"),
    );
    setDateLabel(
      new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, [t, i18n.language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-7 md:p-9 glass shadow-card"
    >
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full gradient-primary opacity-20 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-info/30 blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3" /> {mounted ? dateLabel : "\u00A0"}
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            {mounted ? greeting : "\u00A0"}.{" "}
            <span className="text-gradient">{t("brain.emptyMind")}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">{t("brain.subtitle")}</p>
        </div>
        <div className="flex items-center gap-5">
          <Stat label={t("brain.tasks")} value={total} />
          <Stat label={t("brain.completed")} value={done} />
          <ProgressRing value={progress} size={84} stroke={8} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function CategoryColumn({ category, index }: { category: any; index: number }) {
  const tasks = useAppSelector(selectFilteredTasks).filter((t) => t.categoryId === category.id);
  const stats = categoryStats(
    useAppSelector((s) => s.tasks.items),
    category.id,
  );
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-3xl glass shadow-soft p-4 flex flex-col min-h-[320px]"
    >
      <header className="flex items-center gap-3 px-1.5 pb-3 border-b border-border/60">
        <div
          className="h-10 w-10 rounded-xl grid place-items-center text-white shadow-soft"
          style={{ background: category.color }}
        >
          <DynamicIcon name={category.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm truncate">{category.name}</h3>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-card py-1 z-10"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        dispatch(deleteCategory(category.id));
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-start text-xs text-destructive hover:bg-muted flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" /> {t("brain.deleteCategory")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
            <span>
              {stats.completed}/{stats.total} {t("brain.done")}
            </span>
            <span>•</span>
            <span>{stats.minutes}m</span>
          </div>
        </div>
        <ProgressRing value={stats.progress} size={42} stroke={4} color={category.color} />
      </header>

      <div className="space-y-2 mt-3 flex-1 scrollbar-thin overflow-y-auto pr-1 max-h-[460px]">
        <AnimatePresence>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} accentColor={category.color} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">
            {t("brain.noTasks")}
          </div>
        )}
      </div>

      <button
        onClick={() => dispatch(openQuickAdd(category.id))}
        className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition flex items-center justify-center gap-1.5"
      >
        <Plus className="h-4 w-4" /> {t("brain.addTask")}
      </button>
    </motion.section>
  );
}

function NewCategoryCard({
  onCreate,
}: {
  onCreate: (name: string, color: string, icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 border-dashed border-border min-h-[320px] grid place-items-center p-6"
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-center text-muted-foreground hover:text-primary transition"
        >
          <div className="h-12 w-12 mx-auto rounded-2xl bg-muted grid place-items-center mb-2">
            <Plus className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium">{t("brain.newCategory")}</div>
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              onCreate(name.trim(), color, icon);
              setOpen(false);
              setName("");
            }
          }}
          className="w-full space-y-3"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("brain.categoryName")}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border outline-none focus:ring-2 ring-ring text-sm"
          />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("brain.color")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-lg ${color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("brain.icon")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`h-7 w-7 rounded-lg grid place-items-center ${icon === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <DynamicIcon name={i} className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-sm hover:bg-muted"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-sm gradient-primary text-primary-foreground"
            >
              {t("common.create")}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
