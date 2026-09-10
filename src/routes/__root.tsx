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
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";
import { store } from "@/redux/store";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AppGate } from "@/features/auth/AppGate";
import i18n from "@/lib/i18n";
import { useAppSelector } from "@/redux/store";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">There's nothing at this address.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          {t("nav.brain")}
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
      { name: "theme-color", content: "#c2632c" },
      { title: "Clarity — Plan with intention" },
      {
        name: "description",
        content: "Brain dump your tasks, plan your days, and see where your time actually goes.",
      },
      { property: "og:title", content: "Clarity — Plan with intention" },
      { name: "twitter:title", content: "Clarity — Plan with intention" },
      {
        property: "og:description",
        content: "Brain dump your tasks, plan your days, and see where your time actually goes.",
      },
      {
        name: "twitter:description",
        content: "Brain dump your tasks, plan your days, and see where your time actually goes.",
      },
      { name: "twitter:card", content: "summary" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
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
        <AuthProvider>
          <LanguageBoot />
          <AppGate>
            <Outlet />
          </AppGate>
        </AuthProvider>
      </Provider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

// uiSlice already hydrates `language` from localStorage on the client and
// persists every change back to that same key — this just keeps i18next and
// the document's lang/dir attributes (RTL for Arabic) in sync with it.
function LanguageBoot() {
  const language = useAppSelector((s) => s.ui.language);
  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  return null;
}
