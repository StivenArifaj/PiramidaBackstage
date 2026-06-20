# Piramida Backstage — Cloud Memory

> **THIS FILE IS THE PROJECT'S PERSISTENT MEMORY.**
> Any coding agent — Claude Code, on any account, on any machine — that opens this repo MUST:
> 1. Read this file COMPLETELY before doing anything else.
> 2. Read `.cursor/master-plan.md` next (the full spec).
> 3. Do the assigned task.
> 4. Before finishing, UPDATE this file (see "Update Protocol" below). Never skip this step — it is the only reason this system works across different sessions/accounts/people.

---

## Update protocol (follow exactly, every session, no exceptions)

When you finish a task, before ending the session:

1. Add ONE new line to **Completed Tasks Log** — never delete or rewrite old entries. Format: `- [YYYY-MM-DD HH:MM] [agent identity] — [one-line summary]`
2. Update **Current State** to reflect the new reality.
3. Update **Next Steps** — be specific enough that an agent with zero prior context could pick it up.
4. If you made any decision not explicitly covered by `master-plan.md`, record it under **Key Decisions Made** so it isn't re-litigated or contradicted later.
5. If you hit something unclear or blocking, add it to **Open Questions / Blockers** (and remove it once resolved).
6. `git add -A && git commit -m "..."` with a clear message. Push if a remote exists.
7. Print the final, updated contents of **Current State** and **Next Steps** in your last message so the human can copy them into Gemini for the next prompt-generation round.

---

## Project identity

**Piramida Backstage** — a 48-hour JunctionX Tirana hackathon build for the AADF "Pyramid Backstage Challenge." Turns fragmented event coordination at the real Pyramid of Tirana (MVRDV, 2023) into one platform: browse the actual building in 3D-feeling radial floor plans, book a space, get an instant quote, auto-generated setup/teardown tasks, AI chatbot booking, organizer dashboard. Full spec lives in `.cursor/master-plan.md`. Challenge brief lives in `.cursor/challenge-brief.md`.

## Roles & file ownership (do not blur these — see master-plan §5 for full detail)

| Role | Owns | Never touches |
|---|---|---|
| **Backend Dev** | `/app/api/`, `/lib/`, `/supabase/`, `/types/` | `/components/`, page files, `tailwind.config.ts` |
| **Frontend Dev** | `/app/(marketing)/`, `/app/spaces/`, `/app/book/`, `/app/dashboard/`, `/components/`, `/public/`, `tailwind.config.ts`, `styles/` | `/lib/`, `/api/`, `/supabase/` |

Both read `/types/` freely. Backend Dev owns writing to it.

---

## Current State

- **Phase:** Phase 4 partially complete as of 2026-06-20. Both frontend and backend have done their first slice. Supabase project not yet created — API routes fall back to mock data.
- **Stack:** Next.js 16.2.9 (App Router) + TypeScript + Tailwind CSS v4 + pnpm. `npx tsc --noEmit` passes with zero errors.
- **What exists now (frontend):**
  - **`app/(marketing)/page.tsx`** — landing page: GSAP scroll-scrubbed canvas hero (300 frames from `/frames/hero/`), stats panel top-right, CTA buttons bottom-right, manifesto 2-col section, 4-feature strip, dark CTA. Framer Motion hero removed.
  - **`app/spaces/[code]/page.tsx`** — space detail: GSAP scroll-scrubbed canvas hero (100 frames, ScrollVideo), breadcrumb top-left, status badge bottom-right, content grid with 4 metrics, specs MonoTable, BookingPanel with live estimate + POST /api/events. Gradient removed.
  - **`app/spaces/page.tsx`** — floor selector elevation view: BrandStrip + FloorSelector (left) + FloorPlan SVG (right) + MiniMap
  - **`app/dashboard/page.tsx`** — enterprise dashboard: KPI strip with donut rings, day-timeline SVG, occupancy segmented bars, conflict panel
  - **`app/dashboard/events/page.tsx`** — event register: dark header, filter tabs, expand rows with Fragment key pattern, skeleton loading
  - **`app/dashboard/inventory/page.tsx`** — inventory: grouped table with AvailBar, type SVG icons, KPI tiles
  - **`app/dashboard/conflicts/page.tsx`** — conflict resolution: severity groups, interactive resolution checklist
  - **`app/dashboard/layout.tsx`** + **`components/dashboard/sidebar.tsx`** — fixed 220px dark sidebar with lime active state
  - `components/ui/` — all 7 primitives: Cube, Pill, Callout, MonoTable, StatusDot, SectionDivider, BrandStrip
  - `components/pyramid/scroll-video.tsx` — full GSAP canvas component: cover-fit render, frame counter (DOM ref), progress bar (DOM ref), overlayTitle/overlaySubtitle/overlayLabel text block, children slot for overlays, loading skeleton, window resize handler
  - `components/pyramid/` — all 5 floor plan SVGs, FloorSelector, FloorPlan wrapper, MiniMap
  - `components/booking/`, `components/chatbot/` — stubs
  - `public/frames/hero/` — 300 frames (`0001.jpg`–`0300.jpg`, 38.55 MB total, 132 KB avg), moved from `background2/` via `scripts/process-frames.mjs`
  - `public/references/` — all 11 reference images served at `/references/...`
  - `public/pyramid/` — MVRDV photography
- **What exists now (backend):**
  - `supabase/migrations/0002_seed.sql` — 53 spaces (4 hero + 15 A-ring + 16 BE exterior + 6 L3 boxes + 4 roof boxes + 8 basement), 11 asset types, 3 demo events with spaces/assets/tasks/quote wired
  - `lib/db/client.ts` — `createClient()` (browser SSR) + `createAdminClient()` (service-role, for API routes)
  - `lib/db/queries/spaces.ts` — `listSpaces`, `getSpaceByCode`, `searchAvailableSpaces` with real Supabase queries + mock-data fallback when env vars absent
  - `app/api/spaces/route.ts` — GET with zod-validated floor/capacity/features/date filters
  - `app/api/spaces/[code]/route.ts` — GET single space + upcoming bookings
  - `app/api/spaces/availability/route.ts` — GET availability search (from/to required, capacity/features optional)
  - `lib/db/mock-data.ts` — in-memory mock store (events, spaces, assets, conflicts) used by all other API routes
  - All other API routes (events, conflicts, inventory, dashboard overview, quotes, tasks) wired to mock data
- **Tailwind v4 note:** No `tailwind.config.ts` — tokens live in `app/globals.css` `@theme` block. This is correct for v4.
- **Last updated:** 2026-06-20, Claude Code (claude-sonnet-4-6) — merged frontend + backend state.

## Completed Tasks Log

*(append-only — newest at the bottom — never delete history)*

- [2026-06-19] Master plan authored (`.cursor/master-plan.md`) — design system, repo structure/ownership, DB schema, API contract, 48h timeline, demo script, Gemini prompt-recipe template.
- [2026-06-19] Challenge brief saved (`.cursor/challenge-brief.md`).
- [2026-06-19] 11 reference images identified by content (aerial/elevation/interior photos of the real Pyramid + 3 screenshots of the existing piramida.edu.al floor-plan UI). Three-phase bootstrap prompt issued to Claude Code. **Session was switched before Phase 2 completion could be confirmed.**
- [2026-06-20 ~00:10] Claude Code (claude-sonnet-4-6) — Phase 2 verified and completed: identified all 11 `Screenshot 2026-06-19 at …` PNGs in project root by visual content, copied and renamed them into `.cursor/references/` with correct semantic names (all `.png`).
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 3 complete: Next.js 16 bootstrapped, all locked deps installed, design tokens in Tailwind v4 CSS, types + DB schema + all folder stubs + 7 UI primitives + Ground Floor SVG + all pyramid components written. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 4 frontend: enterprise dashboard rewrite (KPI donut rings, day timeline, occupancy bars), dashboard sidebar, all 3 dashboard sub-pages (events, inventory, conflicts), all 4 missing SVG floor plans (L3, L-1, Roof, Exterior), mock data API layer.
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 4 backend slice 1: `0002_seed.sql` (53 spaces, 11 asset types, 3 demo events, tasks, quote), `lib/db/client.ts` (browser + admin clients), `lib/db/queries/spaces.ts` (real Supabase + mock fallback), all 3 spaces API routes with zod validation. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Landing page + floor selector: built `app/(marketing)/page.tsx` (Framer Motion scroll cross-fade hero, 3 images, stats panel, manifesto, feature strip, dark CTA); updated `components/pyramid/floor-selector.tsx` (accurate pill positions, leader lines, elevation tags, exterior offset left); added `console.log` floor selection in spaces page. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — GSAP Scroll-Video Canvas Engine: wrote `scripts/process-frames.mjs` (moved 300 frames from `background2/` → `public/frames/hero/`, zero-padded naming, source dir deleted, 38.55 MB total); rewrote `components/pyramid/scroll-video.tsx` (cover-fit canvas, DOM-ref frame counter + progress bar, overlayTitle/Subtitle/Label text block, children slot, loading skeleton, resize handler, GSAP cleanup); updated landing page to use ScrollVideo (removed Framer Motion hero, 3-image cross-fade replaced by canvas engine); updated space detail page to use ScrollVideo (first 100 frames, breadcrumb + status badge as children, linear-gradient removed, formatFloor helper). `tsc --noEmit` clean.

## Next Steps

### Frontend Dev (Aron) — immediate priorities:

1. **Booking flow** (`app/book/page.tsx`, `app/book/confirmation/page.tsx`): Date/time/attendees form + inline quote display. Wire to `POST /api/events` + `POST /api/quotes`. Confirmation shows event ref code, task list, asset reservation summary.

2. **Chatbot UI** (`components/chatbot/chatbot-cube.tsx`, `components/chatbot/chatbot-panel.tsx`): Floating dark cube (bottom-right) that expands into a panel. Wire to `/api/chatbot` once GEMINI_API_KEY is in `.env.local`.

3. **Spaces page live data**: Replace `DEMO_SPACES` array in `app/spaces/page.tsx` with a fetch from `/api/spaces?floor=<activeFloor>`. The API is already live and returns `ListSpacesResponse`.

### Backend Dev (Stiven) — immediate priorities:

1. **Create Supabase project** and add env vars to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   GEMINI_API_KEY=...
   ```
2. **Run migrations**: `supabase db push` (runs `0001_init.sql` then `0002_seed.sql`). Verify: `SELECT count(*) FROM spaces;` → should return 53.
3. **Implement events API**: `POST /api/events` + `GET /api/events` + `GET /api/events/[id]` in `lib/db/queries/events.ts`. Use same pattern as spaces (Supabase + mock fallback, zod validation). See master-plan §7 for `CreateEventRequest`, `ListEventsResponse`, `GetEventResponse`.
4. **Implement quotes**: `POST /api/quotes` + `POST /api/quotes/[id]/accept` (quote generation in `lib/pricing/quote.ts`, task generation in `lib/tasks/generate.ts`).

**Sync point:** once Supabase is live, frontend swaps `DEMO_SPACES` for a fetch call — `/api/spaces?floor=l0` returns real data with live availability colors.

## Open Questions / Blockers

- **Supabase project not yet created** — all 3 spaces API routes work via mock-data fallback until env vars are set. Once set, routes automatically switch to real Supabase queries.
- `public/references/` now exists with all 11 images — FloorSelector and landing page images resolve correctly.
- `pnpm tsc --noEmit` fails due to an unrelated pnpm native build script error (sharp, unrs-resolver). Use `npx tsc --noEmit` instead.
- GEMINI_API_KEY not yet configured — `/api/chatbot` is stubbed.
- GEMINI_API_KEY not yet configured — `/api/chatbot` is stubbed.

## Key Decisions Made

- **Mock-data fallback in query layer**: `lib/db/queries/spaces.ts` checks `isSupabaseConfigured()` (env vars present + URL starts with `http`) and falls back to `lib/db/mock-data.ts` if not. This keeps the frontend working during development before Supabase is wired up.
- **`createAdminClient()` uses service-role key**: API routes use the service-role client (bypasses RLS). The browser client uses anon key. RLS policies are not defined in 0001_init.sql — add them before production.
- **Zod v4 compatibility**: The project has `zod ^4.4.3`. Schemas use only v3-compatible APIs (`z.object`, `z.string`, `z.coerce.number`, `z.enum`, `.transform`, `.optional`, `.safeParse`). Avoided `.flatten()` on ZodError since that API changed in v4.
- **Reference image extensions are `.png`, not `.jpg`**: The 11 source images were macOS screenshots, all PNG. master-plan §0 lists `.jpg` for 9 of them — ignore those extensions.
- **`aerial-top-down-day` does not exist**: No daylight straight-down aerial was in the source image set.
- **Tailwind v4, not v3**: `create-next-app` installed Tailwind v4. There is NO `tailwind.config.ts` — all tokens live in `app/globals.css` inside `@theme {}`. This is correct. Do not create a `tailwind.config.ts`.
- **Package name is `piramida-backstage`** (lowercase): The directory is `PiramidaBackstage` but npm requires lowercase names. `package.json` uses `"name": "piramida-backstage"`.
- **Ground Floor SVG geometry**: 16 radial spaces (A1–A16) at every 22.5° centered angle, each ~16.5° arc span between corridor wedges. BOX_INNER=178, BOX_OUTER=318, center at (400,400). A17–A19 are tiny transition connectors — may be removed in polish pass.
- **API routes use mock data (lib/db/mock-data.ts)**: All non-spaces API routes return real-looking data from the in-memory mock store. Spaces routes use Supabase with mock fallback.
- **Landing page uses GSAP ScrollVideo, not Framer Motion cross-fade**: 300 frames at `/public/frames/hero/0001.jpg`–`0300.jpg`. Framer Motion hero fully removed.
- **Space detail hero uses ScrollVideo with frameCount=100**: Pulls first 100 frames of the same hero sequence. No separate `detail-sample/` directory (background1 was absent).
- **No CSS gradients anywhere**: Scrim is flat `rgba(10,10,10,0.38)` in ScrollVideo. Space detail page gradient removed.
- **`formatFloor()` helper in `app/spaces/[code]/page.tsx`**: Replaces repeated inline `.replace()` chains throughout the file.
- **FloorSelector exterior pill offset left**: Exterior boxes (BE1–BE16) ring the building perimeter. The pill is positioned at `left: 14%, top: 62%` to appear outside/left of the building in the elevation photo, distinguishing it from the stacked center pills.

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/gemini-operator-brief.md` — the document that makes Gemini the prompt-generating orchestrator for this project
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (all `.png`)
