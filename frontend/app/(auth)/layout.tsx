import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoMark } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Brand ambiance — subtle primary glow, theme-aware (light & dark) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[140px]" />
      </div>

      {/* Brand — pinned top-right, links back to the marketing homepage */}
      <Link
        href="/"
        title="Rono"
        className="absolute top-4 end-4 z-20 flex items-center gap-2 rounded-lg px-2 py-1 transition-opacity hover:opacity-80"
      >
        <LogoMark className="size-6 text-primary" />
        <span className="text-base font-bold tracking-tight text-foreground">
          Rono
        </span>
      </Link>

      {/* Language switcher — opposite corner from the brand (flips with dir) */}
      <div className="absolute top-4 start-4 z-20">
        <LanguageSwitcher tone="surface" />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
