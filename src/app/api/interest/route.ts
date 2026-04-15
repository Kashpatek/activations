import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
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
    const { name, email, role, events, notes } = body;

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
      submittedAt: new Date().toISOString(),
    });
    await writeFile(FILE, JSON.stringify(submissions, null, 2));

    console.log(`[INTEREST] New submission from ${name} (${email}) — ${events?.length || 0} events`);

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[INTEREST] Error:", e);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function GET() {
  const submissions = await getSubmissions();
  return Response.json(submissions);
}
