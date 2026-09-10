import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { QuickAddDialog } from "@/features/tasks/QuickAddDialog";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "./AuthProvider";
import { SuspendedScreen } from "./SuspendedScreen";

const AUTH_ONLY_PATHS = new Set([
  "/login",
  "/reset-password",
  "/update-password",
  "/auth/callback",
]);

function FullPageSpinner() {
  return (
    <div className="min-h-screen w-full grid place-items-center bg-background">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Gates every route on auth state: redirects signed-out visitors to /login,
 * blocks suspended accounts, and keeps signed-in users off the auth pages. */
export function AppGate({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isAuthPath = AUTH_ONLY_PATHS.has(path);

  useDataSync(status === "signedIn" ? user?.id : undefined);

  useEffect(() => {
    if (status === "signedOut" && !isAuthPath) {
      navigate({ to: "/login", replace: true });
    } else if (status === "signedIn" && (path === "/login" || path === "/reset-password")) {
      navigate({ to: "/", replace: true });
    }
  }, [status, path, isAuthPath, navigate]);

  if (isAuthPath) return <>{children}</>;
  if (status === "loading" || status === "signedOut") return <FullPageSpinner />;
  if (status === "suspended") return <SuspendedScreen />;

  return (
    <>
      <AppShell>{children}</AppShell>
      <QuickAddDialog />
    </>
  );
}
