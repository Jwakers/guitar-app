import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
        404
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 font-mono text-xs text-primary hover:underline"
      >
        ← Home
      </Link>
    </main>
  );
}
