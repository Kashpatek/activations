import type { Metadata } from "next";
import ActivationsClient from "../activations-client";
import { semianalysisAwsConfig } from "@/config/semianalysis-aws";

export const metadata: Metadata = {
  title: "SemiAnalysis — 2026 Partnership",
  description: "2026 event activation calendar.",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
  openGraph: { title: "SemiAnalysis — 2026 Partnership" },
  twitter: { title: "SemiAnalysis — 2026 Partnership" },
};

export default function AwsPage() {
  return <ActivationsClient config={semianalysisAwsConfig} />;
}
