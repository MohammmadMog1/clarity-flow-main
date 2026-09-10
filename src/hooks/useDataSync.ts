import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/dataSync";
import { store } from "@/redux/store";

let started = false;

export function useDataSync() {
  useEffect(() => {
    if (started) return;
    started = true;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchAll();
        if (cancelled) return;
        store.dispatch({ type: "categories/hydrateCategories", payload: data.categories });
        store.dispatch({ type: "tasks/hydrateTasks", payload: data.tasks });
        store.dispatch({
          type: "planning/hydratePlanning",
          payload: { monthlyGoals: data.monthlyGoals, weeklyGoal: data.weeklyGoal },
        });
        store.dispatch({ type: "analytics/hydrateAnalytics", payload: data.reviews });
      } catch (e) {
        console.error("[sync] initial load failed", e);
      }
    };

    load();

    // Realtime: refetch on any change
    const channel = supabase
      .channel("app-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "monthly_goals" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_reviews" }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      started = false;
    };
  }, []);
}
