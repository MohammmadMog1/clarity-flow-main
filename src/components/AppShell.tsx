import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CalendarRange,
  BarChart3,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Languages,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openQuickAdd, setLanguage, toggleTheme } from "@/redux/uiSlice";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { theme, language } = useAppSelector((s) => s.ui);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useTranslation();

  const nav = [
    { to: "/", label: t("nav.brain"), icon: LayoutGrid },
    { to: "/planning", label: t("nav.planning"), icon: CalendarRange },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen w-full gradient-mesh">
      <div className="flex min-h-screen w-full">
        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex flex-row gap-3 px-4 md:px-8 py-3 border-b border-border/60 bg-background/60 backdrop-blur-xl justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg gradient-primary grid place-items-center shadow-glow">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="text-sm font-semibold">Clarity</div>
              </div>

              <nav className="flex flex-wrap items-center gap-10 ml-16">
                {nav.map((item) => {
                  const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-1">
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
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-10 overflow-y-auto">{children}</main>
        </div>

        {/* FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(openQuickAdd(undefined))}
          className={`fixed bottom-6 ${language === "ar" ? "left-6" : "right-6"} h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glow grid place-items-center z-30`}
          aria-label="Quick add task"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}
