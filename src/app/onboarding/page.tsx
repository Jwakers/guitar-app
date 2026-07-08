import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Setup — GTPL",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard />
    </div>
  );
}
