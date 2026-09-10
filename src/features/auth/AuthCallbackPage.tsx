import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = (hasSession: boolean) => {
      if (cancelled) return;
      if (hasSession) navigate({ to: "/" });
      else setFailed(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) return finish(true);
      // supabase-js is still exchanging the code in the URL — wait for the
      // auth state change event instead of polling.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        finish(!!session);
      });
      const timeout = setTimeout(() => finish(false), 8000);
      return () => {
        sub.subscription.unsubscribe();
        clearTimeout(timeout);
      };
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background px-4">
      <div className="text-center">
        {failed ? (
          <>
            <p className="text-sm text-muted-foreground">{t("auth.genericError")}</p>
            <a href="/login" className="mt-3 inline-block text-sm text-primary hover:underline">
              {t("auth.backToSignIn")}
            </a>
          </>
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        )}
      </div>
    </div>
  );
}
