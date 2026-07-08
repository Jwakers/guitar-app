import { DrillList } from "@/components/drills/drill-list";

export const metadata = {
  title: "Drills — GTPL",
};

export default function DrillsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
          DRILLS
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tab rendering test view. Each drill opens at its own URL.
        </p>
      </div>
      <DrillList />
    </main>
  );
}
