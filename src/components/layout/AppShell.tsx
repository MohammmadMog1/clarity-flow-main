import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CalendarRange,
  BarChart3,
  ShieldCheck,
  Sun,
  Moon,
  Plus,
  Languages,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openQuickAdd, setLanguage, toggleTheme } from "@/redux/uiSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandMark } from "@/components/BrandMark";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { useAuth } from "@/features/auth/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { theme, language } = useAppSelector((s) => s.ui);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useTranslation();
  const { profile, isAdmin, signOut } = useAuth();

  const nav = [
    { to: "/" as const, label: t("nav.brain"), icon: LayoutGrid },
    { to: "/planning" as const, label: t("nav.planning"), icon: CalendarRange },
    { to: "/analytics" as const, label: t("nav.analytics"), icon: BarChart3 },
    ...(isAdmin ? [{ to: "/admin/users" as const, label: t("nav.admin"), icon: ShieldCheck }] : []),
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const initials = (profile?.display_name || profile?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-8 py-3 border-b border-border bg-background/85 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg gradient-primary grid place-items-center text-primary-foreground">
              <BrandMark className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Clarity</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ms-6">
            {nav.map((item) => {
              const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 ms-auto">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => dispatch(setLanguage(language === "ar" ? "en" : "ar"))}
              title={language === "ar" ? "English" : "العربية"}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => dispatch(toggleTheme())}
              title={theme === "dark" ? t("nav.light") : t("nav.dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ms-1 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {profile?.display_name || profile?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 pb-24 md:pb-10">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-stretch border-t border-border bg-background/95 backdrop-blur-md">
          {nav.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(openQuickAdd(undefined))}
          className="fixed bottom-20 md:bottom-6 end-6 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glow grid place-items-center z-30"
          aria-label={t("brain.addTask")}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}
