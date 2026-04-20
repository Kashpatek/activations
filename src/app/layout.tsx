import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SemiAnalysis Events — Activate 2026",
  description:
    "SemiAnalysis produces exclusive event activations that reach AI infrastructure decision-makers. 9 events, 3 continents, 2,700+ decision-makers.",
  openGraph: {
    title: "SemiAnalysis Events — Activate 2026",
    description:
      "Nine activations. Three continents. The decision-makers who matter most.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SemiAnalysis Events — Activate 2026",
    description:
      "Nine activations. Three continents. The decision-makers who matter most.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
