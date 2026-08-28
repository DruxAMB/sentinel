import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://sentinel.druxamb.dev";

export const metadata: Metadata = {
  title: "Sentinel | Persistent Community Conflict Detection",
  description: "A Mind that watches over your community and detects brewing conflicts by remembering interaction patterns over time.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Sentinel | Persistent Community Conflict Detection",
    description: "A Mind that watches over your community and detects brewing conflicts by remembering interaction patterns over time.",
    url: siteUrl,
    siteName: "Sentinel",
    images: [
      {
        url: "/hero-shot.png",
        width: 1200,
        height: 630,
        alt: "Sentinel — how it works",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel | Persistent Community Conflict Detection",
    description: "A Mind that watches over your community and detects brewing conflicts by remembering interaction patterns over time.",
    images: ["/hero-shot.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
