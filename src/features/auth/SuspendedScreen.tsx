import { useTranslation } from "react-i18next";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";

export function SuspendedScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive grid place-items-center">
          <ShieldOff className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{t("suspended.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("suspended.desc")}</p>
        <Button className="mt-6" variant="outline" onClick={signOut}>
          {t("common.signOut")}
        </Button>
      </div>
    </div>
  );
}
