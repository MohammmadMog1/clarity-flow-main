import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Provider } from "react-redux";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { store } from "@/redux/store";
import { AppShell } from "@/components/AppShell";
import { QuickAddDialog } from "@/components/QuickAddDialog";
import { useDataSync } from "@/hooks/useDataSync";
import i18n from "@/lib/i18n";
import { setLanguage, type Lang } from "@/redux/uiSlice";
import { useAppSelector } from "@/redux/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Back to Brain Dump
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clarity — Plan with intention" },
      {
        name: "description",
        content:
          "A personal productivity system for brain dumping, planning, and tracking your work with calm focus.",
      },
      { property: "og:title", content: "Clarity — Plan with intention" },
      { name: "twitter:title", content: "Clarity — Plan with intention" },
      {
        property: "og:description",
        content:
          "A personal productivity system for brain dumping, planning, and tracking your work with calm focus.",
      },
      {
        name: "twitter:description",
        content:
          "A personal productivity system for brain dumping, planning, and tracking your work with calm focus.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1edfd1ff-0d0b-4cab-973b-67dc2367d63f/id-preview-a2a761d7--4db2d152-d8e2-4326-b816-f64f494a70dd.lovable.app-1778446235483.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1edfd1ff-0d0b-4cab-973b-67dc2367d63f/id-preview-a2a761d7--4db2d152-d8e2-4326-b816-f64f494a70dd.lovable.app-1778446235483.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SyncBoot />
        <AppShell>
          <Outlet />
        </AppShell>
        <QuickAddDialog />
      </Provider>
    </QueryClientProvider>
  );
}

function SyncBoot() {
  useDataSync();
  const language = useAppSelector((s) => s.ui.language);
  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      localStorage.getItem("clarity-lang")) as Lang | null;
    if (stored && stored !== language) store.dispatch(setLanguage(stored));
  }, []);
  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      localStorage.setItem("clarity-lang", language);
    }
  }, [language]);
  return null;
}
