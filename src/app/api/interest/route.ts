import { listAppend, listAll, STORAGE_BACKEND } from "@/lib/storage";

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

    return Response.json({ ok: true, backend: STORAGE_BACKEND });
  } catch (e) {
    return Response.json({ error: "Failed to save", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const subs = await listAll<Submission>("submissions");
  return Response.json(subs);
}
