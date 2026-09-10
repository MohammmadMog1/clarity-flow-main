import { createFileRoute } from "@tanstack/react-router";
import AnnouncementsPage from "@/features/admin/AnnouncementsPage";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [{ title: "Announcements — Admin — Clarity" }],
  }),
  component: AnnouncementsPage,
});
