import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join("/tmp", "sa-activations");
const MAX_ITEMS = 5000;

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN;

export const storageDiagnostic = {
  hasKV,
  url: !!process.env.KV_REST_API_URL,
  token: !!process.env.KV_REST_API_TOKEN,
  kvUrl: !!process.env.KV_URL,
  redisUrl: !!process.env.REDIS_URL,
};

async function kv() {
  if (!hasKV) return null;
  const mod = await import("@vercel/kv");
  return mod.kv;
}

async function ensureDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

function fileFor(key: string) {
  return join(DATA_DIR, `${key}.json`);
}

export async function listAppend(key: string, value: unknown) {
  const k = await kv();
  if (k) {
    await k.lpush(key, JSON.stringify(value));
    await k.ltrim(key, 0, MAX_ITEMS - 1);
    return;
  }
  await ensureDir();
  const path = fileFor(key);
  let items: unknown[] = [];
  try {
    items = JSON.parse(await readFile(path, "utf-8"));
  } catch {}
  items.push(value);
  const trimmed = items.length > MAX_ITEMS ? items.slice(-MAX_ITEMS) : items;
  await writeFile(path, JSON.stringify(trimmed));
}

export async function listAll<T = unknown>(key: string): Promise<T[]> {
  const k = await kv();
  if (k) {
    const raw = await k.lrange<string>(key, 0, -1);
    return raw
      .map((v: string | T) => (typeof v === "string" ? (safeParse<T>(v)) : (v as T)))
      .filter((v): v is T => v !== null)
      .reverse();
  }
  try {
    return JSON.parse(await readFile(fileFor(key), "utf-8"));
  } catch {
    return [];
  }
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export const STORAGE_BACKEND = hasKV ? "vercel-kv" : "tmp-file";
