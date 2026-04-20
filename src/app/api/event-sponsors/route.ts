import type { SubSponsor } from "@/lib/pipeline-types";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function getKV() {
  if (!hasKV) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

const key = (event: string) => `event-subsponsors:${event}`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const event = url.searchParams.get("event");
  const kv = await getKV();
  if (!kv) return Response.json(event ? { event, sponsors: [] } : { all: {} });

  if (event) {
    const list = ((await kv.get<SubSponsor[]>(key(event))) ?? []) as SubSponsor[];
    return Response.json({ event, sponsors: list });
  }

  // All events — scan known keys. Simpler: read an index.
  const index = ((await kv.get<string[]>("event-subsponsors:events")) ?? []) as string[];
  const out: Record<string, SubSponsor[]> = {};
  for (const ev of index) {
    out[ev] = ((await kv.get<SubSponsor[]>(key(ev))) ?? []) as SubSponsor[];
  }
  return Response.json({ all: out });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, sponsor } = body as { event: string; sponsor: Partial<SubSponsor> };
    if (!event || !sponsor?.name) {
      return Response.json({ error: "event + sponsor.name required" }, { status: 400 });
    }
    const kv = await getKV();
    if (!kv) return Response.json({ error: "requires KV" }, { status: 503 });
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const newSponsor: SubSponsor = {
      id,
      name: sponsor.name,
      contact: sponsor.contact || "",
      tier: sponsor.tier || "",
      amount: sponsor.amount || 0,
      status: sponsor.status || "proposed",
      note: sponsor.note || "",
      addedAt: new Date().toISOString(),
    };
    const list = ((await kv.get<SubSponsor[]>(key(event))) ?? []) as SubSponsor[];
    list.push(newSponsor);
    await kv.set(key(event), list);

    const index = ((await kv.get<string[]>("event-subsponsors:events")) ?? []) as string[];
    if (!index.includes(event)) {
      index.push(event);
      await kv.set("event-subsponsors:events", index);
    }

    return Response.json({ ok: true, sponsor: newSponsor });
  } catch (e) {
    return Response.json({ error: "Failed", detail: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { event, id, patch } = body as { event: string; id: string; patch: Partial<SubSponsor> };
    if (!event || !id) return Response.json({ error: "event + id required" }, { status: 400 });
    const kv = await getKV();
    if (!kv) return Response.json({ error: "requires KV" }, { status: 503 });
    const list = ((await kv.get<SubSponsor[]>(key(event))) ?? []) as SubSponsor[];
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
    list[idx] = { ...list[idx], ...patch };
    await kv.set(key(event), list);
    return Response.json({ ok: true, sponsor: list[idx] });
  } catch (e) {
    return Response.json({ error: "Failed", detail: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const event = url.searchParams.get("event");
  const id = url.searchParams.get("id");
  if (!event || !id) return Response.json({ error: "event + id required" }, { status: 400 });
  const kv = await getKV();
  if (!kv) return Response.json({ error: "requires KV" }, { status: 503 });
  const list = ((await kv.get<SubSponsor[]>(key(event))) ?? []) as SubSponsor[];
  const next = list.filter(s => s.id !== id);
  await kv.set(key(event), next);
  return Response.json({ ok: true });
}
