# ENDGEGNER

A bilingual German practice app with separate trainers for adjective endings,
verb-preposition patterns, and reflexive verbs. Each trainer includes 200
exercises, detailed statistics, and cycle-based scheduling that avoids repeats
until its whole question bank has been seen.

## Stack

- React 19 and TypeScript
- Vite / Vinext
- Plain CSS
- Browser `localStorage` for progress and statistics

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

The standard production build used by ChatGPT Sites is:

```bash
npm run build
```

## GitHub Pages

The Pages build reuses the same React app through a small static Vite entry:

```bash
npm run build:pages
```

It writes the static site to `pages-dist/`. Pushes to `main` are deployed by
`.github/workflows/deploy-pages.yml`.
