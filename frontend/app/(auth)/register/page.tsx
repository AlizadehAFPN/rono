"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";

type RegisterFormValues = {
  full_name: string;
  email: string;
  password: string;
  institution_name: string;
  institution_slug: string;
};

export default function RegisterPage() {
  const { t } = useI18n();
  const register = useRegister();

  const registerSchema = useMemo(() => {
    const v = t.auth.register.validation;
    return z.object({
      full_name: z.string().min(2, { message: v.fullNameMin }),
      email: z.string().email({ message: v.emailInvalid }),
      password: z
        .string()
        .min(8, { message: v.passwordMin })
        .regex(/[A-Z]/, { message: v.passwordUpper })
        .regex(/[a-z]/, { message: v.passwordLower })
        .regex(/[0-9]/, { message: v.passwordNumber }),
      institution_name: z.string().min(2, { message: v.institutionNameMin }),
      institution_slug: z
        .string()
        .min(2, { message: v.slugMin })
        .max(40, { message: v.slugMax })
        .regex(/^[a-z0-9-]+$/, { message: v.slugFormat }),
    });
  }, [t]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      institution_name: "",
      institution_slug: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    await register.mutateAsync(values).catch(() => null);
  }

  function handleInstitutionNameChange(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40);
    form.setValue("institution_slug", slug, { shouldValidate: true });
  }

  const errorMessage = register.error
    ? register.error instanceof ApiError && register.error.status === 409
      ? t.auth.register.errorConflict
      : register.error instanceof ApiError && register.error.status === 422
        ? t.auth.register.errorValidation
        : t.auth.register.errorGeneric
    : null;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {t.auth.register.title}
        </CardTitle>
        <CardDescription>{t.auth.register.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.register.fullNameLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.auth.register.fullNamePlaceholder}
                      autoComplete="name"
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
                <FormItem>
                  <FormLabel>{t.auth.register.emailLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t.auth.register.emailPlaceholder}
                      autoComplete="email"
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
                <FormItem>
                  <FormLabel>{t.auth.register.passwordLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t.auth.register.passwordHint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t.auth.register.institutionSection}
              </p>

              <FormField
                control={form.control}
                name="institution_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.auth.register.institutionNameLabel}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.auth.register.institutionNamePlaceholder}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleInstitutionNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.register.slugLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.auth.register.slugPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t.auth.register.slugHint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={register.isPending}
            >
              {register.isPending
                ? t.auth.register.creating
                : t.auth.register.createAccount}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t.auth.register.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.auth.register.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
