-- ============================================================================
-- Multi-tenant auth, roles, and announcements
--
-- Turns Clarity from a single shared dataset into a real multi-user app:
--   * every user's tasks/categories/goals/reviews/settings become private
--   * a `profiles` table tracks role (user/admin) and status (active/suspended)
--   * admins can manage accounts and publish in-app announcements, but get
--     no visibility into other users' task data (by design)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-create a profile whenever a new auth user is created (Google or email/password).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at bookkeeping, reused by every table below.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- A non-admin can update their own display_name/avatar_url, but never their
-- own role or status — RLS WITH CHECK can't compare against the old row, so
-- this has to be a trigger.
create function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.is_admin() then
    raise exception 'Only admins can change role or status';
  end if;
  return new;
end;
$$;

-- Helper functions used across every RLS policy below. security definer +
-- a fixed search_path avoids RLS-recursion issues when profiles reads itself.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create function public.is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and status = 'active'
  );
$$;

create trigger profiles_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_privilege_escalation();

alter table public.profiles enable row level security;

create policy "profiles: self or admin can read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: self or admin can update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- No insert/delete policy: profiles are created only by the handle_new_user
-- trigger (security definer) and deleted only via the auth.users cascade.

-- ---------------------------------------------------------------------------
-- Announcements (admin-authored, in-app only)
-- ---------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  level text not null default 'info' check (level in ('info', 'success', 'warning')),
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_active_idx on public.announcements(is_active, created_at desc);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

create policy "announcements: active users read active announcements"
  on public.announcements for select
  using (is_active and public.is_active());

create policy "announcements: admins read everything"
  on public.announcements for select
  using (public.is_admin());

create policy "announcements: admins write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- Per-user read tracking so the unread badge is correct across devices.
create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table public.announcement_reads enable row level security;

create policy "announcement_reads: owner only" on public.announcement_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter publication supabase_realtime add table public.announcements;

-- ---------------------------------------------------------------------------
-- Scope existing data to its owner
-- ---------------------------------------------------------------------------
alter table public.categories add column user_id uuid references auth.users(id) on delete cascade;
alter table public.tasks add column user_id uuid references auth.users(id) on delete cascade;
alter table public.monthly_goals add column user_id uuid references auth.users(id) on delete cascade;
alter table public.daily_reviews add column user_id uuid references auth.users(id) on delete cascade;

create index categories_user_id_idx on public.categories(user_id);
create index tasks_user_id_idx on public.tasks(user_id);
create index monthly_goals_user_id_idx on public.monthly_goals(user_id);
create index daily_reviews_user_id_idx on public.daily_reviews(user_id);

-- app_settings goes from a single global 'default' row to one row per user.
-- It only ever held that one row, so there's nothing to backfill: drop the
-- old text PK and re-key it on user_id directly.
delete from public.app_settings where id = 'default';
alter table public.app_settings drop constraint app_settings_pkey;
alter table public.app_settings drop column id;
alter table public.app_settings add column user_id uuid not null references auth.users(id) on delete cascade;
alter table public.app_settings add primary key (user_id);

-- Existing rows have no owner yet (this app had no auth). They're kept, not
-- dropped — see the follow-up "backfill" step run once after the first
-- admin signs up (documented in the project's setup notes).

drop policy "public read categories" on public.categories;
drop policy "public write categories" on public.categories;
drop policy "public read tasks" on public.tasks;
drop policy "public write tasks" on public.tasks;
drop policy "public read goals" on public.monthly_goals;
drop policy "public write goals" on public.monthly_goals;
drop policy "public read settings" on public.app_settings;
drop policy "public write settings" on public.app_settings;
drop policy "public read reviews" on public.daily_reviews;
drop policy "public write reviews" on public.daily_reviews;

create policy "categories: owner read" on public.categories for select
  using (user_id = auth.uid() and public.is_active());
create policy "categories: owner write" on public.categories for all
  using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());

create policy "tasks: owner read" on public.tasks for select
  using (user_id = auth.uid() and public.is_active());
create policy "tasks: owner write" on public.tasks for all
  using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());

create policy "monthly_goals: owner read" on public.monthly_goals for select
  using (user_id = auth.uid() and public.is_active());
create policy "monthly_goals: owner write" on public.monthly_goals for all
  using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());

create policy "daily_reviews: owner read" on public.daily_reviews for select
  using (user_id = auth.uid() and public.is_active());
create policy "daily_reviews: owner write" on public.daily_reviews for all
  using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());

create policy "app_settings: owner read" on public.app_settings for select
  using (user_id = auth.uid() and public.is_active());
create policy "app_settings: owner write" on public.app_settings for all
  using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());
