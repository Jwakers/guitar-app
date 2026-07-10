import type { Metadata } from "next";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "GTPL" },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-bold tracking-widest text-foreground">
            GTPL //
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="font-mono text-xs font-semibold tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                LOGIN
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="rounded-md font-mono text-xs font-bold tracking-widest" size="sm">
                START TRAINING
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
            <Button asChild className="rounded-md font-mono text-xs font-bold tracking-widest" size="sm">
              <Link href="/today">DASHBOARD</Link>
            </Button>
          </Show>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center md:py-32">
        <div className="flex max-w-[800px] flex-col items-center gap-8">
          <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            System Online
          </div>

          <h1 className="font-sans text-5xl font-bold tracking-tighter text-foreground sm:text-7xl">
            Train Guitar Like An <br className="hidden sm:block" />
            <span className="text-primary">Athlete.</span>
          </h1>

          <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
            Structured sessions, progressive overload, measurable performance,
            and adaptive programming for intermediate electric guitarists.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row mt-4">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg" className="rounded-md h-14 px-8 font-mono text-sm font-bold tracking-widest">
                  INITIATE PROGRAM
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild size="lg" className="rounded-md h-14 px-8 font-mono text-sm font-bold tracking-widest">
                <Link href="/today">RESUME TRAINING</Link>
              </Button>
            </Show>
            <Button asChild size="lg" variant="outline" className="rounded-md h-14 px-8 font-mono text-sm font-bold tracking-widest border-border hover:bg-secondary">
              <Link href="/about">SYSTEM SPECS</Link>
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid w-full max-w-5xl gap-6 pt-32 sm:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary/50">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="font-mono text-sm font-bold tracking-widest text-foreground">
              MEASURABLE DATA
            </h3>
            <p className="text-sm text-muted-foreground">
              Track BPM, cleanliness scores, and endurance duration. No vanity metrics, just pure performance data.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary/50">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="font-mono text-sm font-bold tracking-widest text-foreground">
              ADAPTIVE ENGINE
            </h3>
            <p className="text-sm text-muted-foreground">
              The engine dictates your daily session based on your weakest skills, recent performance, and goals.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary/50">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="font-mono text-sm font-bold tracking-widest text-foreground">
              PROGRESSIVE OVERLOAD
            </h3>
            <p className="text-sm text-muted-foreground">
              Scale rhythmic complexity, strings, and tempo over multi-week training blocks to ensure linear progression.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
