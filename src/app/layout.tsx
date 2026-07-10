import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import "@clerk/ui/themes/shadcn.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GTPL",
    template: "%s · GTPL",
  },
  description:
    "A data-driven guitar training platform for intermediate electric guitarists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        jetbrainsMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
