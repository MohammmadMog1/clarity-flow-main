import { supabase } from "@/integrations/supabase/client";

function originUrl(path: string) {
  return typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: originUrl("/auth/callback") },
  });
  if (error) throw error;
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: originUrl("/auth/callback") },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: originUrl("/update-password"),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
