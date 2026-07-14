"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

const inputClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

/**
 * Collapsible super-user admin notes panel (collapsed by default).
 * Shows a count badge next to the title when notes exist.
 */
export function SuperUserAdminNotesPanel({
  exerciseId,
}: {
  exerciseId: Id<"exercises">;
}) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const isSuperUser = user?.isSuperUser === true;

  const notes = useQuery(
    api.exercises.getExerciseAdminNotes,
    isSuperUser ? { id: exerciseId } : "skip",
  );

  const addNote = useMutation(api.exercises.addExerciseAdminNote);
  const removeNote = useMutation(api.exercises.removeExerciseAdminNote);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSuperUser || notes === undefined) {
    return null;
  }

  const handleAdd = async () => {
    const trimmed = draft.trim();
    if (trimmed === "") return;

    setSaving(true);
    setError(null);
    try {
      await addNote({ id: exerciseId, note: trimmed });
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (index: number) => {
    setError(null);
    try {
      await removeNote({ id: exerciseId, index });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove note");
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400">
              ADMIN NOTES
            </p>
            {notes.length > 0 && (
              <span
                className="inline-flex size-5 items-center justify-center rounded-full bg-amber-500 font-mono text-[10px] font-bold text-amber-950"
                aria-label={`${notes.length} admin notes`}
              >
                {notes.length > 99 ? "99+" : notes.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {open
              ? "Hide notes"
              : notes.length > 0
                ? "Internal review notes"
                : "Add review notes"}
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-amber-500/20 px-4 py-4">
          <p className="font-mono text-[10px] text-muted-foreground">
            Internal review only — not shown to users
          </p>

          {notes.length > 0 && (
            <ul className="flex flex-col gap-2">
              {notes.map((note, index) => (
                <li
                  key={`${index}-${note.slice(0, 24)}`}
                  className="flex gap-3 rounded-md border border-amber-500/20 bg-background/60 px-3 py-2"
                >
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-foreground">
                    {note}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => void handleRemove(index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <textarea
              className={`${inputClassName} min-h-16 flex-1 resize-y`}
              placeholder="Add an admin note…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              disabled={saving || draft.trim() === ""}
              onClick={() => void handleAdd()}
            >
              {saving ? "Adding…" : "Add note"}
            </Button>
          </div>

          {error && (
            <p className="font-mono text-sm text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
