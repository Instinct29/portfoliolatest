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
GOOGLE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The chatbot works when `GOOGLE_AI_API_KEY` is set. Without it, the site still loads and the chatbot shows a graceful unavailable message.

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
3. Add environment variable: `GOOGLE_AI_API_KEY`
4. Optionally set `NEXT_PUBLIC_SITE_URL` to your production URL
5. Deploy

GitHub Pages is no longer used — the chatbot requires server-side API routes.

## Custom Domain

Set `NEXT_PUBLIC_SITE_URL` to your custom domain in Vercel environment variables.

## License

