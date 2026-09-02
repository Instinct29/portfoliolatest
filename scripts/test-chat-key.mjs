/**
 * Local-only: verifies GOOGLE_AI_API_KEY from .env.local without printing it.
 * Run: node scripts/test-chat-key.mjs
 */
import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const k = trimmed.slice(0, i).trim();
    const v = trimmed.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const key =
  process.env.GOOGLE_AI_API_KEY?.trim() ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
  process.env.GEMINI_API_KEY?.trim();

if (!key) {
  console.error("No Gemini API key in .env.local");
  process.exit(1);
}

const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Reply with exactly: ok" }] }],
  }),
});

const body = await res.json();

if (!res.ok) {
  console.error("Gemini API error:", res.status, body.error?.message || body);
  process.exit(1);
}

const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
console.log("Gemini OK. Model:", model, "Reply:", text.trim().slice(0, 80));
