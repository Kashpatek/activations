import { listAppend, listAll, STORAGE_BACKEND } from "@/lib/storage";
import type { CompanyPipeline, Submission } from "@/lib/pipeline-types";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const SUBMISSIONS_HASH = "submissions:v2";
const LEGACY_LIST = "submissions";
let migrationAttempted = false;

async function getKV() {
  if (!hasKV) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

// Migrate any leftover legacy list entries into the hash (idempotent, one-time).
async function migrateLegacyIfNeeded() {
  if (migrationAttempted) return;
  migrationAttempted = true;
  const kv = await getKV();
  if (!kv) return;
  try {
    const legacy = await listAll<Submission>(LEGACY_LIST);
    if (!legacy?.length) return;
    const hash = (await kv.hgetall<Record<string, Submission>>(SUBMISSIONS_HASH)) ?? {};
    const existing = new Set(Object.values(hash).map(s => `${s.email}|${s.submittedAt}`));
    const toAdd: Record<string, string> = {};
    for (const s of legacy) {
      const key = `${s.email}|${s.submittedAt}`;
      if (existing.has(key)) continue;
      const id = s.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
      toAdd[id] = JSON.stringify({ ...s, id });
    }
    if (Object.keys(toAdd).length) {
      await kv.hset(SUBMISSIONS_HASH, toAdd);
    }
  } catch {
    // best-effort
  }
}

async function advancePipelineOnInquiry(company: string, events: string[]) {
  if (!company || !events?.length) return;
  const kv = await getKV();
  if (!kv) return;
  try {
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
  } catch {}
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, events, notes, partner, host } = body;
    if (!name || !email) {
      return Response.json({ error: "Name and email required" }, { status: 400 });
    }

    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    const sub: Submission = {
      id,
      name, email, role, events, notes,
      partner: partner || "Unknown",
      host: host || "SemiAnalysis",
      submittedAt: new Date().toISOString(),
      internalNotes: "",
      followUpStatus: "none",
    };

    const kv = await getKV();
    if (kv) {
      await kv.hset(SUBMISSIONS_HASH, { [id]: JSON.stringify(sub) });
    } else {
      await listAppend("submissions", sub);
    }
    await advancePipelineOnInquiry(sub.partner, sub.events ?? []);

    return Response.json({ ok: true, id, backend: STORAGE_BACKEND });
  } catch (e) {
    return Response.json({ error: "Failed to save", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  await migrateLegacyIfNeeded();
  const kv = await getKV();
  if (!kv) {
    const legacy = await listAll<Submission>(LEGACY_LIST);
    return Response.json(legacy);
  }
  const hash = (await kv.hgetall<Record<string, Submission | string>>(SUBMISSIONS_HASH)) ?? {};
  const all: Submission[] = Object.values(hash).map((v) =>
    typeof v === "string" ? JSON.parse(v) : (v as Submission)
  );
  all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return Response.json(all);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  const kv = await getKV();
  if (!kv) return Response.json({ error: "delete requires KV" }, { status: 503 });
  await kv.hdel(SUBMISSIONS_HASH, id);
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, patch } = body as { id: string; patch: Partial<Submission> };
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    const kv = await getKV();
    if (!kv) return Response.json({ error: "patch requires KV" }, { status: 503 });
    const raw = await kv.hget<Submission | string>(SUBMISSIONS_HASH, id);
    if (!raw) return Response.json({ error: "not found" }, { status: 404 });
    const existing: Submission = typeof raw === "string" ? JSON.parse(raw) : raw;
    const updated: Submission = { ...existing, ...patch };
    await kv.hset(SUBMISSIONS_HASH, { [id]: JSON.stringify(updated) });
    return Response.json({ ok: true, submission: updated });
  } catch (e) {
    return Response.json({ error: "Failed to patch", detail: String(e) }, { status: 500 });
  }
}
