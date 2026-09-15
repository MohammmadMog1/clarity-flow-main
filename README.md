# Clarity Flow

Clarity Flow is a personal productivity app that turns scattered thoughts into a clear, actionable plan. Organize tasks by area, set priorities, track goals, and review daily productivity from one focused workspace.

## Features

- **Brain Dump** workspace for quickly capturing and organizing tasks into custom categories.
- Task creation, editing, deletion, priorities, difficulty, estimated time, and notes.
- Subtasks with automatic completion state for parent tasks.
- Daily, weekly, and monthly planning with focus-task selection.
- Monthly goals and weekly goals with progress tracking.
- Productivity analytics including completion rates, streaks, and most productive days.
- Daily reviews for ratings, notes, and completed-task reflection.
- Cross-device synchronization powered by Supabase Realtime.
- Email/password and Google authentication, password reset, and password updates.
- English and Arabic localization with RTL support.
- Guided in-app onboarding tours.
- Admin dashboard for user management and in-app announcements.
- Responsive interface for desktop and mobile devices.

## Tech Stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Redux Toolkit and TanStack Query
- Supabase Auth, Postgres, and Realtime
- Tailwind CSS and Radix UI
- Recharts and Framer Motion
- Cloudflare Workers with Wrangler

## Requirements

- Node.js 18 or newer
- A [Supabase](https://supabase.com/) project
- npm or Bun

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   The application also supports `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for server-side or Cloudflare execution.

3. Apply the migrations in `supabase/migrations` to your Supabase project in order.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open the URL printed by Vite, usually `http://localhost:5173`.

## Supabase and Authentication Setup

After applying the authentication and admin migration, follow [supabase/POST_SETUP.md](supabase/POST_SETUP.md) to:

1. Enable the Google provider and add local and production redirect URLs.
2. Create the first user and promote the account to `admin` when needed.
3. Attach existing data to a user account if the database contains legacy data.
4. Make `user_id` ownership columns mandatory after the migration is complete.

Never expose a `service_role` key in the frontend or browser-visible environment variables. Use only the publishable Supabase key in `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Create a production build            |
| `npm run build:dev` | Create a development-mode build      |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint                           |
| `npm run format`    | Format files with Prettier           |

## Cloudflare Deployment

After configuring the environment variables in Cloudflare, build and deploy with Wrangler:

```bash
npm run build
npx wrangler deploy
```

The server entry point is `src/server.ts`. Cloudflare configuration is stored in [wrangler.jsonc](wrangler.jsonc).

## Project Structure

```text
src/
├── components/       Shared UI components
├── features/         Auth, tasks, planning, analytics, and admin features
├── integrations/     Supabase integration
├── redux/            Global state and synchronization
├── routes/           TanStack Router pages and routes
└── lib/              Date, i18n, sync, and error-handling utilities
supabase/
└── migrations/       Database schema and access policies
```

## Contributing

1. Create a new branch for your change.
2. Install dependencies and run `npm run lint` and `npm run build`.
3. Open a Pull Request describing the change and any required configuration.

## License

This project does not currently specify a license. Add an official license file before reusing or distributing the project.

---

# Clarity Flow بالعربية

Clarity Flow هو تطبيق شخصي للإنتاجية يحوّل الأفكار والمهام المبعثرة إلى خطة واضحة قابلة للتنفيذ. يساعدك على تنظيم المهام حسب المجالات، تحديد الأولويات، متابعة الأهداف، ومراجعة إنتاجيتك اليومية من مساحة عمل واحدة.

## المزايا

- مساحة **Brain Dump** لتسجيل المهام بسرعة وتنظيمها داخل تصنيفات مخصصة.
- إنشاء المهام وتعديلها وحذفها، مع دعم الأولوية والصعوبة والوقت المتوقع والملاحظات.
- مهام فرعية مع تحديث حالة المهمة الرئيسية تلقائيًا.
- تخطيط يومي وأسبوعي وشهري مع تحديد المهام التي تحتاج إلى تركيز.
- أهداف شهرية وهدف أسبوعي مع متابعة التقدم.
- تحليلات للإنتاجية ونسب الإنجاز وسلسلة الأيام وأفضل أيام العمل.
- مراجعات يومية لتسجيل التقييم والملاحظات والمهام المكتملة.
- مزامنة البيانات بين الأجهزة باستخدام Supabase Realtime.
- تسجيل الدخول بالبريد وكلمة المرور أو Google، مع استعادة وتحديث كلمة المرور.
- دعم اللغتين العربية والإنجليزية واتجاه RTL.
- جولات تعريفية داخل التطبيق لمساعدة المستخدم على البدء.
- لوحة إدارة للمستخدمين والإعلانات داخل التطبيق.
- تصميم متجاوب للشاشات الكبيرة والأجهزة المحمولة.

## التقنيات المستخدمة

- React 19 وTypeScript
- TanStack Start وTanStack Router
- Vite
- Redux Toolkit وTanStack Query
- Supabase Auth وPostgres وRealtime
- Tailwind CSS وRadix UI
- Recharts وFramer Motion
- Cloudflare Workers عبر Wrangler

## المتطلبات

- Node.js إصدار 18 أو أحدث
- حساب ومشروع على [Supabase](https://supabase.com/)
- npm أو Bun

## التشغيل محليًا

1. ثبّت الاعتماديات:

   ```bash
   npm install
   ```

2. أنشئ ملف `.env` اعتمادًا على `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   يدعم التطبيق أيضًا `SUPABASE_URL` و`SUPABASE_PUBLISHABLE_KEY` عند التشغيل على الخادم أو Cloudflare.

3. طبّق ملفات الترحيل الموجودة في `supabase/migrations` على مشروع Supabase بالترتيب.

4. شغّل خادم التطوير:

   ```bash
   npm run dev
   ```

   ثم افتح العنوان الذي يعرضه Vite، وغالبًا يكون `http://localhost:5173`.

## إعداد Supabase والمصادقة

بعد تطبيق ترحيل المصادقة والإدارة، راجع [supabase/POST_SETUP.md](supabase/POST_SETUP.md) من أجل:

1. تفعيل Google provider وإضافة روابط إعادة التوجيه المحلية والإنتاجية.
2. إنشاء أول مستخدم ومنحه دور `admin` عند الحاجة.
3. ربط البيانات القديمة بحساب المستخدم إذا كان المشروع يحتوي على بيانات سابقة.
4. جعل أعمدة الملكية `user_id` إلزامية بعد اكتمال الترحيل.

لا تضع مفتاح `service_role` في الواجهة أو في متغيرات البيئة المكشوفة للمتصفح. استخدم مفتاح Supabase القابل للنشر فقط في `VITE_SUPABASE_PUBLISHABLE_KEY`.

## الأوامر المتاحة

| الأمر               | الوصف                               |
| ------------------- | ----------------------------------- |
| `npm run dev`       | تشغيل بيئة التطوير                  |
| `npm run build`     | إنشاء نسخة الإنتاج                  |
| `npm run build:dev` | إنشاء نسخة باستخدام إعدادات التطوير |
| `npm run preview`   | معاينة نسخة الإنتاج محليًا          |
| `npm run lint`      | فحص قواعد ESLint                    |
| `npm run format`    | تنسيق الملفات باستخدام Prettier     |

## النشر على Cloudflare

بعد ضبط متغيرات البيئة في Cloudflare، أنشئ نسخة الإنتاج ثم انشرها باستخدام Wrangler:

```bash
npm run build
npx wrangler deploy
```

يستخدم المشروع `src/server.ts` كنقطة دخول للخادم، وتوجد إعدادات Cloudflare في [wrangler.jsonc](wrangler.jsonc).

## البنية الرئيسية

```text
src/
├── components/       مكونات الواجهة العامة
├── features/         ميزات المصادقة والمهام والتخطيط والتحليلات والإدارة
├── integrations/     تكامل Supabase
├── redux/            الحالة العامة والمزامنة
├── routes/           صفحات ومسارات TanStack Router
└── lib/              أدوات التاريخ والترجمة والمزامنة ومعالجة الأخطاء
supabase/
└── migrations/       مخططات قاعدة البيانات وسياسات الوصول
```

## المساهمة

1. أنشئ فرعًا جديدًا للتغيير.
2. ثبّت الاعتماديات وشغّل `npm run lint` و`npm run build`.
3. افتح Pull Request يشرح التغيير وأي إعدادات مطلوبة.

## الترخيص

لم يتم تحديد ترخيص للمشروع حتى الآن. أضف ملف ترخيص رسميًا قبل إعادة استخدام المشروع أو توزيعه.
