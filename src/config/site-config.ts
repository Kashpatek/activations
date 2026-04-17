import { createContext, useContext } from "react";

export type ActivationStatus = "proposed" | "interested" | "activated";

export type EventItem = {
  name: string;
  dates: string;
  location: string;
  tag: string;
  color: string;
  status: ActivationStatus;
  activation: string;
  logo: string;
  monthIndex: number;
  dayStart: number;
  dayEnd: number;
  about: string;
  audience: string;
  ourPlan: string;
  whyItMatters: string;
  activationSteps: { phase: string; timing: string; tasks: string[] }[];
  internalNote?: string;
};

export type StatItem = { value: string; label: string; sub: string };
export type PastEventItem = { name: string; partner: string; attendees: string; highlight: string };
export type AudienceSlice = { label: string; pct: number; color: string };
export type WhyUsItem = { title: string; body: string; icon: string };
export type Testimonial = { quote: string; author: string; company: string };
export type TierItem = { tier: string; desc: string; features: string[]; highlight?: boolean };

export type SiteConfig = {
  host: {
    name: string;
    shortName?: string;
    logo: string;
    tagline?: string;
  };
  partner: {
    name: string;
    logo: string;
    color: string;
  };
  year: string;
  tagColors: Record<string, string>;
  events: EventItem[];
  stats: StatItem[];
  pastEvents: PastEventItem[];
  audienceBreakdown: AudienceSlice[];
  whyUs: WhyUsItem[];
  testimonials: Testimonial[];
  tiers: TierItem[];
  hero: {
    eyebrow: string;
    headline: string;
    subtitle: string;
  };
  whySection: {
    title: string;
    lead: string;
    groups: { title: string; items: string[] }[];
  };
  footer: string;
};

export const SiteConfigContext = createContext<SiteConfig | null>(null);
export function useSiteConfig(): SiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}
