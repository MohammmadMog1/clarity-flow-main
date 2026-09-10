import { createFileRoute } from "@tanstack/react-router";
import UpdatePasswordPage from "@/features/auth/UpdatePasswordPage";

export const Route = createFileRoute("/update-password")({
  head: () => ({
    meta: [{ title: "Choose a new password — Clarity" }],
  }),
  component: UpdatePasswordPage,
});
