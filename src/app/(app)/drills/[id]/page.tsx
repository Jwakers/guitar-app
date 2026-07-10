import { DrillView } from "@/components/drills/drill-view";

export const metadata = {
  title: "Drill",
};

export default async function DrillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DrillView id={id} />;
}
