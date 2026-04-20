import type { CompanyPipeline, PipelineEntry } from "@/lib/pipeline-types";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function kvGet<T>(key: string): Promise<T | null> {
  if (!hasKV) return null;
  const { kv } = await import("@vercel/kv");
  return (await kv.get<T>(key)) ?? null;
}
async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!hasKV) return;
  const { kv } = await import("@vercel/kv");
  await kv.set(key, value);
}

const pipelineKey = (company: string) => `pipeline:${company}`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = url.searchParams.get("company");
  if (company) {
    const data = (await kvGet<CompanyPipeline>(pipelineKey(company))) ?? {};
    return Response.json({ company, pipeline: data });
  }
  // No company specified — return all known (derived from a separate index)
  const companies = (await kvGet<string[]>("pipeline:companies")) ?? [];
  const out: Record<string, CompanyPipeline> = {};
  for (const c of companies) {
    out[c] = (await kvGet<CompanyPipeline>(pipelineKey(c))) ?? {};
  }
  return Response.json({ pipelines: out, companies });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { company, event, patch } = body as {
      company: string;
      event: string;
      patch: Partial<PipelineEntry>;
    };
    if (!company || !event) {
      return Response.json({ error: "company + event required" }, { status: 400 });
    }

    const existing = (await kvGet<CompanyPipeline>(pipelineKey(company))) ?? {};
    const prev = existing[event] ?? {
      status: "proposed",
      budget: { proposed: 0, confirmed: 0, paid: 0 },
      notes: "",
      lastUpdated: new Date().toISOString(),
    };

    const next: PipelineEntry = {
      ...prev,
      ...patch,
      budget: { ...prev.budget, ...(patch.budget || {}) },
      lastUpdated: new Date().toISOString(),
    };

    existing[event] = next;
    await kvSet(pipelineKey(company), existing);

    // Keep a simple companies index for enumeration
    const companies = (await kvGet<string[]>("pipeline:companies")) ?? [];
    if (!companies.includes(company)) {
      companies.push(company);
      await kvSet("pipeline:companies", companies);
    }

    return Response.json({ ok: true, entry: next });
  } catch (e) {
    return Response.json({ error: "Failed to patch", detail: String(e) }, { status: 500 });
  }
}
