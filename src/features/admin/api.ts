import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Announcement = Tables<"announcements">;
export type AnnouncementLevel = Announcement["level"];

export async function fetchUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setUserRole(id: string, role: "user" | "admin") {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

export async function setUserStatus(id: string, status: "active" | "suspended") {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  level: AnnouncementLevel;
  created_by: string;
}) {
  const { error } = await supabase.from("announcements").insert(input);
  if (error) throw error;
}

export async function setAnnouncementActive(id: string, is_active: boolean) {
  const { error } = await supabase.from("announcements").update({ is_active }).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
