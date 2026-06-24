"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import { LogoMark } from "@/components/logo";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

type LoginFormValues = {
  email: string;
  password: string;
};

function RonoLogo() {
  return (
    <div className="flex items-center justify-center gap-3 text-primary">
      <LogoMark className="size-9" />
      <span className="text-2xl font-bold tracking-tight text-foreground">
        Rono
      </span>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  const login = useLogin();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t.auth.login.validation.emailInvalid }),
        password: z
          .string()
          .min(1, { message: t.auth.login.validation.passwordRequired }),
      }),
    [t],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    await login.mutateAsync(values).catch(() => null);
  }

  const errorMessage = login.error
    ? login.error instanceof ApiError && login.error.status === 401
      ? t.auth.login.errorInvalid
      : t.auth.login.errorGeneric
    : null;

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-xs sm:p-10">
      {/* Logo */}
      <div className="mb-8">
        <RonoLogo />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t.auth.login.tagline}
        </p>
      </div>

      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t.auth.login.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t.auth.login.subtitle}
        </p>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircleIcon className="size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>{t.auth.login.emailLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t.auth.login.emailPlaceholder}
                    autoComplete="email"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel>{t.auth.login.passwordLabel}</FormLabel>
                  <a
                    href="#"
                    className="text-xs font-medium text-primary transition-colors hover:underline"
                  >
                    {t.auth.login.forgotPassword}
                  </a>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={login.isPending}
            className="mt-2 h-11 w-full"
          >
            {login.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {t.auth.login.signingIn}
              </>
            ) : (
              t.auth.login.signIn
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t.auth.login.or}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.login.noAccount}{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          {t.auth.login.createOne}
        </Link>
      </p>
    </div>
  );
}
