import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { baseUrl } from "./sitemap";
import { ogUrl, personLd, websiteLd } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UmamiAnalytics from "@/components/Umami";
import NoScript from "@/components/NoScript";
import { cardHand, cardSticker, cardMono } from "@/lib/card/fonts";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
});
const KeyboardShortcuts = dynamic(
  () => import("@/components/KeyboardShortcuts"),
  { ssr: false }
);

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * The mono face is declared once, in lib/card/fonts.ts, and reused here as
 * cardMono so the visitor-card canvas and the rest of the site share a
 * single self-hosted IBM Plex Mono rather than shipping it twice. See that
 * file for the full reasoning.
 */
const plexMono = cardMono;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Manthan Gour — Software Engineer",
    template: "%s | Manthan Gour",
  },
  description:
    "Frontend-heavy software engineer working with React, Next.js, TypeScript and modern full-stack systems.",
  authors: [{ name: "Manthan Gour" }],
  openGraph: {
    title: "Manthan Gour — Software Engineer",
    description:
      "Frontend-heavy software engineer working with React, Next.js, TypeScript and modern full-stack systems.",
    url: baseUrl,
    siteName: "Manthan Gour",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogUrl({
          title: "Manthan Gour",
          subtitle: "Software Engineer · Frontend · Full Stack",
          type: "home",
        }),
        width: 1200,
        height: 630,
        alt: "Manthan Gour, Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manthan Gour — Software Engineer",
    description:
      "Frontend-heavy software engineer working with React, Next.js, TypeScript and modern full-stack systems.",
    images: [
      ogUrl({
        title: "Manthan Gour",
        subtitle: "Software Engineer · Frontend · Full Stack",
        type: "home",
      }),
    ],
  },
  icons: {
    /**
     * Raster only, and no SVG at all.
     *
     * The generator's favicon.svg is a 128KB PNG in an SVG wrapper rather than
     * real vector, so it is a bitmap either way. Declaring it as a fallback did
     * not make it a fallback: Firefox prefers an SVG icon whenever one is
     * offered, regardless of the sizes on the other candidates, so the 128KB
     * file was what a tab actually fetched and the PNGs were the thing going
     * unused. The file is deleted rather than left undeclared, since nothing
     * else references it.
     *
     * `mask-icon` is gone for the same underlying reason. Safari's pinned-tab
     * icon must be a single-colour vector with a real path, and it renders a
     * wrapped raster as a solid black square. Both entries come back the day
     * there is a genuine vector of the mark to point them at.
     */
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var dark=t==="dark"||(t===null&&d);document.documentElement.classList.toggle("dark",dark);})();`,
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personLd(), websiteLd()]) }}
        />
      </head>
      <body
        className={`bg-background text-foreground border-border ${dmSans.variable} ${plexMono.variable} ${cardHand.variable} ${cardSticker.variable} font-sans`}
      >
        <NoScript />
        <MotionConfig reducedMotion="user">
          <div className="relative z-10">
            <TooltipProvider delayDuration={150} skipDelayDuration={0}>
              <Navbar />
              {children}
              <CommandPalette />
              <KeyboardShortcuts />
            </TooltipProvider>
            <Analytics />
            <UmamiAnalytics />
          </div>
          <Footer />
        </MotionConfig>
      </body>
    </html>
  );
}
