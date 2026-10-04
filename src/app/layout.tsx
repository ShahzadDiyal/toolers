import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { EstimateDrawer } from "@/components/estimate/EstimateDrawer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildCalc Pro — Free Contractor Estimating Calculators",
    template: "%s · BuildCalc Pro",
  },
  description:
    "Instant, free, client-side construction calculators and bid proposals. No logins, no monthly fees, no cloud — your numbers never leave your device.",
  keywords: [
    "construction calculator",
    "contractor estimate",
    "concrete calculator",
    "roofing calculator",
    "bid proposal",
  ],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <TooltipProvider delayDuration={300}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CommandPalette />
          <EstimateDrawer />
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: "#fafafa",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
