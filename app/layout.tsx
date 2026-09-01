import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";
import JsonLd from "@/components/JsonLd";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { isProductionSite } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Site-wide defaults. Route segments override `title` through the template and
 * supply their own description and canonical via `buildMetadata`.
 *
 * `metadataBase` is what makes the relative image and canonical paths below
 * resolve to absolute URLs. Without it Next emits a build warning and social
 * scrapers, which do not resolve relative OpenGraph URLs, get nothing.
 */
export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Bangladesh Blood Bank — Find Verified Blood Donors, Free",
    // "%s" is the page title; the suffix keeps brand recognition in the SERP
    // without eating the 60-character budget on every page.
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  category: "health",
  alternates: { canonical: absoluteUrl() },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    // Preview deployments serve the same content on a throwaway hostname.
    index: isProductionSite(),
    follow: isProductionSite(),
    googleBot: {
      index: isProductionSite(),
      follow: isProductionSite(),
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: absoluteUrl(),
    title: "Bangladesh Blood Bank — Find Verified Blood Donors, Free",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangladesh Blood Bank — Find Verified Blood Donors, Free",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  formatDetection: {
    // Donor and request pages are full of Bangladeshi phone numbers; letting
    // mobile browsers linkify them is a feature, not a layout hazard.
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the dark shell below, so mobile browser chrome does not flash white.
  themeColor: "#0f172a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Google Fonts is the only cross-origin dependency on the critical
            path; warming the connection saves a DNS + TLS round trip on the
            slow mobile networks most of this audience is on. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-red-500/30 selection:text-white bg-slate-950 text-slate-50`}
      >
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
