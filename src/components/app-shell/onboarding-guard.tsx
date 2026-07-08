"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function OnboardingGuard() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    // user === undefined → still loading, do nothing
    // user === null → no record yet (UserSync hasn't fired), do nothing
    if (user !== undefined && user !== null && !user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  return null;
}
