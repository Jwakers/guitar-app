"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserSyncStatus } from "./user-sync-context";

/**
 * Blocks app content until the Convex user row exists, then redirects
 * incomplete onboarding. Prevents a flash of unguarded UI while UserSync runs.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { status: syncStatus, retry } = useUserSyncStatus();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  const waitingForAuth = authLoading;
  // Treat both undefined (query loading) and null (no row yet) as blocked.
  const waitingForUserQuery =
    isAuthenticated && user == null && syncStatus !== "failed";
  const waitingForSync =
    isAuthenticated &&
    user == null &&
    syncStatus !== "failed" &&
    syncStatus !== "ready";
  // Sync reported ready but query still null/undefined briefly — keep waiting.
  const waitingForQueryAfterSync =
    isAuthenticated && user == null && syncStatus === "ready";

  const needsOnboarding =
    user !== undefined && user !== null && !user.onboardingCompleted;

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, pathname, router]);

  if (
    waitingForAuth ||
    waitingForUserQuery ||
    waitingForSync ||
    waitingForQueryAfterSync
  ) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isAuthenticated && syncStatus === "failed" && user == null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-mono text-sm text-muted-foreground">
          Couldn&apos;t load your account. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="font-mono text-sm underline underline-offset-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (needsOnboarding && pathname !== "/onboarding") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
