import { SkillTargetView } from "@/components/progress/skill-target-view";

export const metadata = {
  title: "Skill Progress",
};

type PageProps = {
  params: Promise<{ skillTarget: string }>;
};

export default async function SkillTargetPage({ params }: PageProps) {
  const { skillTarget } = await params;
  const skillTargetKey = decodeURIComponent(skillTarget);

  return <SkillTargetView skillTargetKey={skillTargetKey} />;
}
