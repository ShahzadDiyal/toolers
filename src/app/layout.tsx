import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { EstimateDrawer } from "@/components/estimate/EstimateDrawer";
import { GlobalReveal } from "@/components/ui/Reveal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { JsonLd, websiteSchema, appSchema } from "@/components/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} Free Contractor Estimating Calculators`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_TAGLINE + " No logins, no monthly fees, no cloud your numbers never leave your device.",
  keywords: [
    "construction calculator",
    "contractor estimate",
    "concrete calculator",
    "roofing calculator",
    "stair calculator",
    "bid proposal",
    "material takeoff",
    "rebar calculator",
    "tile calculator",
    "paint calculator",
  ],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} Free Contractor Estimating Calculators`,
    description: SITE_TAGLINE,
    url: SITE_URL,
    images: [{ url: "/icon.svg", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} Free Contractor Estimating Calculators`,
    description: SITE_TAGLINE,
    images: ["/icon.svg"],
  },
  alternates: { canonical: SITE_URL },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#14284A",
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        <JsonLd data={[websiteSchema(), appSchema()]} />
        <TooltipProvider delayDuration={300}>
          <Navbar />
          <GlobalReveal>
            <main className="flex-1">{children}</main>
          </GlobalReveal>
          <Footer />
          <CommandMenu />
          <EstimateDrawer />
          <Toaster
            theme="light"
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid #d8e1ef",
                color: "#0b1b33",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
