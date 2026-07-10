import { PracticePlayer } from "@/components/practice/practice-player";

type TrainPageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ replay?: string }>;
};

export default async function TrainPage({
  params,
  searchParams,
}: TrainPageProps) {
  const { sessionId } = await params;
  const { replay } = await searchParams;
  return (
    <PracticePlayer sessionId={sessionId} replay={replay === "1"} />
  );
}
