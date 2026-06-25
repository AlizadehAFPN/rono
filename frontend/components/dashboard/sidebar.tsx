"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  BookOpenIcon,
  CalendarCheckIcon,
  FolderTreeIcon,
  GraduationCapIcon,
  SparklesIcon,
  TrendingUpIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  DownloadIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";
import { useLogout } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { roleGte, type Role } from "@/lib/types/auth";
import { useI18n } from "@/lib/i18n/context";
import { LogoMark } from "@/components/logo";

type NavKey =
  | "overview"
  | "topics"
  | "questions"
  | "study"
  | "daily"
  | "practice"
  | "progress"
  | "analytics"
  | "users"
  | "settings"
  | "profile";

export const NAV: {
  href: string;
  labelKey: NavKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  // Content-authoring surfaces — hidden from students (instructor or higher).
  staffOnly?: boolean;
}[] = [
  { href: "/dashboard", labelKey: "overview", icon: HomeIcon, exact: true },
  { href: "/dashboard/topics", labelKey: "topics", icon: FolderTreeIcon, staffOnly: true },
  { href: "/dashboard/items", labelKey: "questions", icon: BookOpenIcon, staffOnly: true },
  { href: "/dashboard/study", labelKey: "study", icon: SparklesIcon },
  { href: "/dashboard/daily", labelKey: "daily", icon: CalendarCheckIcon },
  { href: "/dashboard/practice", labelKey: "practice", icon: GraduationCapIcon },
  { href: "/dashboard/progress", labelKey: "progress", icon: TrendingUpIcon },
];

export const ADMIN_NAV: {
  href: string;
  labelKey: NavKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [{ href: "/dashboard/users", labelKey: "users", icon: UsersIcon }];

// Account surfaces every role can reach — their own profile and preferences.
export const ACCOUNT_NAV: {
  href: string;
  labelKey: NavKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { href: "/dashboard/profile", labelKey: "profile", icon: UserIcon },
  { href: "/dashboard/settings", labelKey: "settings", icon: SettingsIcon },
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact = false,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-100",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-normal",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-opacity",
          isActive ? "opacity-100" : "opacity-50 group-hover:opacity-70",
        )}
      />
      {label}
    </Link>
  );
}

export function SidebarInner({ onNavClick }: { onNavClick?: () => void }) {
  const { t } = useI18n();
  const logout = useLogout();
  const { canInstall, install } = usePwaInstall();
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const isAdmin = role ? roleGte(role, "institution_admin") : false;
  const isStaff = role ? roleGte(role, "instructor") : false;
  const roleLabel = role ? t.common.roles[role as Role] ?? role : null;

  return (
    <>
      {/* ── Logo ── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <LogoMark className="size-7 shrink-0 text-sidebar-primary" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
            Rono
          </span>
          {isAdmin && (
            <span className="rounded bg-sidebar-primary px-1.5 py-px text-[9px] font-bold uppercase tracking-widest text-sidebar-primary-foreground opacity-80">
              {t.dashNav.adminBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-0.5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {t.dashNav.workspace}
          </p>
          {NAV.filter((item) => !item.staffOnly || isStaff).map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={t.dashNav.items[item.labelKey]}
              icon={item.icon}
              exact={item.exact}
              onClick={onNavClick}
            />
          ))}

          {isStaff && (
            <NavItem
              href="/dashboard/analytics"
              label={t.dashNav.items.analytics}
              icon={BarChart3Icon}
              onClick={onNavClick}
            />
          )}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-border/60" />
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {t.dashNav.administration}
              </p>
              {ADMIN_NAV.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={t.dashNav.items[item.labelKey]}
                  icon={item.icon}
                  exact={item.exact}
                  onClick={onNavClick}
                />
              ))}
            </>
          )}

          {/* Account — available to every role */}
          <div className="my-3 h-px bg-border/60" />
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {t.dashNav.account}
          </p>
          {ACCOUNT_NAV.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={t.dashNav.items[item.labelKey]}
              icon={item.icon}
              exact={item.exact}
              onClick={onNavClick}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* ── Install app (Android / Chromium only — iOS gets the manual hint) ── */}
      {canInstall && (
        <div className="shrink-0 border-t px-3 pt-3">
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            className="flex w-full items-center gap-3 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-medium text-sidebar-primary-foreground transition-opacity hover:opacity-90"
          >
            <DownloadIcon className="size-4 shrink-0" />
            {t.dashNav.installApp}
          </button>
        </div>
      )}

      {/* ── User section ── */}
      <div className="shrink-0 border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Link
            href="/dashboard/profile"
            onClick={onNavClick}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md transition-opacity hover:opacity-80"
            title={t.dashNav.items.profile}
          >
            <Avatar className="size-7 shrink-0">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px] font-semibold">
                {getInitials(user?.full_name ?? null)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium leading-tight text-sidebar-foreground">
                {user?.preferred_name ?? user?.full_name ?? user?.email}
              </p>
              {roleLabel && (
                <p className="truncate text-[10px] leading-tight text-muted-foreground mt-0.5">
                  {roleLabel}
                </p>
              )}
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            title={t.dashNav.signOut}
            className="shrink-0 text-muted-foreground/50 hover:text-foreground"
          >
            <LogOutIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const close = useSidebarStore((s) => s.close);

  return (
    <aside className="hidden md:flex h-full w-60 flex-col border-e bg-sidebar">
      <SidebarInner onNavClick={close} />
    </aside>
  );
}
