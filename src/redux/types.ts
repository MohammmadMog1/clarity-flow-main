export type Priority = "low" | "medium" | "high" | "urgent";
export type Difficulty = "easy" | "medium" | "hard";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  priority: Priority;
  difficulty: Difficulty;
  estimatedMinutes: number;
  dueDate?: string; // ISO
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  notes?: string;
  createdAt: string;
  plannedDate?: string; // ISO date string YYYY-MM-DD
  focus?: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string; // token name e.g. "primary" or hex
  icon: string; // lucide icon name
  createdAt: string;
}

export interface DailyReview {
  date: string; // YYYY-MM-DD
  rating: number; // 1-5
  productivity: number; // 1-5
  notes: string;
  completedTaskIds: string[];
}

export interface MonthlyGoal {
  id: string;
  month: string; // YYYY-MM
  title: string;
  categoryId?: string;
  progress: number; // 0-100
  done: boolean;
}
