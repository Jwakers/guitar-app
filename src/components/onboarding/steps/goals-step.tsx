import { cn } from "@/lib/utils";
import type {
  CoreSkillOption,
  SubSkillOption,
  WizardData,
} from "../onboarding-wizard";
import { StepNav } from "./step-nav";

interface GoalsStepProps {
  data: WizardData;
  coreSkills: CoreSkillOption[];
  subSkills: SubSkillOption[];
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRIMARY_GOALS = [
  "Build cleaner technique",
  "Increase picking speed",
  "Improve rhythm and timing",
  "Master lead techniques (bends, vibrato)",
  "Get chord changes smoother",
  "Build playing endurance",
];

const MAX_GOALS = 3;
const MIN_FOCUS_SKILLS = 2;
const MAX_FOCUS_SKILLS = 4;

export function GoalsStep({
  data,
  coreSkills,
  subSkills,
  onUpdate,
  onNext,
  onBack,
}: GoalsStepProps) {
  function toggleGoal(goal: string) {
    const current = data.primaryGoals;
    if (current.includes(goal)) {
      onUpdate({ primaryGoals: current.filter((g) => g !== goal) });
    } else if (current.length < MAX_GOALS) {
      onUpdate({ primaryGoals: [...current, goal] });
    }
  }

  function toggleSubSkill(skill: SubSkillOption) {
    const current = data.focusSubSkillIds;
    if (current.includes(skill.id)) {
      const nextSubSkillIds = current.filter((id) => id !== skill.id);
      const nextCoreSkillIds = data.focusCoreSkillIds.filter((coreSkillId) =>
        nextSubSkillIds.some((subSkillId) => {
          const subSkill = subSkills.find((item) => item.id === subSkillId);
          return subSkill?.coreSkillId === coreSkillId;
        }),
      );
      onUpdate({
        focusSubSkillIds: nextSubSkillIds,
        focusCoreSkillIds: nextCoreSkillIds,
      });
    } else if (current.length < MAX_FOCUS_SKILLS) {
      onUpdate({
        focusSubSkillIds: [...current, skill.id],
        focusCoreSkillIds: data.focusCoreSkillIds.includes(skill.coreSkillId)
          ? data.focusCoreSkillIds
          : [...data.focusCoreSkillIds, skill.coreSkillId],
      });
    }
  }

  const canProceed =
    data.primaryGoals.length >= 1 &&
    data.focusSubSkillIds.length >= MIN_FOCUS_SKILLS;

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Your goals
        </h2>
        <p className="text-sm text-muted-foreground">
          What do you most want to improve? Pick up to {MAX_GOALS}.
        </p>
      </div>

      {/* Primary goals */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          PRIMARY GOALS ({data.primaryGoals.length}/{MAX_GOALS})
        </label>
        <div className="flex flex-col gap-2">
          {PRIMARY_GOALS.map((goal) => {
            const selected = data.primaryGoals.includes(goal);
            const maxed = !selected && data.primaryGoals.length >= MAX_GOALS;
            return (
              <button
                type="button"
                key={goal}
                onClick={() => toggleGoal(goal)}
                disabled={maxed}
                aria-pressed={selected}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : maxed
                      ? "cursor-not-allowed border-border bg-muted/20 text-muted-foreground/50"
                      : "border-border bg-card text-foreground hover:border-border/60 hover:bg-muted/50",
                )}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus skills */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          FOCUS SUB-SKILLS — pick {MIN_FOCUS_SKILLS}–{MAX_FOCUS_SKILLS} (
          {data.focusSubSkillIds.length} selected)
        </label>
        <p className="text-xs text-muted-foreground">
          These will receive the most training time.
        </p>
        <div className="flex flex-col gap-4 pt-1">
          {coreSkills.map((coreSkill) => {
            const coreSubSkills = subSkills.filter(
              (skill) => skill.coreSkillId === coreSkill.id,
            );
            if (coreSubSkills.length === 0) return null;
            return (
            <div key={coreSkill.id} className="flex flex-col gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {coreSkill.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {coreSubSkills.map((skill) => {
                  const selected = data.focusSubSkillIds.includes(skill.id);
                  const maxed =
                    !selected &&
                    data.focusSubSkillIds.length >= MAX_FOCUS_SKILLS;
                  return (
                    <button
                      type="button"
                      key={skill.id}
                      onClick={() => toggleSubSkill(skill)}
                      disabled={maxed}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border px-3 py-1.5 font-mono text-xs font-semibold transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : maxed
                            ? "cursor-not-allowed border-border/40 bg-muted/10 text-muted-foreground/30"
                            : "border-border bg-card text-foreground hover:border-border/60 hover:bg-muted/50",
                      )}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
          })}
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  );
}
