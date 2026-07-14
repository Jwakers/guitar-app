import { TabRenderer } from "@/components/tab-renderer/tab-renderer";
import type { TabData } from "@/lib/tabs/internal-schema";

type ExerciseDetailSectionsProps = {
  tabData: TabData;
  purpose: string;
  minimumCleanStandard: string;
  measurementInstructions: string;
  coachingNotes: string[];
  successCriteria?: string[];
  showSuccessCriteria?: boolean;
  /** Live playback tempo for the tab MIDI player (e.g. metronome BPM). */
  playbackBpm?: number;
};

export function ExerciseTabSection({
  tabData,
  playbackBpm,
}: {
  tabData: TabData;
  playbackBpm?: number;
}) {
  return (
    <section className="mb-8 px-4">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          TAB
        </h2>
        <TabRenderer tabData={tabData} playbackBpm={playbackBpm} />
      </div>
    </section>
  );
}

export function ExerciseDetailSections({
  tabData,
  purpose,
  minimumCleanStandard,
  measurementInstructions,
  coachingNotes,
  successCriteria,
  showSuccessCriteria = false,
  playbackBpm,
}: ExerciseDetailSectionsProps) {
  return (
    <>
      <ExerciseTabSection tabData={tabData} playbackBpm={playbackBpm} />

      <div className="mx-auto w-full max-w-2xl px-4">
        <section className="mb-6">
          <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            PURPOSE
          </h2>
          <p className="text-sm text-foreground">{purpose}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            MINIMUM CLEAN STANDARD
          </h2>
          <p className="text-sm text-foreground">{minimumCleanStandard}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            HOW TO MEASURE
          </h2>
          <p className="text-sm text-foreground">{measurementInstructions}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            COACHING NOTES
          </h2>
          <ul className="flex flex-col gap-1.5">
            {coachingNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="shrink-0 font-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {note}
              </li>
            ))}
          </ul>
        </section>

        {showSuccessCriteria && successCriteria && successCriteria.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SUCCESS CRITERIA
            </h2>
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
    </>
  );
}
