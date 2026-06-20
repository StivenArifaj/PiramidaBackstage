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
  - **`app/(marketing)/page.tsx`** (served at `/`) — continuous scroll experience: dark cinematic div (`overflowX: 'clip'`) contains BrandStrip + Flythrough 1 (stats panel + "organizer view" button at bottom:64px) + Interlude + Flythrough 2 (no CTA); followed immediately by bone-colored floor selector section (FloorSelector + FloorPlan, same layout as `/spaces` page, `DEMO_SPACES` data, "view as page ↗" escape link). React fragment `<>` root.
  - **`app/spaces/page.tsx`** — standalone floor selector page (still exists and works independently at `/spaces`).
  - **`app/spaces/[code]/page.tsx`** — space detail: dark page header (breadcrumb + h1 + status badge) + `<ImageGallery>` (shows photo_urls or SVG-hatch placeholder) + content grid (4 metrics, MonoTable, BookingPanel). ScrollVideo removed.
  - **`components/ui/image-gallery.tsx`** — brutalist gallery: SVG 30°-hatch placeholder, crosshair overlay, view-label + counter, ← → nav, 6-up thumb strip with lime accent bar.
  - **`components/pyramid/scroll-video.tsx`** — **Glass Hero Plate** (master-plan override: rounded-3xl + rounded-full for dots). Fill: `rgba(255,255,255,0.03)`, `blur(40px)`, `border rgba(255,255,255,0.10)`. Top-left: three macOS dots — red `#e63946`, yellow `#f9c74f`, green `#97C459` (MVRDV box palette), 12×12px. Typography: HUD label + dot → `#c8da2b` lime with glow; H1 → pure `#ffffff` + `drop-shadow(0 2px 12px rgba(0,0,0,0.55))`; subtitle → `#c8da2b` lime with glow; overlayLabel → `rgba(255,255,255,0.65)` + shadow. Corner mask (Ezgif): untouched.
  - **`components/pyramid/floor-plans/ground-floor.tsx`** — **strict octagonal geometry**, zero SVG arcs. `octPt()` (ray-to-octagon intersection) + `octSector()` (straight-sided trapezoids). All rings are `<polygon>` elements; A1–A19 clickable.
  - **`components/pyramid/mini-map.tsx`** — **stepped pyramid elevation**, 5 tiers (RF→L3→L0→B1→EX) widening toward base. Active tier lime-filled with left accent bar + right dot.
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
- **Last updated:** 2026-06-20, Claude Code (claude-sonnet-4-6) [Aron/frontend] — Full system Playwright audit complete. `docs/audit-report.md` generated (2 Critical, 5 High, 6 Medium, 5 Low Polish).

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
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — UX Audit, Video Swap & Scroll-Pin Refactor: (1) wrote `scripts/snapshot.mjs` Playwright visual audit; (2) fixed CSS sticky break — root div `overflowX: 'hidden'` → `'clip'` (hidden creates scroll context that kills sticky, clip does not); (3) swapped video sources — landing now uses `/frames/detail-sample/` (265 frames, reversed: wide city → building facade), space detail now uses `/frames/hero/` (300 frames, reversed: aerial → interior); (4) increased overlay title from `clamp(32px,5vw,68px)` to `clamp(56px,7vw,96px)`, changed h2 → h1, reduced scrim opacity 0.38 → 0.22. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — UX Layout Refactor & Geometric Watermark Masking: (1) created `components/ui/image-gallery.tsx` — brutalist gallery, SVG hatch placeholder, thumb strip with accent border, no images/gradients/rounded corners; (2) refactored `app/spaces/[code]/page.tsx` — removed ScrollVideo, added dark page header (breadcrumb+h1+status badge) + ImageGallery showing real photo_urls or placeholder; (3) refactored `app/(marketing)/page.tsx` — dual flythrough: hero frames (300, reversed) → interlude 3-col stat block → detail-sample frames (265, reversed), manifesto + features below; (4) deleted `app/page.tsx` (was shadowing `(marketing)/page.tsx`, violating master-plan §5); (5) added Option-A watermark mask to `scroll-video.tsx` — solid 224×40px `concrete-black` block, bottom-right, zIndex 4, "[MASK // WM]" JetBrains Mono label — covers Ezgif attribution in all 565 frames (300 hero + 265 detail-sample). `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — UI Bug Fixes, Content Purge & Centre Watermark: (1) PURGED all marketing copy from `app/(marketing)/page.tsx`; (2) FIXED button overlap — CTAs raised to `bottom: 64px`; (3) ADDED centre watermark blur — 420×88px `backdropFilter: blur(12px)` div. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Premium Watermark HUD & Continuous Scroll Flow: (1) REPLACED ugly 420×88px blur smudge in `scroll-video.tsx` with a tight glassmorphic HUD panel — auto-sized flex row, `blur(12px) bg-white/10 border-white/20`, lime live-dot + "PIRAMIDA BACKSTAGE // FEED ACTIVE" in 8px JetBrains Mono; (2) REFACTORED `app/(marketing)/page.tsx` as continuous scroll — dark cinematic section (BrandStrip + F1 + Interlude + F2) closes, then a bone-colored floor selector section slides up naturally; (3) REMOVED all "explore spaces"/"open floor plans" CTAs (F1 now only shows "organizer view", F2 has no CTA); (4) EMBEDDED full FloorSelector + FloorPlan from `/spaces` inline at the bottom of the landing page with same layout/data — `DEMO_SPACES`, `activeFloor` state, `FLOOR_LABELS`, available count badge, "view as page ↗" escape hatch link. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Added macOS window controls and enhanced text vibrancy on the Glass Hero Plate: three MVRDV-colored dots (red/yellow/green) pinned top-left; HUD label + dot switched to `#c8da2b` lime with glow `drop-shadow`; H1 → pure `#ffffff` with `drop-shadow(0 2px 12px rgba(0,0,0,0.55))`; subtitle → lime with glow; overlayLabel → white/65 with shadow. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Final UI Polish: Transformed watermark mask into a premium Glass Hero Plate containing the main typography. Deleted separate text-block div (left:48px). All hero copy (HUD label, overlayLabel, H1, subtitle) now lives INSIDE the glass plate. Plate: `bottom:10% width:85% maxWidth:1024px minHeight:280px p:48px borderRadius:24px blur(40px) bg-white/10 border-white/20 flex-col items-center text-center zIndex:20`. Children slot raised to zIndex:30. Frame counter raised to zIndex:30. Hard black corner mask untouched. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Refactored watermark mask to premium liquid glass, added rounded corners, and fixed z-index overlapping: mask moved before text in DOM, zIndex:10; text block + children wrapper raised to zIndex:20; mask restyled to `borderRadius:24px blur(40px) rgba(255,255,255,0.05) border rgba(255,255,255,0.10) boxShadow shadow-2xl`; repositioned to `bottom:8% width:90% maxWidth:800px height:180px`; label opacity dimmed to 0.38 so H1 dominates visually.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Emergency fix: resized and repositioned glass watermark mask to actually cover the BSM text. Replaced the tiny `whiteSpace: nowrap` pill at `top:58%` with a wide glass block: `bottom:15% width:80% maxWidth:900px height:10rem`, `blur(24px) rgba(0,0,0,0.20) border rgba(255,255,255,0.10)`, label centered vertically+horizontally inside. `npx tsc --noEmit` clean.
- [2026-06-20 ~session-handoff] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Repo sync, watermark label fix, octagonal floor plan, tiered mini-map: (1) `git pull` — synced 586 files from remote (previous session had pushed); (2) fixed watermark HUD label in `scroll-video.tsx`: added `[ ]` brackets → `[ PIRAMIDA BACKSTAGE // FEED ACTIVE ]`; (3) rewrote `components/pyramid/floor-plans/ground-floor.tsx` — deleted ALL circular arcs, replaced with strict octagonal geometry using `octPt()` (ray-to-octagon intersection) and `octSector()` (straight-sided trapezoids, zero `A` arc commands) — outer/inner/atrium all `<polygon>` elements, corridor spokes are `<line>` elements, A1–A19 all represented; (4) redesigned `components/pyramid/mini-map.tsx` — replaced flat triangle silhouette with a 5-tier stepped pyramid elevation (Roof→L3→L0→B1→EX, each tier steps outward, active tier lime-filled with left accent bar + right indicator dot); `app/(marketing)/page.tsx` unchanged (continuous scroll already in place from previous session). `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Final sweep: (1) silenced Ezgif corner mask in `scroll-video.tsx` — removed border, borderRight, and `[ MASK // WM ]` text label; now a pure `var(--color-concrete-black)` 224×40px block (invisible to users); (2) replaced INTERLUDE_LINES in `app/(marketing)/page.tsx` with factual challenge-brief data — 80+ spaces / Auto-generated quotes / Conflict detection. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Executed system-wide Playwright audit across all 11 routes and generated exhaustive structural fix list at `docs/audit-report.md`. 2 Critical, 5 High, 6 Medium, 5 Low Polish issues identified. All APIs return 200. No JS runtime errors.

## Next Steps

> Full audit report at `docs/audit-report.md` — fix in priority order:

### CRITICAL (blocks demo):
1. **[C1] Implement `app/book/page.tsx`** — currently a blank stub. Needs space picker, date/time/attendees form, live quote, wire to `POST /api/events`, redirect to `/book/confirmation?ref=...`.
2. **[C2] Implement chatbot** (`components/chatbot/chatbot-cube.tsx` + `chatbot-panel.tsx`) — floating dark cube bottom-right → expandable chat panel → wire to `POST /api/chatbot` (GEMINI_API_KEY required). Mount in root `app/layout.tsx`.

### HIGH (design-system violations):
3. **[H1] Remove `rounded-full` from `components/ui/pill.tsx:17`** — floor selector pills violate no-rounded-corners rule. Replace with hard rectangular border.
4. **[H2] Fix dashboard KPI font** — `app/dashboard/page.tsx:241` uses `fontFamily: D` (Space Grotesk) for large KPI numbers. Change to `fontFamily: M` (JetBrains Mono).
5. **[H3] Fix inventory KPI font** — `app/dashboard/inventory/page.tsx` KPI strip (11, 1082, 139, 0) uses Space Grotesk. Change to JetBrains Mono.
6. **[H4] Add `aria-label` to ImageGallery nav buttons** — `components/ui/image-gallery.tsx` ← → buttons have no accessible label.
7. **[H5] Interlude "80+ spaces" stat label in Space Grotesk** — `app/(marketing)/page.tsx:148`. Numeric portions of interlude stats should use mono.

### MEDIUM:
8. **[M4] Add photo URLs to A-ring mock spaces** — `lib/db/mock-data.ts` A1–A16 have `photo_urls: []`. Add 3–4 real image URLs so gallery doesn't show hatch placeholder during demo.
9. **[M5] Replace hardcoded `UPCOMING` array in dashboard** — `app/dashboard/page.tsx` has static attendee counts that don't match the API. Drive from `/api/dashboard/overview` response.
10. **[M2] Add H1 headings to `/dashboard`, `/dashboard/inventory`, `/dashboard/conflicts`**.

### Backend priorities (Stiven):
- Create Supabase project, add env vars to `.env.local`
- Run migrations: `supabase db push`
- Implement `POST /api/events`, `POST /api/quotes`, `POST /api/chatbot`

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
- **Landing page uses GSAP ScrollVideo with detail-sample frames**: 265 frames at `/public/frames/detail-sample/`, `reversed=true` (starts frame 265 wide city, scrolls to frame 1 building facade). Framer Motion hero fully removed.
- **Space detail hero uses ScrollVideo with hero frames**: 300 frames at `/public/frames/hero/`, `reversed=true` (starts frame 300 aerial, scrolls to frame 1 interior). Front elevation (detail-sample) is the landing video; drone aerial (hero) is the detail page video.
- **`overflowX: 'clip'` on landing page root div**: Using `clip` not `hidden` — `overflow: hidden` creates a new scroll context which silently kills `position: sticky` children. `clip` clips overflow without creating a scroll context. This is a critical distinction.
- **ScrollVideo overlay title is `<h1>`**: Always the primary heading. Font size `clamp(56px, 7vw, 96px)` per master-plan §4 (64–96px hero display). Scrim is flat `rgba(10,10,10,0.22)` — lighter to show video quality.
- **`app/page.tsx` deleted**: The root `app/page.tsx` was shadowing `app/(marketing)/page.tsx`, violating master-plan §5. Deleted to restore intended routing. `app/(marketing)/layout.tsx` is minimal `<>{children}</>` — no wrapper issues.
- **Watermark masking — two-layer strategy**: (a) Option-A hard block: 224×40px solid `var(--color-concrete-black)` at `bottom:4px right:0` zIndex 4 — covers Ezgif.com corner attribution in all 565 frames; (b) Centre blur: 420×88px `backdropFilter:blur(12px)` div at `left:50% top:58% transform:translate(-50%,-50%)`, `backgroundColor:rgba(255,255,255,0.07)`, zIndex 3, pointerEvents:none — covers "BLEC!STRAKOSHA MEDIA 4K" videographer mark. Position derived from cover-fit math: source ~960×660 on 1920×1080 → screen x=720 (~50%), y=550 (~58%) on 1440×900. Authorised design-system exception for blur only.
- **ScrollVideo CTA children at bottom: 64px**: CTAs passed as `children` to ScrollVideo are absolutely positioned at `bottom: 64px` to clear the hard watermark-mask block (extends to 44px from bottom: 4px offset + 40px height). Was previously `bottom: 18px`, causing visual overlap. This constraint is in the caller (`page.tsx`), not in `scroll-video.tsx` itself.
- **Landing page root is `<>` fragment**: `app/(marketing)/page.tsx` returns a React fragment `<>` to allow the dark cinematic `<div>` and the bone floor-selector `<div>` to be siblings with different background colors, while keeping `overflowX: 'clip'` scoped only to the dark section (where sticky flythroughs live).
- **MiniMap omitted from landing page floor selector**: The `MiniMap` component is `position: fixed` and would overlay the entire page (including the video sections) if rendered on the landing page. It is only rendered in `app/spaces/page.tsx`. Users who want the mini-map can navigate to `/spaces` via the "view as page ↗" link.
- **Centre watermark HUD is tight flex row**: Replaced 420×88px plain blur smudge with an auto-sized flex row (`padding: 10px 18px`) containing a lime 5px circle + mono text. Width ~260px, height ~33px. Looks like a deliberate broadcast overlay, not a censor block.
- **"Explore spaces" CTA removed from Flythrough 1**: With the floor selector now embedded at the bottom of the landing page scroll, the "explore spaces" link was redundant (and misleading — it would navigate to `/spaces` instead of scrolling). Only "organizer view" (→ `/dashboard`) remains as a shortcut CTA in Flythrough 1. Flythrough 2 has no CTA at all.
- **ImageGallery placeholder**: When `photo_urls` is empty, shows SVG 30°-hatch pattern (via `<pattern id="hatch-{spaceCode}">`) with crosshair + "[NO IMAGE · PLACEHOLDER]" label. PatternId uses `spaceCode` to avoid SVG `id` collisions if multiple galleries appear on one page.
- **`formatFloor()` helper in `app/spaces/[code]/page.tsx`**: Replaces repeated inline `.replace()` chains throughout the file.
- **FloorSelector exterior pill offset left**: Exterior boxes (BE1–BE16) ring the building perimeter. The pill is positioned at `left: 14%, top: 62%` to appear outside/left of the building in the elevation photo, distinguishing it from the stacked center pills.

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/gemini-operator-brief.md` — the document that makes Gemini the prompt-generating orchestrator for this project
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (all `.png`)
