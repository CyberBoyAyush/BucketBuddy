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
  title: {
    default: "BucketBuddy - Modern Cloud Storage Management",
    template: "%s | BucketBuddy"
  },
  description: "A modern, secure, and intuitive interface for managing your cloud storage across AWS S3, Cloudflare R2, and other S3-compatible providers. Built for developers who demand excellence.",
  keywords: [
    "S3", "R2", "cloud storage", "file management", "AWS", "Cloudflare",
    "bucket management", "developer tools", "object storage", "DigitalOcean Spaces",
    "Wasabi", "Backblaze B2", "MinIO", "storage management", "file browser"
  ],
  authors: [{ name: "BucketBuddy Team", url: "https://github.com/cyberboyayush" }],
  creator: "Ayush Kumar",
  publisher: "BucketBuddy",
  applicationName: "BucketBuddy",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#DC2626" },
    { media: "(prefers-color-scheme: dark)", color: "#DC2626" }
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg", color: "#DC2626" }
    ]
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bucketbuddy.dev",
    siteName: "BucketBuddy",
    title: "BucketBuddy - Modern Cloud Storage Management",
    description: "Manage your S3, R2, and other cloud storage buckets with ease. Secure, fast, and designed for developers and teams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BucketBuddy - Modern Cloud Storage Management"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@bucketbuddy",
    creator: "@cyberboyayush",
    title: "BucketBuddy - Modern Cloud Storage Management",
    description: "Manage your S3, R2, and other cloud storage buckets with ease. Secure, fast, and designed for developers.",
    images: ["/og-image.png"]
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
  category: "technology",
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
