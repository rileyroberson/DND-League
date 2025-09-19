# Screentime League — Web

Vite + React + Tailwind SPA for weekly screentime leagues.

## Getting Started

Prereqs: pnpm 10+, Node 18+

1. Install deps

```bash
pnpm install
```

2. Run dev server

```bash
pnpm dev
```

3. Optional: Configure Convex URL (if you have a backend running)

- Create `.env.local` in `web/` with:

```
VITE_CONVEX_URL=<your-convex-url>
```

## Build

```bash
pnpm build && pnpm preview
```

## Deploy

- Push to main and deploy on Vercel.
- API route stub at `/api/gemini/parse` returns a fake parse for now.

## Structure

- `src/pages` basic routes: Landing, Login/Join, Submit, Standings, Season
- `src/components` UI components
- `convex/` schema and server function stubs
