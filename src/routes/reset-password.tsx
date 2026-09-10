import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password — Clarity" }],
  }),
  component: ResetPasswordPage,
});
