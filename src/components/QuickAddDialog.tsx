import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { closeQuickAdd } from "@/redux/uiSlice";
import { addTask } from "@/redux/tasksSlice";
import type { Difficulty, Priority } from "@/redux/types";

export function QuickAddDialog() {
  const dispatch = useAppDispatch();
  const { quickAddOpen, quickAddCategoryId } = useAppSelector((s) => s.ui);
  const categories = useAppSelector((s) => s.categories.items);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(quickAddCategoryId || categories[0]?.id);
  const [priority, setPriority] = useState<Priority>("medium");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [estimatedMinutes, setEst] = useState(30);
  const [dueDate, setDueDate] = useState("");
  const [planToday, setPlanToday] = useState(true);

  useEffect(() => {
    if (quickAddOpen) {
      setTitle("");
      setDescription("");
      setEst(30);
      setDueDate("");
      setPriority("medium");
      setDifficulty("medium");
      setPlanToday(true);
      setCategoryId(quickAddCategoryId || categories[0]?.id);
    }
  }, [quickAddOpen, quickAddCategoryId, categories]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    dispatch(
      addTask({
        title: title.trim(),
        description,
        categoryId,
        priority,
        difficulty,
        estimatedMinutes,
        dueDate: dueDate || undefined,
        plannedDate: planToday ? new Date().toISOString().slice(0, 10) : undefined,
      }),
    );
    dispatch(closeQuickAdd());
  };

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => dispatch(closeQuickAdd())}
        >
          <motion.form
            onSubmit={submit}
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New task</h3>
              <button
                type="button"
                onClick={() => dispatch(closeQuickAdd())}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 outline-none focus:bg-background focus:ring-2 ring-ring text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)…"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 outline-none focus:bg-background focus:ring-2 ring-ring text-sm resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="select"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </Field>
              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
              <Field label="Estimate (min)">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={estimatedMinutes}
                  onChange={(e) => setEst(Number(e.target.value))}
                  className="select"
                />
              </Field>
              <Field label="Due date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="select"
                />
              </Field>
              <label className="flex items-end gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={planToday}
                  onChange={(e) => setPlanToday(e.target.checked)}
                  className="rounded"
                />
                Plan for today
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => dispatch(closeQuickAdd())}
                className="px-4 py-2 rounded-xl text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-sm font-medium gradient-primary text-primary-foreground shadow-soft hover:shadow-glow transition-shadow"
              >
                Add task
              </button>
            </div>

            <style>{`.select{width:100%;padding:0.5rem 0.75rem;border-radius:0.75rem;background:color-mix(in oklab,var(--muted) 50%,transparent);font-size:0.875rem;outline:none}.select:focus{background:var(--background);box-shadow:0 0 0 2px var(--ring)}`}</style>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
