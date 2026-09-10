import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { updatePassword } from "./api";
import { AuthShell } from "./AuthShell";

export default function UpdatePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const schema = z
    .object({
      password: z.string().min(8, t("auth.passwordTooShort")),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("auth.passwordMismatch"),
      path: ["confirmPassword"],
    });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await updatePassword(values.password);
      setDone(true);
      setTimeout(() => navigate({ to: "/" }), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.genericError"));
    }
  };

  return (
    <AuthShell>
      <h1 className="text-base font-semibold">{t("auth.updateTitle")}</h1>

      {done ? (
        <p className="mt-5 text-sm rounded-xl bg-success/10 text-success-foreground p-3">
          {t("auth.updateSuccess")}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {t("auth.updateCta")}
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}
