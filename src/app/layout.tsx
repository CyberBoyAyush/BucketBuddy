import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BucketBuddy - Modern Cloud Storage Management",
  description: "A modern, secure, and intuitive interface for managing your cloud storage across AWS S3, Cloudflare R2, and other S3-compatible providers. Built for developers who demand excellence.",
  keywords: "S3, R2, cloud storage, file management, AWS, Cloudflare, bucket management, developer tools",
  authors: [{ name: "BucketBuddy Team" }],
  openGraph: {
    title: "BucketBuddy - Modern Cloud Storage Management",
    description: "Manage your S3 & R2 buckets with ease. Secure, fast, and designed for teams.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BucketBuddy - Modern Cloud Storage Management",
    description: "Manage your S3 & R2 buckets with ease. Secure, fast, and designed for teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
