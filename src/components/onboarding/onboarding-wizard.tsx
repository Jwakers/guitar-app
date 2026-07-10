"use client";

import { useState } from "react";
import {
  CORE_SKILL_DEFINITIONS,
  CORE_SKILLS,
  SUB_SKILL_DEFINITIONS,
  SUB_SKILLS,
  type CoreSkill,
  type SubSkill,
} from "@/lib/skills/taxonomy";
import { WelcomeStep } from "./steps/welcome-step";
import { AboutYouStep } from "./steps/about-you-step";
import { GoalsStep } from "./steps/goals-step";
import { ScheduleStep } from "./steps/schedule-step";
import { SkillAssessmentStep } from "./steps/skill-assessment-step";
import { CompletingStep } from "./steps/completing-step";

export type FocusSubSkillSelection = {
  subSkillId: SubSkill;
  coreSkillId: CoreSkill;
};

export type WizardData = {
  dataTonePreference: string;
  primaryGoals: string[];
  focusCoreSkillIds: CoreSkill[];
  focusSubSkillIds: SubSkill[];
  focusSubSkillSelections: FocusSubSkillSelection[];
  availableDays: string[];
  defaultSessionLengthMinutes: number;
  preferredIntensity: string;
  skillRatings: Record<string, 1 | 2 | 3 | 4 | 5>; // core:{id} → 1–5
};

export type CoreSkillOption = {
  id: CoreSkill;
  name: string;
  description: string;
  sortOrder: number;
};

export type SubSkillOption = {
  id: SubSkill;
  primaryCoreSkillId: CoreSkill;
  name: string;
  description: string;
  sortOrder: number;
};

const DEFAULT_DATA: WizardData = {
  dataTonePreference: "factual",
  primaryGoals: [],
  focusCoreSkillIds: [],
  focusSubSkillIds: [],
  focusSubSkillSelections: [],
  availableDays: ["Monday", "Wednesday", "Friday"],
  defaultSessionLengthMinutes: 45,
  preferredIntensity: "moderate",
  skillRatings: {},
};

const STEPS = [
  "welcome",
  "about-you",
  "goals",
  "schedule",
  "skill-assessment",
  "completing",
] as const;

type Step = (typeof STEPS)[number];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);

  const coreSkills: CoreSkillOption[] = CORE_SKILLS.map((id) => {
    const skill = CORE_SKILL_DEFINITIONS[id];
    return {
      id,
      name: skill.label,
      description: skill.description,
      sortOrder: skill.sortOrder,
    };
  });
  const subSkills: SubSkillOption[] = SUB_SKILLS.map((id) => {
    const skill = SUB_SKILL_DEFINITIONS[id];
    return {
      id,
      primaryCoreSkillId: skill.primaryCoreSkillId,
      name: skill.label,
      description: skill.description,
      sortOrder: skill.sortOrder,
    };
  });

  function update(updates: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function next() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }

  function back() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }

  const stepIndex = STEPS.indexOf(currentStep);
  // Steps 1–4 show a progress indicator (About You → Skill Assessment = steps 1–4)
  const showProgress = stepIndex >= 1 && stepIndex <= 4;
  const progressStep = stepIndex; // 1-indexed for display
  const totalProgressSteps = 4;

  return (
    <div className="flex min-h-screen flex-col">
      {showProgress && (
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            GTPL //
          </span>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            STEP {progressStep} OF {totalProgressSteps}
          </span>
        </header>
      )}

      <div className="flex flex-1 flex-col">
        {currentStep === "welcome" && (
          <WelcomeStep onNext={next} />
        )}
        {currentStep === "about-you" && (
          <AboutYouStep data={data} onUpdate={update} onNext={next} onBack={back} />
        )}
        {currentStep === "goals" && (
          <GoalsStep
            data={data}
            coreSkills={coreSkills}
            subSkills={subSkills}
            onUpdate={update}
            onNext={next}
            onBack={back}
          />
        )}
        {currentStep === "schedule" && (
          <ScheduleStep data={data} onUpdate={update} onNext={next} onBack={back} />
        )}
        {currentStep === "skill-assessment" && (
          <SkillAssessmentStep
            data={data}
            coreSkills={coreSkills}
            onUpdate={update}
            onNext={next}
            onBack={back}
          />
        )}
        {currentStep === "completing" && (
          <CompletingStep data={data} coreSkills={coreSkills} />
        )}
      </div>
    </div>
  );
}
