import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SemiAnalysis x AWS — Activate 2026",
  description:
    "Strategic event partnership opportunities across MLSys, Computex, ICML, NeurIPS, and more. Reach the AI infrastructure community where it gathers.",
  openGraph: {
    title: "SemiAnalysis x AWS — Activate 2026",
    description:
      "Eight activations. Three continents. The decision-makers who matter most.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SemiAnalysis x AWS — Activate 2026",
    description:
      "Eight activations. Three continents. The decision-makers who matter most.",
    images: ["/og.png"],
  },
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
