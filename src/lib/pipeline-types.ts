// Shared pipeline/status types — used by /api/pipeline and internal UI

export type PipelineStatus =
  | "proposed"   // Michelle lists event for company on calendar (default)
  | "inquired"   // Company submitted interest form for this event (auto)
  | "confirmed"  // Verbal/email agreement, moving to paperwork
  | "approved"   // Budget + legal approved on their side
  | "finalized"; // Contract signed, payment scheduled/received

export const PIPELINE_STAGES: {
  key: PipelineStatus;
  label: string;
  short: string;
  color: string;
  description: string;
}[] = [
  { key: "proposed",  label: "Proposed",           short: "Proposed",  color: "#8A8690", description: "On the calendar, not yet introduced." },
  { key: "inquired",  label: "Inquired",           short: "Inquired",  color: "#0B86D1", description: "Submitted interest via form." },
  { key: "confirmed", label: "Confirmed — Pending", short: "Confirmed", color: "#F7B041", description: "Verbal alignment; paperwork in motion." },
  { key: "approved",  label: "Approved",           short: "Approved",  color: "#905CCB", description: "Budget + legal approved. Not signed." },
  { key: "finalized", label: "Finalized",          short: "Finalized", color: "#4ADE80", description: "Signed. Locked in." },
];

export type PipelineBudget = {
  proposed: number;  // target ask ($K)
  confirmed: number; // agreed-to ($K)
  paid: number;      // actually received ($K)
};

export type SubSponsor = {
  id: string;
  name: string;       // sponsor org name
  contact?: string;   // person + title
  tier?: string;      // "Silver", "Bronze", "Community", or free text
  amount: number;     // $K contribution
  status?: "proposed" | "confirmed" | "paid";
  note?: string;
  addedAt: string;
};

export type PipelineEntry = {
  status: PipelineStatus;
  budget: PipelineBudget;
  notes?: string;
  lastUpdated: string;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  role?: string;
  events?: string[];
  notes?: string;
  partner: string;
  host: string;
  submittedAt: string;
  internalNotes?: string;
  followUpStatus?: "none" | "scheduled" | "contacted" | "closed";
  followUpDate?: string; // ISO datetime when followUpStatus === "scheduled"
};

export type CompanyPipeline = Record<string /*eventName*/, PipelineEntry>;

export const emptyEntry = (): PipelineEntry => ({
  status: "proposed",
  budget: { proposed: 0, confirmed: 0, paid: 0 },
  notes: "",
  lastUpdated: new Date().toISOString(),
});
