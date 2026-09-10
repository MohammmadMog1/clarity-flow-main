
-- Categories
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks (subtasks stored as jsonb)
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  planned_date DATE,
  focus BOOLEAN NOT NULL DEFAULT false,
  "order" BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_category_id_idx ON public.tasks(category_id);
CREATE INDEX tasks_planned_date_idx ON public.tasks(planned_date);

-- Monthly goals
CREATE TABLE public.monthly_goals (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- App settings (single row keyed by id)
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  weekly_goal TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.app_settings (id, weekly_goal) VALUES ('default', '');

-- Daily reviews
CREATE TABLE public.daily_reviews (
  date DATE PRIMARY KEY,
  rating INTEGER NOT NULL DEFAULT 3,
  productivity INTEGER NOT NULL DEFAULT 3,
  notes TEXT NOT NULL DEFAULT '',
  completed_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS, open access (no auth in this app)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "public write tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read goals" ON public.monthly_goals FOR SELECT USING (true);
CREATE POLICY "public write goals" ON public.monthly_goals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "public write settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read reviews" ON public.daily_reviews FOR SELECT USING (true);
CREATE POLICY "public write reviews" ON public.daily_reviews FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monthly_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_reviews;

ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.monthly_goals REPLICA IDENTITY FULL;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;
ALTER TABLE public.daily_reviews REPLICA IDENTITY FULL;

-- Seed default categories
INSERT INTO public.categories (id, name, color, icon) VALUES
  ('c-study', 'Study', 'var(--chart-1)', 'GraduationCap'),
  ('c-work', 'Work', 'var(--chart-4)', 'Briefcase'),
  ('c-personal', 'Personal', 'var(--chart-5)', 'Heart'),
  ('c-health', 'Health', 'var(--chart-2)', 'Activity'),
  ('c-ideas', 'Ideas', 'var(--chart-3)', 'Lightbulb'),
  ('c-reading', 'Reading', 'var(--info)', 'BookOpen');
