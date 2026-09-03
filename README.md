# Manthan Gour — Portfolio

Personal portfolio built on the [MIT-licensed shashwa7 portfolio template](https://github.com/shashwa7-dev/portfolio) by Shashwat Tripathi, personalized for Manthan Gour.

**Production:** Deploy on [Vercel](https://vercel.com) (required for the chatbot API).

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Motion (Framer Motion)
- Google Gemini (chatbot)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then set your Gemini key (create one at [Google AI Studio](https://aistudio.google.com/apikey)):

```bash
GOOGLE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Supported env var names** (any one works):

| Variable | Notes |
|----------|-------|
| `GOOGLE_AI_API_KEY` | Preferred name in this repo |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Common in Vercel / Google SDK docs |
| `GEMINI_API_KEY` | Also accepted |

Optional: `CHAT_GEMINI_MODEL` (default `gemini-3.5-flash-lite`). Use this name so a global `GEMINI_MODEL` on your machine does not override the portfolio chat.

Restart `npm run dev` after editing `.env.local`. The chatbot calls `POST /api/chat`, which streams replies from Gemini using `data/agent-memory.md` as its system prompt.

Without a valid API key, the site still loads; MG Assistant shows a generic “having trouble connecting” message instead of exposing server errors.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Content

Edit these files to update portfolio content:

| File | Purpose |
|------|---------|
| `lib/workData.ts` | Experience & featured work |
| `lib/projectsData.ts` | Side projects |
| `lib/stats.ts` | Hero metrics |
| `lib/siteLinks.ts` | Nav, social links, email, location |
| `data/cv.md` | CV page content (HTML + PDF source) |
| `data/agent-memory.md` | Chatbot knowledge |
| `components/About.tsx` | Hero copy |
| `components/Faq.tsx` | FAQ |

## Resume PDF

Place your PDF at `public/resume.pdf` for the CV download button.

## Email

Set `contactEmail` in `lib/siteLinks.ts`. When empty, LinkedIn is used as the primary contact CTA.

## Deployment (Vercel)

1. Push to GitHub: `Instinct29/portfoliolatest`
2. Import the repository in [Vercel](https://vercel.com/new)
3. **Settings → Environment Variables** → add `GOOGLE_AI_API_KEY` with your [Google AI Studio](https://aistudio.google.com/apikey) key
   - Enable it for **Production** (and Preview if you test preview URLs)
   - No quotes around the value; no trailing spaces
4. **Redeploy** after saving env vars (Deployments → ⋮ → Redeploy). New variables are not picked up by an old deployment.
5. Optionally set `NEXT_PUBLIC_SITE_URL` to your production URL

**If MG Assistant still says “having trouble connecting”:**

- Confirm the key is set on the **same Vercel project** that serves the site
- Redeploy after adding or changing the key
- In Vercel → Project → Logs, filter `/api/chat` and look for `Chat unavailable` or `Chat generation failed`
- Ensure the Generative Language API is enabled for the Google Cloud project tied to your key

GitHub Pages is no longer used — the chatbot requires server-side API routes.

## Definitely Possible — Beta

100-level psychological puzzle game on the homepage teaser and `/play`.

**Beta label** means the game is live and evolving (level balance, polish). It does not mean broken progression, fake leaderboards, or unusable mobile.

### Product model (locked)

- **One session:** unfinished progress is memory-only. Refresh / close abandons the run and the next play starts at Level 1.
- **Failure:** resolve once, brief feedback, then `nextLevel = max(1, current - 5)`. No lives, hearts, checkpoints, or mistake HUD.
- **Success:** advance one level. Snappy transitions; no giant “LEVEL COMPLETE” cards.
- **L96 exception:** a wrong micro-round restarts the exam at round 1 only. It does **not** also apply global −5.
- **Durable client data:** personal best time, secrets, completed-run count after a full finish only.
- **Leaderboard:** optional Postgres; ranks by **fastest legitimate completion time**. Score is display-only. Assisted / debug / hint runs are unranked. Missing DB ≠ “assisted”; play stays local.

### Architecture

- `lib/game/` — run reducer, memory ownership / rollback, deterministic RNG (`randomFor`), scoring, validation
- `lib/game/levels/` — chunks of 25 levels, lazy-loaded via `registry.ts`
- `lib/game/leaderboard/` — memory stub + Postgres store (`pg`)
- `components/game/` — shell, teaser, transitions, completion, leaderboard, boy / L100 cinematic
- `app/api/game/{start,progress,finish,leaderboard}` — server-authoritative start / progress / finish
- `docs/game-schema.sql` — schema for `game_runs` + `game_scores`

Progress payloads use `{ runId, event: "success" | "failure", level }` where `level` is the level being resolved. The server computes the next level and rejects impossible jumps.

### Leaderboard setup (optional)

1. Provision Postgres and set `DATABASE_URL` or `POSTGRES_URL`
2. Run `docs/game-schema.sql` once
3. Ensure `pg` is installed (already in `package.json`)
4. Redeploy

Without DB config the game and local personal bests still work; the panel shows “Leaderboard unavailable.”

Rate limits on API routes are per-instance (fine for a portfolio game; not a global edge limiter).

### Development

- Jump (dev only): `/play?level=68` (marks the run debug / unranked)
- Personal best key: `mg-definitely-possible-best-v2` (legacy unfinished-run keys are wiped)
- Tests: `npm test`
- Do not publish puzzle solutions in public docs

## Custom Domain

Set `NEXT_PUBLIC_SITE_URL` to your custom domain in Vercel environment variables.

## License

