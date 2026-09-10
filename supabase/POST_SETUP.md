# One-time setup after deploying the auth migration

Run these once, in order, after `20260910142522_auth_admin_announcements.sql`
has been applied to your Supabase project.

## 1. Enable Google sign-in

Supabase Dashboard → **Authentication → Providers → Google**:

1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. Paste the Client ID and Client Secret into the Supabase Google provider settings and enable it.
3. Supabase Dashboard → **Authentication → URL Configuration**: add your app's URLs
   to *Redirect URLs* (e.g. `http://localhost:5173/auth/callback` for local dev,
   plus your production domain once deployed).

## 2. Sign up once, then promote yourself to admin

Sign in to the app once (Google or email/password) with the account that should
own the admin dashboard. Then, in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

## 3. Attach the app's existing data to your account

The app had no auth before this migration, so its existing tasks/categories/goals
belong to nobody yet. After step 2, attach them all to your account (replace the
email):

```sql
do $$
declare
  uid uuid;
begin
  select id into uid from public.profiles where email = 'your-email@example.com';

  update public.categories set user_id = uid where user_id is null;
  update public.tasks set user_id = uid where user_id is null;
  update public.monthly_goals set user_id = uid where user_id is null;
  update public.daily_reviews set user_id = uid where user_id is null;
end $$;
```

## 4. Lock the ownership columns down

Once every row has an owner (step 3), make `user_id` mandatory so it can never
be null again:

```sql
alter table public.categories alter column user_id set not null;
alter table public.tasks alter column user_id set not null;
alter table public.monthly_goals alter column user_id set not null;
alter table public.daily_reviews alter column user_id set not null;
```

(`app_settings` doesn't need this — it only ever held one shared row, which the
migration already dropped, so it starts out empty and per-user from day one.)
