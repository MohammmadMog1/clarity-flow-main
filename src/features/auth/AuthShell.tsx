import { useTranslation } from "react-i18next";
import { BrandMark } from "@/components/BrandMark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="h-11 w-11 rounded-2xl gradient-primary text-primary-foreground grid place-items-center shadow-soft">
            <BrandMark className="h-5 w-5" />
          </div>
          <div className="mt-3 text-lg font-semibold tracking-tight">Clarity</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.tagline")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-card p-6">{children}</div>
      </div>
    </div>
  );
}
