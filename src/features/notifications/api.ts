import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Announcement = Tables<"announcements">;

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchReadIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.announcement_id));
}

export async function markRead(userId: string, announcementId: string) {
  const { error } = await supabase
    .from("announcement_reads")
    .upsert({ user_id: userId, announcement_id: announcementId });
  if (error) throw error;
}
