import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAllAnnouncements,
  setAnnouncementActive,
  type AnnouncementLevel,
} from "./api";
import { AdminLayout } from "./AdminLayout";

const levelBadge: Record<AnnouncementLevel, "default" | "secondary" | "destructive"> = {
  info: "secondary",
  success: "default",
  warning: "destructive",
};

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: fetchAllAnnouncements,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
  };

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<AnnouncementLevel>("info");

  const createMutation = useMutation({
    mutationFn: () =>
      createAnnouncement({ title: title.trim(), body: body.trim(), level, created_by: user!.id }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setLevel("info");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      setAnnouncementActive(id, is_active),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  const announcements = announcementsQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{t("admin.announcementsDesc")}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) return;
            createMutation.mutate();
          }}
          className="rounded-2xl border border-border p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold">{t("admin.newAnnouncement")}</h2>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("admin.announcementTitle")}
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("admin.announcementBody")}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Select value={level} onValueChange={(v) => setLevel(v as AnnouncementLevel)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{t("admin.level_info")}</SelectItem>
                <SelectItem value="success">{t("admin.level_success")}</SelectItem>
                <SelectItem value="warning">{t("admin.level_warning")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={!title.trim() || !body.trim() || createMutation.isPending}
            >
              <Plus className="h-4 w-4" /> {t("admin.publish")}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border border-border p-4 flex items-start gap-3 ${!a.is_active ? "opacity-60" : ""}`}
            >
              <Badge variant={levelBadge[a.level]}>{t(`admin.level_${a.level}`)}</Badge>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{a.title}</div>
                <p className="text-sm text-muted-foreground mt-0.5">{a.body}</p>
                <div className="text-xs text-muted-foreground/70 mt-1.5">
                  {format(new Date(a.created_at), "MMM d, yyyy")}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMutation.mutate({ id: a.id, is_active: !a.is_active })}
                >
                  {a.is_active ? t("admin.unpublish") : t("admin.publish")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("admin.confirmDelete")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(a.id)}>
                        {t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("admin.noAnnouncements")}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
