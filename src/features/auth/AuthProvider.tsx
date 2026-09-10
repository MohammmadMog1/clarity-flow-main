import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type AuthStatus = "loading" | "signedOut" | "signedIn" | "suspended";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // undefined = session not resolved yet, null = signed out
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const status: AuthStatus =
    user === undefined || (!!user && profileQuery.isPending)
      ? "loading"
      : !user
        ? "signedOut"
        : profileQuery.data?.status === "suspended"
          ? "suspended"
          : "signedIn";

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user: user ?? null,
        profile: profileQuery.data ?? null,
        isAdmin: profileQuery.data?.role === "admin",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
