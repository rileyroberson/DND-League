## Product Overview

This document defines the product and technical design for a weekly "Screentime League" web app. A group of 12–15 participants submits their weekly screentime. Submissions can be either:
- a screenshot (parsed by Gemini to extract HH:MM), or
- a manual entry (HH:MM).

Each week, standings are calculated like a sports league: lowest screentime ranks highest. Points are assigned top-down based on the number of participants in the group. Example with 12 users: 1st = 12 points, 2nd = 11, …, 12th = 1.


## Goals and Non-Goals

- Goals
  - Collect weekly screentime submissions (image or manual) from 12–15 users per league.
  - Automatically parse screenshots using Gemini and validate manual inputs.
  - Compute weekly rankings and cumulative points.
  - Provide simple, mobile-first UI for submit, view standings, and history.
  - Host on Vercel with a low-maintenance, serverless architecture.

- Non-Goals (v1)
  - Complex social features (comments, reactions).
  - Cross-platform auth federation beyond basic email magic-link or OAuth.
  - Multi-tenant org hierarchy beyond simple "league" groups.


## Tech Stack

- Frontend: Vite, React, JavaScript, Tailwind CSS
- Hosting: Vercel (frontend static hosting)
- Backend: Convex (queries/mutations, scheduler) + Vercel Serverless Functions (Gemini parsing only)
- Storage:
  - Primary data: Convex database (document collections with schema)
  - Image uploads: Convex file storage (generated upload URLs)
- AI: Google Gemini API (Vision multimodal) for screenshot text extraction (called from Vercel Serverless Functions)
- Auth: Convex Auth (email magic link and/or OAuth providers)



## High-Level Architecture

### Frontend (Vite React SPA)
- Public routes: Landing, Login/Join League
- Authed routes: Submit (upload or manual), Weekly Standings, Season-to-Date, Profile
- Uses Convex client to call server-side functions for:
  - Upload URL generation and submit intent
  - Create/update submission (manual and parsed)
  - Fetch standings and history
- Calls a Vercel Serverless Function for Gemini parsing

### Backend (Convex + Vercel Functions)
- Convex: queries/mutations, scheduler, storage, auth, authorization
- Vercel Functions: Gemini API calls only (separate function under `/api/gemini/parse`)

### Data Flow
1) User authenticates and selects a league (or creates one).
2) User opens Submit:
   - Manual: enters HH:MM, client validates, calls Convex mutation to record submission.
   - Screenshot: client requests an upload URL from Convex, uploads image to Convex storage, calls Vercel function to parse via Gemini; function returns parsed `hhmm` + confidence; client calls Convex mutation to persist and/or confirm.
3) Standings page fetches weekly leaderboard and cumulative points.
4) On weekly rollover, a cron finalizes the week (locks edits) and seeds the next week.


## Core Concepts & Data Model

- User: participant identity.
- League: a group of 12–15 users competing together.
- Season: contiguous set of weeks (optional in v1; a season can be implicit by date range).
- Week: a timeboxed period with `start_at`, `end_at`, due cutoff, and lock status.
- Submission: a user’s weekly screentime (minutes), source (manual/screenshot), and artifacts.
- Standing: derived ranking and points per week per league.

### Suggested Collections (Convex schema sketch)

```ts
// convex/schema.ts (illustrative)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(), // Date.now()
  }).index("by_email", ["email"]),

  leagues: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    ownerUserId: v.id("users"),
    timezone: v.string(),
    createdAt: v.number(),
  }).index("by_invite", ["inviteCode"]).index("by_owner", ["ownerUserId"]),

  leagueMembers: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    role: v.string(), // member | admin
    joinedAt: v.number(),
  }).index("by_league", ["leagueId"]).index("by_user", ["userId"]).index("by_league_user", ["leagueId", "userId"]),

  weeks: defineTable({
    leagueId: v.id("leagues"),
    weekNumber: v.number(),
    startAt: v.number(),
    endAt: v.number(),
    dueAt: v.number(),
    isLocked: v.boolean(),
  }).index("by_league_week", ["leagueId", "weekNumber"]).index("by_league", ["leagueId"]),

  submissions: defineTable({
    leagueId: v.id("leagues"),
    weekId: v.id("weeks"),
    userId: v.id("users"),
    source: v.string(), // manual | screenshot
    minutes: v.number(),
    imageUrl: v.optional(v.string()),
    geminiExtract: v.optional(v.any()),
    status: v.string(), // pending | confirmed | rejected
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_week_user", ["weekId", "userId"]).index("by_league_week", ["leagueId", "weekId"]).index("by_user", ["userId"]),

  standings: defineTable({
    weekId: v.id("weeks"),
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    rank: v.number(),
    points: v.number(),
    minutes: v.number(),
    createdAt: v.number(),
  }).index("by_week", ["weekId"]).index("by_league", ["leagueId"]).index("by_user", ["userId"]),
});
```


## Scoring & Ranking Rules

- Rank by ascending `minutes` (lowest time = best rank).
- Ties: users with the same `minutes` share the same rank; subsequent ranks skip accordingly (standard competition ranking). Example: 1, 2, 2, 4.
- Points per week: for league size N, points = N - (rank - 1). If ties exist, all tied users receive the points of their shared rank; next rank points continue to decrement normally.
- Late or missing submission: if submitted after `due_at` or missing when week locks:
  - v1: treat as no submission = zero points.
  - Admin override possible via `status='rejected'` or manual insertion.


## Gemini Parsing Strategy

- Input: Screenshot image (iOS/Android screentime or similar). Stored in Convex storage; Vercel function retrieves with a signed URL.
- Prompting: Provide few-shot examples of time formats and instruct Gemini to extract a single HH:MM total screen time value. Instruct to return a strict JSON schema.

Example system prompt response format:
```json
{
  "totalTime": "HH:MM",
  "confidence": 0.0,
  "notes": "short rationale if ambiguous"
}
```

- Validation:
  - Accept only if `HH:MM` matches regex and `confidence >= threshold` (e.g., 0.6–0.7).
  - If invalid or low confidence, return to client to request manual confirmation or edit.
  - Store raw `gemini_extract` for audit (persisted in Convex by a follow-up mutation).


## Server-Side Functions (Convex) & Vercel Function

- Convex Mutations
  - `leagues:create` — create league; returns `inviteCode`.
  - `leagues:join` — join via `inviteCode`.
  - `submissions:submitManual` — `{ weekId, hhmm }` -> validate and persist.
  - `submissions:confirm` — finalize a parsed submission.
  - `submissions:saveParsed` — persist `{ submissionId, hhmm, confidence, extract }` after Vercel parse.

- Convex Actions
  - `uploads:getUploadUrl` — returns upload URL and a reference id.

- Convex Queries
  - `weeks:getCurrent` — current week metadata for a league.
  - `standings:getWeekly` — list rank, points, minutes for a given week.
  - `standings:getSeason` — cumulative standings for a league.

- Vercel Serverless Function
  - `POST /api/gemini/parse` — body `{ submissionId }` or `{ fileUrl }`; fetches image (Convex signed URL), calls Gemini, returns `{ hhmm, confidence, extract }`.

Notes:
- All Convex functions check auth and league membership server-side.
- The Vercel function does not access Convex directly; client calls it and then calls a Convex mutation to persist results.


## Frontend UX

- Submit Page
  - Tabs: Manual | Screenshot
  - Manual: HH:MM masked input with validation, submit button.
  - Screenshot: file picker (mobile-friendly), preview, submit -> shows parsed time and confidence -> confirm.

- Standings Page
  - Header: Current week number and dates, submission deadline countdown.
  - Table/List: rank, name, HH:MM, points for the week.
  - Footer: link to Season-to-Date leaderboard.

- Season Page
  - Cumulative points chart and table; per-week mini-row for quick history.

- Admin (League Owner)
  - Set league size cap (12–15) and invite code regeneration.
  - Create/adjust week windows (start/end/due) and lock/unlock week.
  - Override submission when needed.


## State Management

- Keep client state minimal; rely on Convex as the source of truth.
- Use Convex React hooks (`useQuery`, `useMutation`, `useAction`) for data and cache.
- Global user/league context for selected league and auth token (if needed beyond Convex Auth).


## Security & Privacy

- Never expose Gemini API key client-side; only the Vercel function calls Gemini.
- Convex-generated signed URLs for uploads and file access.
- Authorization enforced in Convex functions (check league membership and roles).
- The Vercel function should validate a signed payload or include a short-lived token from Convex before fetching the image URL.
- PII minimization: store only email and display name.
- Data retention: allow users to delete their account; cascade removes league membership and submissions (or anonymize in standings).


## Validation & Edge Cases

- HH:MM validation: `^([0-9]|[0-9]{2}):[0-5][0-9]$` with bounds (0:00 to 23:59) unless we expect >24h; if so, allow `([0-9]{1,3}):[0-5][0-9]`.
- Duplicate submissions: last edit before due replaces previous; after lock, disallow.
- Screenshot parsing failures: prompt manual entry with prefilled guess.
- Timezone alignment: weeks and due_at based on league timezone; store UTC.
- League size used for points: compute from active members that week (joined before due_at).


## Scheduling & Week Lifecycle

- Convex scheduler runs weekly at a configured time per league (or a universal UTC time):
  1) Lock week (set `isLocked=true`).
  2) Compute standings and write rows to `standings`.
  3) Seed next week document with dates and due.
  4) Send notification summary (optional future).

- Admins can manually lock/unlock in emergencies.


## Environment Variables

- `CONVEX_DEPLOYMENT` — Convex deployment identifier (prod/preview)
- `CONVEX_SITE_URL` — frontend site URL used in auth callbacks
- `GEMINI_API_KEY` — Gemini API key (used only by Vercel function)
- `CONVEX_URL` or tokens needed to generate signed download URLs (if required by Vercel function)
- Auth provider secrets (per chosen providers)
- `VERCEL_ENV`, `VERCEL_URL` — environment context (frontend and API)


## Deployment & DevOps

- Frontend: push to main triggers Vercel build (Vite static).
- Backend:
  - Convex deployed via `npx convex deploy`; previews via branch deployments.
  - Vercel Serverless Functions deployed alongside the frontend (`/api/gemini/parse`).
- No SQL migrations; Convex schema managed in code and deployed.
- Enable Convex backups/retention on the chosen plan.


## Testing Strategy

- Unit: scoring, ranking, HH:MM parsing/normalization.
- Integration: submission flows (manual and screenshot parse path with mocked Gemini).
- E2E (Playwright or Cypress): auth, submit, standings view.
- Load: small scale (15 users) is trivial; still test upload and parse endpoints under burst.


## Accessibility & Performance

- Tailwind + semantic HTML; ensure keyboard navigation and color contrast.
- Mobile-first UI; images lazy-loaded; compress uploads client-side where possible.
- Cache GET endpoints via SWR and short CDN TTLs.


## Open Questions

- Auth choice: Supabase Auth (SPA-friendly) vs Vercel-native auth. If using Supabase Postgres + Auth + Storage, we gain an integrated stack; otherwise, pair Vercel Postgres + Blob + a lightweight auth provider.
- Multi-league membership per user: supported in schema, but UI should make league switching obvious.
- Season reset cadence: calendar quarter vs configurable length.


## Milestones (v1)

1) Project setup: Vite + React + Tailwind; CI on Vercel; choose DB/storage/auth.
2) Auth + League create/join flows.
3) Week model, current week view, and submission due countdown.
4) Manual submission flow with validation and standings compute (client-side preview, server validation, then persist).
5) Screenshot upload + Gemini parse + confirmation.
6) Weekly standings table and season leaderboard.
7) Cron-based week lock and standings finalization.
8) Admin controls: lock/unlock, week adjustments.


## Scoring Algorithm (Reference)

Pseudo:
```js
function calculateStandings(submissions, leagueSize) {
  // submissions: [{ userId, minutes }]
  // sort ascending by minutes
  const sorted = [...submissions].sort((a, b) => a.minutes - b.minutes);
  const standings = [];
  let i = 0;
  while (i < sorted.length) {
    const tieMinutes = sorted[i].minutes;
    const tieGroup = [];
    while (i < sorted.length && sorted[i].minutes === tieMinutes) {
      tieGroup.push(sorted[i]);
      i++;
    }
    const rank = standings.length + 1; // standard competition ranking
    const points = leagueSize - (rank - 1);
    for (const entry of tieGroup) {
      standings.push({ userId: entry.userId, minutes: entry.minutes, rank, points });
    }
  }
  return standings;
}
```


## UI Components (Sketch)

- `SubmitForm` — HH:MM input, masked, validation messages
- `ScreenshotUploader` — file input, preview, progress; on success triggers parse flow
- `ParseReview` — shows parsed time and confidence; confirm or edit
- `StandingsTable` — responsive list with rank, name, minutes, points
- `LeagueSwitcher` — dropdown for leagues
- `DeadlineBadge` — indicates `due_at` and countdown


## Tailwind & Theming

- Use Tailwind with a small design system: primary, surface, muted, success, warning, danger.
- Dark mode via `class` strategy.
- Components use consistent spacing and radius scale.


## Analytics & Observability

- Vercel Analytics for page views and Web Vitals.
- Server logs for API latency and Gemini parse outcomes; alert on elevated failure rates.


## Risks & Mitigations

- OCR ambiguity on screenshots
  - Mitigation: strict schema, confidence threshold, user confirmation fallback
- Timezone and weekly cutoff confusion
  - Mitigation: display league-local dates; lock based on league timezone
- Vendor coupling
  - Mitigation: abstract data and AI service calls behind internal modules


## Future Enhancements

- Notifications: weekly reminders and results via email/Discord/Slack.
- Multiple metrics per week (e.g., pickups) with configurable scoring.
- Public shareable read-only standings pages.
- CSV export of season results.


