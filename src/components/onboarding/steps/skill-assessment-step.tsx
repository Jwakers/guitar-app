import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";
import type { WizardData } from "../onboarding-wizard";
import { StepNav } from "./step-nav";

interface SkillAssessmentStepProps {
  data: WizardData;
  skills: Doc<"skills">[];
  skillsLoading: boolean;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Just starting",
  2: "Learning",
  3: "Getting there",
  4: "Solid",
  5: "Strong",
};

const CATEGORY_ORDER = [
  "picking",
  "fretting",
  "expression",
  "rhythm",
  "conditioning",
];

export function SkillAssessmentStep({
  data,
  skills,
  skillsLoading,
  onUpdate,
  onNext,
  onBack,
}: SkillAssessmentStepProps) {
  function setRating(skillId: string, rating: 1 | 2 | 3 | 4 | 5) {
    onUpdate({
      skillRatings: { ...data.skillRatings, [skillId]: rating },
    });
  }

  const ratedCount = Object.keys(data.skillRatings).length;
  const canProceed = ratedCount === skills.length && skills.length > 0;

  const skillsByCategory = skills.reduce<Record<string, Doc<"skills">[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {},
  );

  const orderedCategories = CATEGORY_ORDER.filter(
    (c) => skillsByCategory[c],
  );

  if (skillsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          LOADING SKILLS...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Rate your skills
        </h2>
        <p className="text-sm text-muted-foreground">
          Be honest — these drive your initial programming. You can update them
          any time.
        </p>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          {ratedCount} / {skills.length} RATED
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {orderedCategories.map((category) => (
          <div key={category} className="flex flex-col gap-3">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {category}
            </span>
            <div className="flex flex-col gap-3">
              {skillsByCategory[category].map((skill) => {
                const rating = data.skillRatings[skill._id];
                return (
                  <div
                    key={skill._id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {skill.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {skill.description}
                        </p>
                      </div>
                      {rating !== undefined && (
                        <span className="shrink-0 font-mono text-[10px] tracking-widest text-primary">
                          {RATING_LABELS[rating]}
                        </span>
                      )}
                    </div>
                    <RatingPicker
                      value={rating}
                      onChange={(r) => setRating(skill._id, r)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canProceed}
        nextLabel="COMPLETE SETUP"
      />
    </div>
  );
}

const RATINGS = [1, 2, 3, 4, 5] as const;

function RatingPicker({
  value,
  onChange,
}: {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (rating: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-2">
      {RATINGS.map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "flex flex-1 items-center justify-center rounded py-2 transition-colors",
            value !== undefined && n <= value
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          <span className="font-mono text-xs font-bold">{n}</span>
        </button>
      ))}
    </div>
  );
}
