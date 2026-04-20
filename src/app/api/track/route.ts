import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join("/tmp", "sa-activations");
const FILE = join(DATA_DIR, "tracks.json");
const MAX_EVENTS = 5000;

async function ensureDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function getTracks() {
  try {
    const raw = await readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, partner, host, metadata } = body;
    if (!event) {
      return Response.json({ error: "event required" }, { status: 400 });
    }

    await ensureDir();
    const tracks = await getTracks();
    tracks.push({
      event,
      partner: partner || "Unknown",
      host: host || "SemiAnalysis",
      metadata: metadata || {},
      userAgent: request.headers.get("user-agent") || null,
      referrer: request.headers.get("referer") || null,
      at: new Date().toISOString(),
    });

    const trimmed = tracks.length > MAX_EVENTS ? tracks.slice(-MAX_EVENTS) : tracks;
    await writeFile(FILE, JSON.stringify(trimmed));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to track" }, { status: 500 });
  }
}

export async function GET() {
  const tracks = await getTracks();
  return Response.json(tracks);
}
