"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserSyncStatus = "idle" | "syncing" | "ready" | "failed";

type UserSyncContextValue = {
  status: UserSyncStatus;
  setStatus: (status: UserSyncStatus) => void;
  retry: () => void;
  retryNonce: number;
};

const UserSyncContext = createContext<UserSyncContextValue | null>(null);

export function UserSyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<UserSyncStatus>("idle");
  const [retryNonce, setRetryNonce] = useState(0);

  const retry = useCallback(() => {
    setStatus("idle");
    setRetryNonce((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ status, setStatus, retry, retryNonce }),
    [status, retry, retryNonce],
  );

  return (
    <UserSyncContext.Provider value={value}>{children}</UserSyncContext.Provider>
  );
}

export function useUserSyncStatus() {
  const ctx = useContext(UserSyncContext);
  if (!ctx) {
    throw new Error("useUserSyncStatus must be used within UserSyncProvider");
  }
  return ctx;
}
