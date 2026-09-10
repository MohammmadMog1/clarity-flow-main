import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleIcon } from "./GoogleIcon";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "./api";
import { AuthShell } from "./AuthShell";

const emailSchema = z.string().trim().min(1).email();

export default function LoginPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"signIn" | "signUp">("signIn");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : t("auth.genericError"));
    }
  };

  return (
    <AuthShell>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signIn">{t("auth.signIn")}</TabsTrigger>
          <TabsTrigger value="signUp">{t("auth.signUp")}</TabsTrigger>
        </TabsList>

        <div className="mt-5 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            {googleLoading ? t("auth.connectingWithGoogle") : t("auth.continueWithGoogle")}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            {t("auth.orWithEmail")}
            <div className="h-px flex-1 bg-border" />
          </div>

          <TabsContent value="signIn" className="mt-0">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signUp" className="mt-0">
            <SignUpForm onDone={() => setTab("signIn")} />
          </TabsContent>
        </div>
      </Tabs>
    </AuthShell>
  );
}

function SignInForm() {
  const { t } = useTranslation();
  const schema = z.object({
    email: emailSchema,
    password: z.string().min(1),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await signInWithPassword(values.email, values.password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.genericError"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("auth.password")}</FormLabel>
                <Link
                  to="/reset-password"
                  className="text-xs text-primary hover:underline"
                  tabIndex={-1}
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t("auth.signingIn") : t("auth.signInCta")}
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const schema = z
    .object({
      email: emailSchema,
      password: z.string().min(8, t("auth.passwordTooShort")),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("auth.passwordMismatch"),
      path: ["confirmPassword"],
    });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await signUpWithPassword(values.email, values.password);
      toast.success(t("auth.signUpSuccess"));
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.genericError"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
          {form.formState.isSubmitting ? t("auth.signingUp") : t("auth.signUpCta")}
        </Button>
      </form>
    </Form>
  );
}
