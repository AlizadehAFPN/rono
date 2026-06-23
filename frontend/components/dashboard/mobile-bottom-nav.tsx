"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  FolderTreeIcon,
  GraduationCapIcon,
  HomeIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { roleGte } from "@/lib/types/auth";
import { useI18n } from "@/lib/i18n/context";

type TabKey =
  | "overview"
  | "topics"
  | "questions"
  | "study"
  | "practice"
  | "progress";

interface Tab {
  href: string;
  labelKey: TabKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

// The bottom bar carries only primary destinations — Profile and Settings live
// in the slide-over drawer and the top-right user menu instead. Students study;
// staff author content, so each role gets its own set.
const STUDENT_TABS: Tab[] = [
  { href: "/dashboard", labelKey: "overview", icon: HomeIcon, exact: true },
  { href: "/dashboard/study", labelKey: "study", icon: SparklesIcon },
  { href: "/dashboard/practice", labelKey: "practice", icon: GraduationCapIcon },
  { href: "/dashboard/progress", labelKey: "progress", icon: TrendingUpIcon },
];

const STAFF_TABS: Tab[] = [
  { href: "/dashboard", labelKey: "overview", icon: HomeIcon, exact: true },
  { href: "/dashboard/topics", labelKey: "topics", icon: FolderTreeIcon },
  { href: "/dashboard/items", labelKey: "questions", icon: BookOpenIcon },
];

export function MobileBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const isStaff = role ? roleGte(role, "instructor") : false;

  const visibleTabs = isStaff ? STAFF_TABS : STUDENT_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex md:hidden border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      {visibleTabs.map(({ href, labelKey, icon: Icon, exact }) => {
        const label = t.dashNav.items[labelKey];
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isActive && "font-semibold",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
