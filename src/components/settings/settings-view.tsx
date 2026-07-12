"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SESSION_LENGTHS = [30, 45, 60, 90] as const;

const INTENSITIES = [
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
] as const;

const SESSIONS_PER_WEEK = [3, 4, 5, 6, 7] as const;

export function SettingsView() {
  const settings = useQuery(api.settings.getProfileSettings);
  const updateSettings = useMutation(api.settings.updateProfileSettings);

  const [sessionLength, setSessionLength] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<string | null>(null);
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLength = sessionLength ?? settings?.defaultSessionLengthMinutes;
  const currentIntensity = intensity ?? settings?.preferredIntensity;
  const currentSessionsPerWeek =
    sessionsPerWeek ?? settings?.sessionsPerWeek ?? 7;

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateSettings({
        defaultSessionLengthMinutes: currentLength,
        preferredIntensity: currentIntensity,
        sessionsPerWeek: currentSessionsPerWeek,
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  if (settings === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (settings === null) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            Complete onboarding to configure practice preferences.
          </p>
          <Button asChild className="mt-4">
            <Link href="/onboarding">Go to onboarding</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          PREFERENCES
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Adjust session defaults. Practice is always available — these guide
          targets, not gates.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <section>
            <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SESSIONS PER WEEK (CONSISTENCY TARGET)
            </label>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SESSIONS_PER_WEEK.map((count) => {
                const selected = currentSessionsPerWeek === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSessionsPerWeek(count)}
                    className={cn(
                      "rounded-lg border py-3 font-mono text-sm font-bold transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              DEFAULT SESSION LENGTH
            </label>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {SESSION_LENGTHS.map((mins) => {
                const selected = currentLength === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSessionLength(mins)}
                    className={cn(
                      "rounded-lg border py-3 font-mono text-sm font-bold transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              PREFERRED INTENSITY
            </label>
            <div className="mt-3 flex flex-col gap-2">
              {INTENSITIES.map((opt) => {
                const selected = currentIntensity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntensity(opt.value)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left font-mono text-xs font-bold tracking-widest transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {message && (
          <p className="mt-6 font-mono text-sm text-primary">{message}</p>
        )}
        {error && (
          <p className="mt-6 font-mono text-sm text-destructive">{error}</p>
        )}

        <div className="mt-8 flex gap-3">
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile">Back to profile</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
