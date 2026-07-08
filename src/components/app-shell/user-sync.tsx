"use client";

import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const hasSynced = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      createOrUpdateUser().catch((err) => {
        hasSynced.current = false;
        console.error("UserSync failed, will retry:", err);
        setRetryCount((n) => n + 1);
      });
    }
  }, [isAuthenticated, createOrUpdateUser, retryCount]);

  return null;
}
