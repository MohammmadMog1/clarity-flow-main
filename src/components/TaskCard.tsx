import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Clock, Flag, Plus, Star, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import {
  toggleTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  toggleFocus,
} from "@/redux/tasksSlice";
import type { Task, Priority, Difficulty } from "@/redux/types";
import { taskProgress } from "@/redux/selectors";
import { ProgressBar } from "./Progress";
import { format } from "date-fns";

const priorityStyles: Record<Priority, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/15 text-warning-foreground border-warning/30",
  medium: "bg-info/10 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
};
const difficultyDots: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

export function TaskCard({ task, accentColor }: { task: Task; accentColor?: string }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [newSub, setNewSub] = useState("");
  const progress = taskProgress(task);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`group rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-shadow p-3.5 ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => dispatch(toggleTask(task.id))}
          className={`mt-0.5 h-5 w-5 rounded-md border-2 grid place-items-center transition ${
            task.completed
              ? "border-success bg-success text-success-foreground"
              : "border-border hover:border-primary"
          }`}
          aria-label="Toggle complete"
        >
          {task.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h4
              className={`text-sm font-medium leading-snug flex-1 ${task.completed ? "line-through" : ""}`}
            >
              {task.title}
            </h4>
            <button
              onClick={() => dispatch(toggleFocus(task.id))}
              className={`opacity-0 group-hover:opacity-100 transition ${task.focus ? "opacity-100 text-warning" : "text-muted-foreground"}`}
              aria-label="Focus"
            >
              <Star className="h-4 w-4" fill={task.focus ? "currentColor" : "none"} />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium border ${priorityStyles[task.priority]}`}
            >
              <Flag className="h-2.5 w-2.5" /> {task.priority}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-muted text-muted-foreground">
              {Array.from({ length: difficultyDots[task.difficulty] }).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              ))}
              {task.difficulty}
            </span>
            {task.estimatedMinutes > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-muted text-muted-foreground">
                <Clock className="h-2.5 w-2.5" /> {task.estimatedMinutes}m
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-muted text-muted-foreground">
                <Calendar className="h-2.5 w-2.5" /> {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="mt-2.5">
              <ProgressBar value={progress} color={accentColor || "var(--primary)"} />
              <button
                onClick={() => setOpen(!open)}
                className="mt-1.5 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtasks
              </button>
            </div>
          )}

          <AnimatePresence>
            {(open || task.subtasks.length === 0) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {task.subtasks.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 group/sub">
                      <button
                        onClick={() => dispatch(toggleSubtask({ taskId: task.id, subId: s.id }))}
                        className={`h-3.5 w-3.5 rounded border ${s.done ? "bg-success border-success" : "border-border"}`}
                      />
                      <span
                        className={`text-xs flex-1 ${s.done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {s.title}
                      </span>
                      <button
                        onClick={() => dispatch(deleteSubtask({ taskId: task.id, subId: s.id }))}
                        className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newSub.trim()) {
                        dispatch(addSubtask({ taskId: task.id, title: newSub.trim() }));
                        setNewSub("");
                      }
                    }}
                    className="flex items-center gap-1.5 mt-1"
                  >
                    <Plus className="h-3 w-3 text-muted-foreground" />
                    <input
                      value={newSub}
                      onChange={(e) => setNewSub(e.target.value)}
                      placeholder="Add subtask"
                      className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                    />
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => dispatch(deleteTask(task.id))}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
