const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function getKV() {
  if (!hasKV) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

// Wipes all stats/pipeline/submission/tracking data. Proxy-protected; requires
// an authenticated internal session. Intended for clearing test data before a
// real launch, or for starting a fresh season.
export async function POST() {
  const kv = await getKV();
  if (!kv) {
    return Response.json({ error: "KV not configured" }, { status: 503 });
  }

  const cleared: Record<string, number | boolean> = {};

  // Submissions + legacy list
  cleared.submissions = Boolean(await kv.del("submissions:v2"));
  cleared.legacySubmissions = Boolean(await kv.del("submissions"));

  // Tracking events
  cleared.tracks = Boolean(await kv.del("tracks"));

  // Pipelines — enumerate via the companies index, then clear each + the index
  const companies = ((await kv.get<string[]>("pipeline:companies")) ?? []) as string[];
  let pipelinesCleared = 0;
  for (const c of companies) {
    if (await kv.del(`pipeline:${c}`)) pipelinesCleared++;
  }
  await kv.del("pipeline:companies");
  cleared.pipelineCompaniesWiped = pipelinesCleared;

  // Event sub-sponsors — enumerate via index, then clear each + the index
  const events = ((await kv.get<string[]>("event-subsponsors:events")) ?? []) as string[];
  let subSponsorsCleared = 0;
  for (const e of events) {
    if (await kv.del(`event-subsponsors:${e}`)) subSponsorsCleared++;
  }
  await kv.del("event-subsponsors:events");
  cleared.eventSubSponsorsWiped = subSponsorsCleared;

  return Response.json({ ok: true, cleared });
}
