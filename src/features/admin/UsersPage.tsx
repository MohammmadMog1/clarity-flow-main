import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { usePageTour, type TourStep } from "@/components/onboarding/Tour";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { fetchUsers, setUserRole, setUserStatus, type Profile } from "./api";
import { AdminLayout } from "./AdminLayout";

export default function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) => setUserRole(id, role),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "suspended" }) =>
      setUserStatus(id, status),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  const q = search.trim().toLowerCase();
  const users = (usersQuery.data ?? []).filter(
    (u) => !q || u.email.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q),
  );

  const tourSteps = useMemo<TourStep[]>(
    () => [
      {
        target: '[data-tour="admin-tabs"]',
        title: t("tour.adminUsers.tabsTitle"),
        content: t("tour.adminUsers.tabsContent"),
        placement: "bottom",
      },
      {
        target: '[data-tour="admin-search"]',
        title: t("tour.adminUsers.searchTitle"),
        content: t("tour.adminUsers.searchContent"),
        placement: "bottom",
      },
      {
        target: '[data-tour="admin-table"]',
        title: t("tour.adminUsers.tableTitle"),
        content: t("tour.adminUsers.tableContent"),
        placement: "top",
      },
    ],
    [t],
  );
  usePageTour("admin-users", tourSteps);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t("admin.usersDesc")}</p>
          <Input
            data-tour="admin-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchUsers")}
            className="sm:max-w-xs"
          />
        </div>

        <div data-tour="admin-table" className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auth.email")}</TableHead>
                <TableHead>{t("admin.role")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead>{t("admin.joined")}</TableHead>
                <TableHead className="text-end">{t("common.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: Profile) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.display_name || u.email}</div>
                      {u.display_name && (
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === "active" ? "secondary" : "destructive"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(u.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSelf || roleMutation.isPending}
                          onClick={() =>
                            roleMutation.mutate({
                              id: u.id,
                              role: u.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          <UserCog className="h-3.5 w-3.5 me-1.5" />
                          {u.role === "admin" ? t("admin.removeAdmin") : t("admin.makeAdmin")}
                        </Button>

                        {u.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isSelf}>
                                <ShieldOff className="h-3.5 w-3.5 me-1.5" />
                                {t("admin.suspend")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.suspend")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("admin.confirmSuspend")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    statusMutation.mutate({ id: u.id, status: "suspended" })
                                  }
                                >
                                  {t("admin.suspend")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => statusMutation.mutate({ id: u.id, status: "active" })}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 me-1.5" />
                            {t("admin.reinstate")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("admin.noUsers")}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
