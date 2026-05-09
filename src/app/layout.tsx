import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — AI Spend Audit",
  description:
    "Find out if you're overpaying for AI tools. Free instant audit — what to cut, what to switch, and exactly how much you'd save.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-spend-audit.vercel.app"
  ),
  openGraph: {
    title: "SpendLens — AI Spend Audit",
    description:
      "Find out if you're overpaying for AI tools. Free instant audit for startups and engineering teams.",
    url: "/",
    siteName: "SpendLens",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpendLens AI Spend Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — AI Spend Audit",
    description:
      "Find out if you're overpaying for AI tools. Free instant audit.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}