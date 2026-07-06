"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, TrendingUp, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Today", href: "/today", icon: CalendarCheck },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Training", href: "/training", icon: Dumbbell },
  { label: "Profile", href: "/profile", icon: User },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-border bg-background/90 backdrop-blur-md">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
