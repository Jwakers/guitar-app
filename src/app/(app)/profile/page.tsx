import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          ACCOUNT
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your practice preferences and account settings.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          View the full drill library and open any drill.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/settings">Practice settings</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/settings/subscription">Subscription</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/drills">Browse drills</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
