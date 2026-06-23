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
import { useSignup } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import { LogoMark } from "@/components/logo";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

type SignupFormValues = {
  full_name: string;
  email: string;
  password: string;
};

function SynapseLogo() {
  return (
    <div className="flex items-center justify-center gap-3 text-primary">
      <LogoMark className="size-9" />
      <span className="text-2xl font-bold tracking-tight text-foreground">
        Synapse
      </span>
    </div>
  );
}

export default function SignupPage() {
  const { t } = useI18n();
  const signup = useSignup();

  const signupSchema = useMemo(() => {
    const v = t.auth.signup.validation;
    return z.object({
      full_name: z.string().trim().min(1, { message: v.fullNameRequired }),
      email: z.string().email({ message: v.emailInvalid }),
      password: z.string().min(1, { message: v.passwordRequired }),
    });
  }, [t]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupFormValues) {
    await signup.mutateAsync(values).catch(() => null);
  }

  const errorMessage = signup.error
    ? signup.error instanceof ApiError && signup.error.status === 409
      ? t.auth.signup.errorConflict
      : signup.error instanceof ApiError && signup.error.status === 422
        ? t.auth.signup.errorValidation
        : t.auth.signup.errorGeneric
    : null;

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-xs sm:p-10">
      {/* Logo */}
      <div className="mb-8">
        <SynapseLogo />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t.auth.signup.tagline}
        </p>
      </div>

      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t.auth.signup.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t.auth.signup.subtitle}
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
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>{t.auth.signup.fullNameLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t.auth.signup.fullNamePlaceholder}
                    autoComplete="name"
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
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>{t.auth.signup.emailLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t.auth.signup.emailPlaceholder}
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
                <FormLabel>{t.auth.signup.passwordLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t.auth.signup.passwordPlaceholder}
                    autoComplete="new-password"
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
            disabled={signup.isPending}
            className="mt-2 h-11 w-full"
          >
            {signup.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {t.auth.signup.creating}
              </>
            ) : (
              t.auth.signup.createAccount
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t.auth.signup.or}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.signup.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          {t.auth.signup.signIn}
        </Link>
      </p>
    </div>
  );
}
