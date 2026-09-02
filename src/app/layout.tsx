import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/portfoliolatest";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: profile.title,
    template: `%s · ${profile.name}`,
  },
  description: profile.bio,
  keywords: [
    "Manthan Gour",
    "Frontend Engineer",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Software Engineer",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: profile.title,
    description: profile.bio,
    siteName: profile.name,
    images: [
      {
        url: `${basePath}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: `${profile.name} — Frontend & Full-Stack Engineer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: profile.title,
    description: profile.bio,
    images: [`${basePath}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "Frontend & Full-Stack Engineer",
  url: siteUrl,
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "JavaScript", "Node.js"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jaipur",
    addressCountry: "IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="focus-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
