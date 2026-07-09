import { Nav } from "@/components/app-shell/nav";
import { OnboardingGuard } from "@/components/app-shell/onboarding-guard";
import { UserSync } from "@/components/app-shell/user-sync";
import { UserSyncProvider } from "@/components/app-shell/user-sync-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <UserSyncProvider>
        <UserSync />
        <OnboardingGuard>{children}</OnboardingGuard>
        <Nav />
      </UserSyncProvider>
    </div>
  );
}
