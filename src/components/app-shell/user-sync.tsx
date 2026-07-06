"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      createOrUpdateUser().catch((err) => {
        hasSynced.current = false;
        console.error(err);
      });
    }
  }, [isAuthenticated, createOrUpdateUser]);

  return null;
}
