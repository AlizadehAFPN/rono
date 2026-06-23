"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { type Role } from "@/lib/types/auth";
import {
  ArrowLeftIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  title,
  backHref,
  onBack,
  backLabel,
}: {
  title?: string;
  /** When set, renders a back arrow linking to this route before the title. */
  backHref?: string;
  /** When set, renders a back arrow that calls this instead of navigating —
   *  used to pop an internal sub-view stacked within the same screen. */
  onBack?: () => void;
  backLabel?: string;
}) {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const logout = useLogout();
  const openSidebar = useSidebarStore((s) => s.open);

  const roleLabel = role ? t.common.roles[role as Role] ?? role : null;
  const displayName =
    user?.preferred_name ?? user?.full_name?.split(" ")[0] ?? null;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={openSidebar}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
          aria-label={t.dashNav.openMenu}
        >
          <MenuIcon className="size-5" />
        </button>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel ?? t.dashNav.back}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4.5" />
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel ?? t.dashNav.back}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4.5" />
          </Link>
        ) : null}

        {title ? (
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        ) : (
          <div />
        )}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher tone="surface" />

        {displayName && (
          <span className="hidden text-xs text-muted-foreground sm:block">
            {displayName}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-7 ring-2 ring-border">
                <AvatarImage src={user?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px] font-semibold">
                  {getInitials(user?.full_name ?? null)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
              <span className="font-semibold">
                {user?.full_name ?? user?.email}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
              {roleLabel && (
                <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                  {roleLabel}
                </Badge>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon />
                {t.dashNav.profile}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <SettingsIcon />
                {t.dashNav.items.settings}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout.mutate()}
            >
              <LogOutIcon />
              {t.dashNav.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </header>
  );
}
