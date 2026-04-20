import { listAppend, listAll, STORAGE_BACKEND } from "@/lib/storage";
import type { CompanyPipeline } from "@/lib/pipeline-types";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

type Submission = {
  name: string;
  email: string;
  role?: string;
  events?: string[];
  notes?: string;
  partner: string;
  host: string;
  submittedAt: string;
};

// Auto-advance pipeline to 'inquired' for each event the company submitted interest in.
// Only upgrades from 'proposed' — doesn't downgrade any further-along stages.
async function advancePipelineOnInquiry(company: string, events: string[]) {
  if (!hasKV || !company || !events?.length) return;
  try {
    const { kv } = await import("@vercel/kv");
    const key = `pipeline:${company}`;
    const existing = ((await kv.get<CompanyPipeline>(key)) ?? {}) as CompanyPipeline;
    let changed = false;
    const now = new Date().toISOString();
    for (const evName of events) {
      const prev = existing[evName] ?? {
        status: "proposed" as const,
        budget: { proposed: 0, confirmed: 0, paid: 0 },
        notes: "",
        lastUpdated: now,
      };
      if (prev.status === "proposed") {
        existing[evName] = { ...prev, status: "inquired", lastUpdated: now };
        changed = true;
      }
    }
    if (changed) {
      await kv.set(key, existing);
      const companies = ((await kv.get<string[]>("pipeline:companies")) ?? []) as string[];
      if (!companies.includes(company)) {
        companies.push(company);
        await kv.set("pipeline:companies", companies);
      }
    }
  } catch {
    // non-fatal — submission itself already saved
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, events, notes, partner, host } = body;

    if (!name || !email) {
      return Response.json({ error: "Name and email required" }, { status: 400 });
    }

    const sub: Submission = {
      name,
      email,
      role,
      events,
      notes,
      partner: partner || "Unknown",
      host: host || "SemiAnalysis",
      submittedAt: new Date().toISOString(),
    };

    await listAppend("submissions", sub);
    await advancePipelineOnInquiry(sub.partner, sub.events ?? []);

    return Response.json({ ok: true, backend: STORAGE_BACKEND });
  } catch (e) {
    return Response.json({ error: "Failed to save", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const subs = await listAll<Submission>("submissions");
  return Response.json(subs);
}
