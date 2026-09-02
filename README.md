# Manthan Gour —  Portfolio

A production-grade personal portfolio for **Manthan Gour**, Senior Software Developer / Frontend Engineer. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Deployed as a static site on GitHub Pages.

**Live URL:** [https://instinct29.github.io/portfoliolatest/](https://instinct29.github.io/portfoliolatest/)

## Preview

> Add a screenshot to `public/preview.png` after your first deploy.

## Tech Stack

- **Framework:** Next.js 16 (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Command Menu:** cmdk
- **Deployment:** GitHub Actions → GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production static export to /out
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

## Content Editing

All portfolio content lives in `src/data/`:

| File | Purpose |
|------|---------|
| `profile.ts` | Name, bio, links, availability, email |
| `experience.ts` | Work history and highlights |
| `projects.ts` | Featured work and case study content |
| `skills.ts` | Toolkit and AI positioning |
| `faq.ts` | FAQ items |
| `side-projects.ts` | Open-source / side projects |
| `navigation.ts` | Nav and command menu items |

Update content in these files — no need to touch components for most changes.

## Resume

Place your resume PDF at:

```
public/resume.pdf
```

The site links to `/resume.pdf` from the hero, navigation, and contact sections.

## Email Configuration

Set your email in `src/data/profile.ts`:

```ts
export const profile = {
  // ...
  email: "your.email@example.com",
};
```

If email is empty, the contact section shows a LinkedIn CTA instead.

## Project Images

Case study previews use CSS-based conceptual compositions in `ProjectPreview.tsx`. To add real screenshots:

1. Add images to `public/projects/`
2. Update the project data in `src/data/projects.ts`
3. Extend `ProjectPreview` to render images when available

## GitHub Pages Deployment

This project uses `output: "export"` for static generation. The GitHub Actions workflow at `.github/workflows/deploy.yml` automatically builds and deploys on push to `main`.

### First-time Setup

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "feat: initial portfolio"

# Create repo on GitHub (via gh CLI or github.com)
gh repo create portfolio --public --source=. --remote=origin

# Push to main
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to **Repository → Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` — the workflow deploys automatically

### Expected URL

For a repository named `portfolio` under `Instinct29`:

```
https://instinct29.github.io/portfoliolatest/
```

## Custom Domain

To use a custom domain (e.g. `manthangour.dev`):

1. Add a `CNAME` file in `public/` with your domain
2. Configure DNS:
   - `CNAME` record pointing to `instinct29.github.io`
   - Or `A` records to GitHub Pages IPs
3. Set `NEXT_PUBLIC_BASE_PATH=""` in the build environment
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Enable the custom domain in GitHub Pages settings

When moving from `/portfolio` subpath to a root custom domain, update:

- `.github/workflows/deploy.yml` → `NEXT_PUBLIC_BASE_PATH: ""`
- `next.config.ts` → default basePath logic
- `src/data/profile.ts` → `siteUrl`

## Environment Variables

| Variable | Default (production) | Description |
|----------|---------------------|-------------|
| `NEXT_PUBLIC_BASE_PATH` | `/portfoliolatest` | Asset and route prefix |
| `NEXT_PUBLIC_SITE_URL` | `https://instinct29.github.io` | Canonical site URL |

For local development, basePath is empty by default.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── work/[slug]/      # Case study pages
│   ├── layout.tsx        # Root layout + SEO
│   └── page.tsx          # Homepage
├── components/
│   ├── home/             # Homepage sections
│   ├── work/             # Case study components
│   ├── layout/           # Header, Footer, Container
│   ├── ui/               # Reusable UI primitives
│   └── providers/        # Theme provider
├── data/                 # All portfolio content
├── lib/                  # Utilities
└── types/                # TypeScript interfaces
```

## License

Private — personal portfolio. All rights reserved.
