import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fetchActiveAnnouncements, fetchReadIds, markRead } from "./api";

const levelDot: Record<string, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
};

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const announcementsQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchActiveAnnouncements,
    enabled: !!user,
  });
  const readIdsQuery = useQuery({
    queryKey: ["announcement-reads", user?.id],
    queryFn: () => fetchReadIds(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("announcements-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () =>
        queryClient.invalidateQueries({ queryKey: ["announcements"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const announcements = announcementsQuery.data ?? [];
  const readIds = readIdsQuery.data ?? new Set<string>();
  const unread = announcements.filter((a) => !readIds.has(a.id));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && user && unread.length > 0) {
      Promise.all(unread.map((a) => markRead(user.id, a.id))).then(() =>
        queryClient.invalidateQueries({ queryKey: ["announcement-reads", user.id] }),
      );
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={t("notifications.title")}
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold">
          {t("notifications.title")}
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {announcements.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${levelDot[a.level] ?? "bg-muted-foreground"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{a.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
                    <div className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(a.created_at), {
                        addSuffix: true,
                        locale: i18n.language === "ar" ? ar : undefined,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
