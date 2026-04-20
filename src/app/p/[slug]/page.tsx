import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActivationsClient from "../../activations-client";
import { semianalysisAwsConfig } from "@/config/semianalysis-aws";
import { semianalysisLambdaConfig } from "@/config/semianalysis-lambda";
import type { SiteConfig } from "@/config/site-config";

// Server-only slug → config map. These tokens are unguessable (16 random hex
// chars). Rotate by replacing here and redeploying. Old slugs 404 immediately.
//
// Anyone who hits an unknown slug gets a generic 404 — they can't enumerate
// brands or even confirm a brand has a page. To add a new brand, generate a
// fresh slug (e.g. `openssl rand -hex 8` then prepend any short prefix) and
// add an entry below.
const SLUGS: Record<string, SiteConfig> = {
  "f4e8a1c2b6d9k3pn": semianalysisAwsConfig,
  "7c5b8f3e2d4a9q6m": semianalysisLambdaConfig,
};

export const metadata: Metadata = {
  title: "SemiAnalysis — 2026 Partnership",
  description: "2026 event activation calendar.",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
  openGraph: { title: "SemiAnalysis — 2026 Partnership" },
  twitter: { title: "SemiAnalysis — 2026 Partnership" },
};

export default async function ProspectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = SLUGS[slug];
  if (!config) {
    notFound();
  }
  return <ActivationsClient config={config} />;
}
