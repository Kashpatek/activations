import { listAppend, listAll, STORAGE_BACKEND } from "@/lib/storage";

type TrackEvent = {
  event: string;
  partner: string;
  host: string;
  metadata: Record<string, unknown>;
  userAgent: string | null;
  referrer: string | null;
  at: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, partner, host, metadata } = body;
    if (!event) {
      return Response.json({ error: "event required" }, { status: 400 });
    }

    const t: TrackEvent = {
      event,
      partner: partner || "Unknown",
      host: host || "SemiAnalysis",
      metadata: metadata || {},
      userAgent: request.headers.get("user-agent") || null,
      referrer: request.headers.get("referer") || null,
      at: new Date().toISOString(),
    };

    await listAppend("tracks", t);

    return Response.json({ ok: true, backend: STORAGE_BACKEND });
  } catch (e) {
    return Response.json({ error: "Failed to track", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const tracks = await listAll<TrackEvent>("tracks");
  return Response.json(tracks);
}
