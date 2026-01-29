import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rural Blood Bank - Save Lives, Donate Blood",
  description: "A non-profit platform connecting blood donors and recipients in rural areas. Find blood donors quickly and for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-red-100 selection:text-red-900`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-neutral-50 flex flex-col">
            {children}
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
