import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join("/tmp", "sa-activations");
const FILE = join(DATA_DIR, "submissions.json");

async function ensureDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function getSubmissions() {
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
    const { name, email, role, events, notes, partner, host } = body;

    if (!name || !email) {
      return Response.json({ error: "Name and email required" }, { status: 400 });
    }

    await ensureDir();
    const submissions = await getSubmissions();
    submissions.push({
      name,
      email,
      role,
      events,
      notes,
      partner: partner || "Unknown",
      host: host || "SemiAnalysis",
      submittedAt: new Date().toISOString(),
    });
    await writeFile(FILE, JSON.stringify(submissions, null, 2));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET() {
  const submissions = await getSubmissions();
  return Response.json(submissions);
}
