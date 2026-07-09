"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserSyncStatus } from "./user-sync-context";

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

/**
 * Ensures an authenticated Clerk user has a Convex users row.
 * Retries are capped with backoff — never an unbounded loop.
 */
export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const { setStatus, retryNonce } = useUserSyncStatus();
  const attemptRef = useRef(0);
  const inFlightRef = useRef(false);
  const succeededRef = useRef(false);
  const lastRetryNonceRef = useRef(retryNonce);

  useEffect(() => {
    if (!isAuthenticated) {
      attemptRef.current = 0;
      succeededRef.current = false;
      inFlightRef.current = false;
      setStatus("idle");
      return;
    }

    // Manual retry starts a fresh attempt cycle.
    if (retryNonce !== lastRetryNonceRef.current) {
      lastRetryNonceRef.current = retryNonce;
      attemptRef.current = 0;
      succeededRef.current = false;
      inFlightRef.current = false;
    }

    if (succeededRef.current || inFlightRef.current) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (cancelled || succeededRef.current || inFlightRef.current) return;
      if (attemptRef.current >= MAX_RETRIES) {
        setStatus("failed");
        return;
      }

      inFlightRef.current = true;
      attemptRef.current += 1;
      setStatus("syncing");

      createOrUpdateUser()
        .then(() => {
          if (cancelled) return;
          succeededRef.current = true;
          inFlightRef.current = false;
          setStatus("ready");
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          inFlightRef.current = false;
          console.error("UserSync failed:", err);

          if (attemptRef.current < MAX_RETRIES) {
            const delay = RETRY_BASE_MS * 2 ** (attemptRef.current - 1);
            retryTimer = setTimeout(run, delay);
          } else {
            setStatus("failed");
          }
        });
    };

    run();

    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      // Allow a new effect run to start another attempt if deps change mid-flight.
      inFlightRef.current = false;
    };
  }, [isAuthenticated, createOrUpdateUser, retryNonce, setStatus]);

  return null;
}
