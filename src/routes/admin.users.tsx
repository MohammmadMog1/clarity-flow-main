import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "@/features/admin/UsersPage";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [{ title: "Users — Admin — Clarity" }],
  }),
  component: UsersPage,
});
