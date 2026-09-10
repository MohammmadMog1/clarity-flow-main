import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendPasswordReset } from "./api";
import { AuthShell } from "./AuthShell";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const schema = z.object({ email: z.string().trim().min(1).email() });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await sendPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.genericError"));
    }
  };

  return (
    <AuthShell>
      <h1 className="text-base font-semibold">{t("auth.resetTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("auth.resetDesc")}</p>

      {sent ? (
        <p className="mt-5 text-sm rounded-xl bg-success/10 text-success-foreground p-3">
          {t("auth.resetSent")}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {t("auth.resetCta")}
            </Button>
          </form>
        </Form>
      )}

      <Link
        to="/login"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("auth.backToSignIn")}
      </Link>
    </AuthShell>
  );
}
