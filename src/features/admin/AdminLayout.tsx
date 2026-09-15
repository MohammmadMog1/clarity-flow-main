import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/AuthProvider";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 text-sm text-muted-foreground">
        {t("admin.adminOnly")}
      </div>
    );
  }

  const tabs = [
    { to: "/admin/users" as const, label: t("admin.users") },
    { to: "/admin/announcements" as const, label: t("admin.announcements") },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("admin.title")}</h1>
      </header>
      <div
        data-tour="admin-tabs"
        className="inline-flex p-1 rounded-2xl bg-muted/60 border border-border"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              path === tab.to
                ? "bg-card shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
