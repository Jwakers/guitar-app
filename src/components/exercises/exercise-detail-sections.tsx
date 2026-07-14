import { TabRenderer } from "@/components/tab-renderer/tab-renderer";
import { SuperUserAdminNotesPanel } from "@/components/exercises/super-user-admin-notes-panel";
import {
  SuperUserExerciseMetadataEditor,
  type EditableExercise,
} from "@/components/exercises/super-user-exercise-metadata-editor";

type ExerciseDetailSectionsProps = {
  exercise: EditableExercise;
  purpose: string;
  minimumCleanStandard: string;
  measurementInstructions: string;
  coachingNotes: string[];
  successCriteria?: string[];
  showSuccessCriteria?: boolean;
  /** Live playback tempo for the tab MIDI player (e.g. metronome BPM). */
  playbackBpm?: number;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

function CoachingNotesPanel({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <section>
      <SectionLabel>COACHING NOTES</SectionLabel>
      <ul className="flex flex-col gap-1.5">
        {notes.map((note, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <span className="shrink-0 font-mono text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExerciseTabSection({
  exercise,
  playbackBpm,
}: {
  exercise: EditableExercise;
  playbackBpm?: number;
}) {
  return (
    <section>
      <SectionLabel>TAB</SectionLabel>
      <TabRenderer tabData={exercise.tabData} playbackBpm={playbackBpm} />
      <SuperUserAdminNotesPanel exerciseId={exercise._id} />
      <SuperUserExerciseMetadataEditor exercise={exercise} />
    </section>
  );
}

export function ExerciseDetailSections({
  exercise,
  purpose,
  minimumCleanStandard,
  measurementInstructions,
  coachingNotes,
  successCriteria,
  showSuccessCriteria = false,
  playbackBpm,
}: ExerciseDetailSectionsProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8">
      <section className="mb-8 max-w-2xl">
        <SectionLabel>PURPOSE</SectionLabel>
        <p className="text-sm text-foreground">{purpose}</p>
      </section>

      {/*
        Mobile DOM/flex order: tab → coaching → standards.
        Desktop grid: tab | sticky coaching; standards under tab.
      */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-8 lg:gap-y-6">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <ExerciseTabSection exercise={exercise} playbackBpm={playbackBpm} />
        </div>

        {coachingNotes.length > 0 && (
          <aside className="order-2 border-l border-border/60 pl-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <CoachingNotesPanel notes={coachingNotes} />
          </aside>
        )}

        <div className="order-3 max-w-2xl space-y-6 lg:col-start-1 lg:row-start-2">
          <section>
            <SectionLabel>MINIMUM CLEAN STANDARD</SectionLabel>
            <p className="text-sm text-foreground">{minimumCleanStandard}</p>
          </section>

          <section>
            <SectionLabel>HOW TO MEASURE</SectionLabel>
            <p className="text-sm text-foreground">{measurementInstructions}</p>
          </section>

          {showSuccessCriteria &&
            successCriteria &&
            successCriteria.length > 0 && (
              <section>
                <SectionLabel>SUCCESS CRITERIA</SectionLabel>
                <ul className="flex flex-col gap-1.5">
                  {successCriteria.map((criterion, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="shrink-0 text-primary">✓</span>
                      {criterion}
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}
