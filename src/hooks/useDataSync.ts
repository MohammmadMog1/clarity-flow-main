import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/dataSync";
import { store } from "@/redux/store";

/**
 * Loads the signed-in user's data and keeps it live via a realtime channel
 * scoped to their own rows. Debounced + request-ordered so a burst of writes
 * (or two tabs open at once) can't cause overlapping fetches to land out of
 * order and clobber newer state with a stale response.
 */
export function useDataSync(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    let requestId = 0;

    const load = async () => {
      const thisRequest = ++requestId;
      try {
        const data = await fetchAll();
        if (cancelled || thisRequest !== requestId) return;
        store.dispatch({ type: "categories/hydrateCategories", payload: data.categories });
        store.dispatch({ type: "tasks/hydrateTasks", payload: data.tasks });
        store.dispatch({
          type: "planning/hydratePlanning",
          payload: { monthlyGoals: data.monthlyGoals, weeklyGoal: data.weeklyGoal },
        });
        store.dispatch({ type: "analytics/hydrateAnalytics", payload: data.reviews });
      } catch (e) {
        console.error("[sync] load failed", e);
      }
    };

    load();

    let debounceTimer: ReturnType<typeof setTimeout>;
    const scheduleReload = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(load, 250);
    };

    const channel = supabase
      .channel(`app-sync-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories", filter: `user_id=eq.${userId}` },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "monthly_goals", filter: `user_id=eq.${userId}` },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: `user_id=eq.${userId}` },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_reviews", filter: `user_id=eq.${userId}` },
        scheduleReload,
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
