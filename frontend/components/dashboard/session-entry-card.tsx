"use client";

import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * A tappable row that opens a session sub-view stacked within the same screen.
 * Used on Progress / Profile (recent learning sessions) and Settings (active
 * devices) so the session lists live on their own internal screen rather than
 * inline — without leaving the parent route.
 */
export function SessionEntryCard({
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{title}</div>
              <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
            </div>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </button>
  );
}
