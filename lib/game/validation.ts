const BLOCKED = ["fuck", "shit", "asshole", "nazi", "hitler"] as const;

function graphemeLength(s: string): number {
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(s)).length;
    }
  } catch {
    /* fall through */
  }
  return Array.from(s).length;
}

function graphemeSlice(s: string, max: number): string {
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      const parts = Array.from(seg.segment(s)).slice(0, max);
      return parts.map((p) => p.segment).join("");
    }
  } catch {
    /* fall through */
  }
  return Array.from(s).slice(0, max).join("");
}

export function normalizeDisplayName(input: string): string {
  const trimmed = input.normalize("NFKC").trim().replace(/\s+/g, " ");
  return graphemeSlice(trimmed, 18);
}

export function validateDisplayName(input: string): {
  ok: boolean;
  value?: string;
  error?: string;
} {
  const value = normalizeDisplayName(input);
  if (!value) return { ok: false, error: "Name required." };
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return { ok: false, error: "Invalid characters." };
  }
  if (graphemeLength(value) > 18) {
    return { ok: false, error: "Name too long." };
  }
  const lower = value.toLowerCase();
  for (const w of BLOCKED) {
    if (lower.includes(w))
      return { ok: false, error: "Please choose another name." };
  }
  return { ok: true, value };
}

export function validateFinishPayload(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (typeof o.runId !== "string" || o.runId.length < 8) return false;
  if (typeof o.displayName !== "string") return false;
  if (
    typeof o.secretsFound !== "number" ||
    o.secretsFound < 0 ||
    o.secretsFound > 7
  )
    return false;
  if (typeof o.level === "number" && o.level !== 100) return false;
  return true;
}
