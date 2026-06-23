"use client";

import { Sidebar, SidebarInner } from "@/components/dashboard/sidebar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "radix-ui";
import { useMe } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthGate({ children }: { children: React.ReactNode }) {
  useMe();
  const { isInitialized, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

function MobileSidebarSheet() {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const close = useSidebarStore((s) => s.close);

  return (
    <Sheet open={mobileOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="left"
        className="p-0 w-[260px] bg-sidebar flex flex-col"
      >
        <VisuallyHidden.Root>
          <SheetTitle>Navigation</SheetTitle>
        </VisuallyHidden.Root>
        <SidebarInner onNavClick={close} />
      </SheetContent>
    </Sheet>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex h-[100dvh] overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile slide-over drawer */}
        <MobileSidebarSheet />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* The mobile tab bar is fixed to the physical bottom (see
              MobileBottomNav), so the scroll area pads its height + the iOS
              home-indicator inset to keep the last content reachable. */}
          <main className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
          {/* Mobile bottom tab bar (position: fixed bottom-0) */}
          <MobileBottomNav />
        </div>
      </div>
    </AuthGate>
  );
}
