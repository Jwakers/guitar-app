"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Activity, AlertCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import type { WizardData } from "../onboarding-wizard";

interface CompletingStepProps {
  data: WizardData;
  skills: Doc<"skills">[];
}

export function CompletingStep({ data, skills }: CompletingStepProps) {
  const router = useRouter();
  const saveOnboardingAnswers = useMutation(api.onboarding.saveOnboardingAnswers);
  const [error, setError] = useState<string | null>(null);
  const hasFired = useRef(false);

  async function submit() {
    setError(null);
    hasFired.current = true;

    // Default any unrated skills to 3
    const skillRatingsArray = skills.map((skill) => ({
      skillId: skill._id as Id<"skills">,
      rating: data.skillRatings[skill._id] ?? 3,
    }));

    try {
      await saveOnboardingAnswers({
        profile: {
          experienceLevel: "intermediate",
          guitarType: "electric",
          primaryGoals: data.primaryGoals,
          focusSkills: data.focusSkillNames,
          availableDays: data.availableDays,
          defaultSessionLengthMinutes: data.defaultSessionLengthMinutes,
          preferredIntensity: data.preferredIntensity,
          dataTonePreference: data.dataTonePreference,
        },
        skillRatings: skillRatingsArray,
      });
      router.replace("/today");
    } catch (err) {
      hasFired.current = false;
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  useEffect(() => {
    if (!hasFired.current) {
      void submit();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-foreground">Setup failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button
          onClick={() => void submit()}
          className="rounded-lg font-mono text-xs font-bold tracking-widest"
        >
          TRY AGAIN
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
        <Activity className="h-7 w-7 animate-pulse text-primary" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-foreground">
          Building your programme...
        </h2>
        <p className="text-sm text-muted-foreground">
          Setting up your training profile. This only takes a moment.
        </p>
      </div>
    </div>
  );
}
