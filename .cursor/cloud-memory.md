# Cloud Memory — Piramida Backstage

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

- **Phase:** Phase 7 complete — Full end-to-end booking pipeline live + Live Map Integration. Floor plans fetch real data from live API (`/api/spaces?floor=…`). POST /api/events auto-generates quote + 8 tasks. Quote acceptance confirms event with no duplication. Chatbot Groq tool loop fully wired.
- **Stack:** Next.js 16.2.9 (App Router) + TypeScript + Tailwind CSS v4 + pnpm. `npx tsc --noEmit` shows 3 pre-existing errors in `app/api/chatbot/route.ts` and `lib/ai/tools.ts` (missing `openai` module).
- **FloorSelector background:** Now `section-bb.jpeg` (1600×910, aspect 1.758), `background-size: contain`. Pill positions calibrated to architectural slabs: roof 35%, l3 42%, l0 50%, b1 66%, exterior 50%/12% left.
- **Plan backgrounds:** `FloorPlan` component now renders the correct plan sketch behind each floor's SVG (plan-groundfloor.jpeg for l0, plan-level-01-basement.jpeg for l_minus_1, plan-level-03.jpeg for l3, plan-level-04.jpeg for roof, plan-topview.jpeg for exterior). SVG overlays use `preserveAspectRatio="xMidYMid meet"` for alignment.
- **SVG Alignment:** All 5 floor plan SVGs wrapped in absolute-position containers over the plan background. Ground floor SVG viewBox updated from `0 0 800 800` to `0 0 1000 1000` with center at `500,500` and all radii scaled ×1.25 to match the new coordinate space. Other floor SVGs retain `0 0 800 800`.
- **Ground floor plan:** Strict octagonal SVG using only `<polygon>` elements. viewBox `0 0 1000 1000`, center CX/CY=500/500. BOX_OUTER=381, BOX_INNER=223, SITE_R=431, RING_R=203, ATRIUM_R=85 — all scaled ×1.25 from previous values. All 19 spaces (A1–A19) clickable. Hardcoded UI elements (floor label, legend, scale bar, north indicator, tooltip bounds) repositioned for new viewBox dimensions.
- **Spaces page:** Replaced static `DEMO_SPACES` constant with live `useEffect` fetch to `/api/spaces?floor=${activeFloor}`. Loading state shown in the available-count badge. Data flows through `<FloorPlan>` → `<GroundFloorPlan>` with real availability colors.
- **UI Airgap (active):** Public BrandStrip only links to `/spaces`. Dashboard lives behind `/dashboard` with its own sidebar — no shared navigation with the public site.
- **Frontend (complete):**
  - All 5 floor plan SVGs (ground octagonal, L3, L-1, Roof, Exterior), FloorSelector, MiniMap, ScrollVideo (GSAP canvas, Glass Hero Plate)
  - Landing page: dual flythrough (300 + 265 frames), Interlude stats, bone floor-selector section
  - Space detail: ImageGallery + dark header + metrics + MonoTable + BookingPanel
  - Booking flow: `/book/page.tsx` + QuoteSummary, POSTs to `/api/events`, redirects to confirmation
  - Dashboard: overview KPIs (live from API), events register (live from API + lazy task fetch), inventory, conflicts
  - Chatbot: floating 56px cube, ChatbotPanel with POST /api/chatbot, ChatbotRoot path-aware wrapper
- **Backend (complete):**
  - All API routes: `/api/events`, `/api/events/[id]`, `/api/quotes`, `/api/quotes/[id]`, `/api/tasks`, `/api/chatbot`, `/api/spaces`, `/api/spaces/[code]`, `/api/spaces/availability`, `/api/conflicts`, `/api/dashboard/overview`, `/api/assets`, `/api/inventory`
  - Supabase provisioned, schema applied, seeded
  - Chatbot: on Groq llama-3.3-70b-versatile via openai SDK

## Completed Tasks Log

*(append-only — newest at the bottom — never delete history)*

- [2026-06-19] Master plan authored (`.cursor/master-plan.md`) — design system, repo structure/ownership, DB schema, API contract, 48h timeline, demo script, Gemini prompt-recipe template.
- [2026-06-19] Challenge brief saved (`.cursor/challenge-brief.md`).
- [2026-06-19] 11 reference images identified by content (aerial/elevation/interior photos of the real Pyramid + 3 screenshots of the existing piramida.edu.al floor-plan UI). Three-phase bootstrap prompt issued to Claude Code. **Session was switched before Phase 2 completion could be confirmed.**
- [2026-06-20 ~00:10] Claude Code (claude-sonnet-4-6) — Phase 2 verified and completed: identified all 11 `Screenshot 2026-06-19 at …` PNGs in project root by visual content, copied and renamed them into `.cursor/references/` with correct semantic names (all `.png`).
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 3 complete: Next.js 16 bootstrapped, all locked deps installed, design tokens in Tailwind v4 CSS, types + DB schema + all folder stubs + 7 UI primitives + Ground Floor SVG + all pyramid components written. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 4 frontend: enterprise dashboard rewrite (KPI donut rings, day timeline, occupancy bars), dashboard sidebar, all 3 dashboard sub-pages (events, inventory, conflicts), all 4 missing SVG floor plans (L3, L-1, Roof, Exterior), mock data API layer.
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 4 backend slice 1: `0002_seed.sql` (53 spaces, 11 asset types, 3 demo events, tasks, quote), `lib/db/client.ts` (browser + admin clients), `lib/db/queries/spaces.ts` (real Supabase + mock fallback), all 3 spaces API routes with zod validation. `tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Landing page + floor selector, GSAP scroll-video, UX audit, booking flow UI, chatbot cube+panel, UI airgap, design system compliance sweep. `tsc --noEmit` clean throughout.
- [2026-06-20 ~session-handoff] Claude Code (claude-sonnet-4-6) [Aron/frontend] — Octagonal floor plan redrawn (strict polygon geometry, A1–A19 clickable → router.push), tiered mini-map, watermark fixes. `npx tsc --noEmit` clean.
- [2026-06-20 13:15] OpenCode (opencode) [Aron/frontend] — Comprehensive UI/Copy Sweep: emoji removed, Title Case → UPPERCASE/lowercase, `<h1>` elements added to 3 dashboard pages, hardcoded fonts → CSS vars, brutalist hover states. `npx tsc --noEmit` clean.
- [2026-06-20 13:31] Claude Code [Aron/frontend] — Session Init: fixed M4 mock images, wired dashboard events to API (M5), hooked up Chatbot UI fetch logic.
- [2026-06-20 14:03] Claude Code [Aron/frontend] — Architectural Correction: Redrew octagonal ground floor plan (strict polygon geometry), wired direct space-click navigation, updated mock data with explicit A1–A19 entries.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/backend] — Full backend wiring: lib/db/queries/events.ts, lib/ai/{tools,gemini,tool-handlers}.ts, all events/quotes/tasks/chatbot API routes with Zod validation, Gemini 2.5-flash chatbot with 5 function tools. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/backend] — Supabase provisioned via MCP: schema + seed applied (53 spaces, 11 assets, 3 demo events, 6 tasks, 1 quote). `.env.local` created with URL + anon key. /api/conflicts and /api/dashboard/overview rewired to live Supabase queries. `npx tsc --noEmit` clean.
- [2026-06-20 14:15] Claude Code [Aron/frontend] — Calibration: Replaced low-res elevation background with mvrdv-28.jpg (1333×1000), fixed topographic pill alignment (roof 7%, l3 30%, l0 58%, b1 76%, exterior 64%/12%), locked aspect-ratio to eliminate stretch distortion.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/backend] — Groq migration: installed openai SDK, rewrote lib/ai/tools.ts in OpenAI function-calling format, rewrote /api/chatbot to use Groq baseURL with llama-3.3-70b-versatile, agentic tool loop (up to 3 rounds), updated .env.example with GROQ_API_KEY. `npx tsc --noEmit` clean.
- [2026-06-20 20:00] OpenCode [Aron/Frontend] — Topographical Calibration: Locked Floor Selector to architectural section (section-bb.jpeg), calibrated pill positions (roof 35%, l3 42%, l0 50%, b1 66%, exterior 50%/12%), set plan backgrounds behind SVG floor plans (plan-groundfloor.jpeg etc.), wrapped SVGs in absolute overlay containers with preserveAspectRatio alignment. `npx tsc --noEmit` — pre-existing errors only.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/backend] — Booking Pipeline: POST /api/events now auto-generates quote + 8 tasks (setup, AV, reception, security, teardown, cleaning) immediately on creation. acceptQuote fixed FK bug (depends_on_task_id null on insert), no longer duplicates tasks. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/QA] — Automated QA: Set up Playwright (@playwright/test 1.61.0 + chromium), wrote exhaustive E2E space data audit script (`tests/spaces-audit.spec.ts`). Fetches all spaces from live API (all 5 floors), visits every detail page, checks h1 name, capacity in DOM, and primary image naturalWidth. Writes `spaces-audit-report.md`. `npx tsc --noEmit` clean.
- [2026-06-20 20:30] OpenCode [Aron/Frontend] — Live Map Integration: Wired interactive floor plans to real API data (`/api/spaces?floor=…`) and tuned SVG polygon radii (viewBox 0 0 1000 1000, center 500,500, radii ×1.25) to match blueprint sketches.
- [2026-06-20 22:00] OpenCode [Aron/Frontend] — Bugfix: Wired dynamic space data to DOM (H1, Capacity, Images) and patched missing A-ring photo URLs + renamed `public/Sketches/` → `public/sketches/` for case-sensitive URL consistency.

## Current State

- **Phase:** Phase 7 complete — Full end-to-end booking pipeline live + Live Map Integration + space detail page DOM fix.
- The space detail page (`app/spaces/[code]/page.tsx`) now guards against undefined `code` and fetch errors, preventing hang in loading state.
- Mock data (`lib/db/mock-data.ts`) A1–A19 photo_urls now point to `/sketches/` (lowercase) with distributed sketch files (plan-groundfloor, sections, isometrics).
- `public/Sketches/` renamed to `public/sketches/` for URL case-sensitivity correctness on Vercel/Linux.

## Next Steps

### RE-RUN THE SPACES AUDIT (QA Lead):
The data-binding fix is committed and pushed. QA Lead should re-run the E2E audit:
```bash
git pull
npm run dev          # terminal 1 — keep running
npx playwright test tests/spaces-audit.spec.ts   # terminal 2
# Check spaces-audit-report.md — expect all h1/capacity/img checks to pass
```

### READY FOR END-TO-END DEMO — run this checklist:
1. Start dev server: `npm run dev`
2. Submit booking via `/book` → verify `/dashboard/events` shows the new event with status `quoted` and 8 tasks already populated.
3. Open chatbot → type: "Book the Yellow Roof Box for 50 people on Friday 8pm–11pm, name Ardi Hoxha, email ardi@test.al" → verify tool calls fire (search_spaces → create_event_request → generate_quote) and chatbot returns confirmation text.
4. Hit `POST /api/quotes/{id}` (or Supabase Dashboard) → confirm event status advances to `confirmed`, tasks remain (no duplicates).
5. Rehearse demo script (master-plan §10) × 3.

### End-to-end test — booking flow ready:
6. Verify floor plan shows real availability colors by switching floors — each floor fetches `/api/spaces?floor=…`.
7. Click a space → detail page loads with ImageGallery populated from `photo_urls`.
8. Submit event via `/book` → check `/dashboard/events` shows it (live DB row).
9. Open chatbot → "Book Yellow Roof Box for 50 people Friday 8pm–11pm, name Ardi, email ardi@test.al" → tools fire, event appears in dashboard.
10. Accept quote via `POST /api/quotes/{id}` → tasks auto-generated and inserted.

### Demo prep:
11. Rehearse demo script (master-plan §10) at least 3 times.
12. Deploy to Vercel — add all env vars in Vercel dashboard → Environment Variables.

## Open Questions / Blockers

- `pnpm tsc --noEmit` fails due to pnpm native build script error (sharp, unrs-resolver). Use `npx tsc --noEmit` instead — passes clean.
- All 4 env vars now filled in `.env.local`. No remaining blockers for local demo.

## Key Decisions Made

- **Mock-data fallback in query layer**: `lib/db/queries/spaces.ts` checks `isSupabaseConfigured()` (env vars present + URL starts with `http`) and falls back to `lib/db/mock-data.ts` if not. This keeps the frontend working during development before Supabase is wired up.
- **`createAdminClient()` uses service-role key**: API routes use the service-role client (bypasses RLS). The browser client uses anon key. RLS policies are not defined in 0001_init.sql — add them before production.
- **Zod v4 compatibility**: The project has `zod ^4.4.3`. Schemas use only v3-compatible APIs (`z.object`, `z.string`, `z.coerce.number`, `z.enum`, `.transform`, `.optional`, `.safeParse`). Avoided `.flatten()` on ZodError since that API changed in v4.
- **Tailwind v4, not v3**: `create-next-app` installed Tailwind v4. There is NO `tailwind.config.ts` — all tokens live in `app/globals.css` inside `@theme {}`. This is correct. Do not create a `tailwind.config.ts`.
- **`overflowX: 'clip'` on landing page root div**: Using `clip` not `hidden` — `overflow: hidden` creates a new scroll context which silently kills `position: sticky` children. `clip` clips overflow without creating a scroll context.
- **Ground Floor SVG**: Strict octagonal geometry using `octPt()` / `octSector()`, pure `<polygon>` elements. A1–A19 all clickable, navigate via `router.push('/spaces/[code]')`. viewBox `0 0 1000 1000` (scaled ×1.25 from original `800 800`), center at 500,500. All radii proportionally scaled.
- **Chatbot on Groq**: `openai` SDK with `baseURL: 'https://api.groq.com/openai/v1'`, model `llama-3.3-70b-versatile`. Tools in `lib/ai/tools.ts` are OpenAI `ChatCompletionTool` format. Old `geminiTools` export is aliased to `groqTools` for backward compat. `lib/ai/gemini.ts` is dead code (no longer imported).
- **Reference image extensions are `.png`, not `.jpg`**: The 11 source images were macOS screenshots, all PNG.
- **Landing page uses GSAP ScrollVideo**: 265 frames at `/public/frames/detail-sample/`, `reversed=true`. Space detail: 300 frames at `/public/frames/hero/`, `reversed=true`.
- **FloorSelector background (V1)**: `mvrdv-28.jpg` (1333×1000px), aspect-ratio locked. Pill positions (% from top): roof 7%, l3 30%, l0 58%, b1 76%, exterior 64% left / 12% top.
- **FloorSelector background (V2 — current)**: `section-bb.jpeg` (1600×910px, `public/sketches/`). Architectural cross-section from official MVRDV drawings. Pill positions (% from top): roof 35%, l3 42%, l0 50%, b1 66%, exterior 50% top / 12% left. `background-size: contain` (not cover) to prevent cropping.
- **Plan sketch backgrounds**: Each floor's SVG sits inside an absolute container with the official plan sketch as CSS background. Ground floor SVG viewBox is `0 0 1000 1000`; other floors use `0 0 800 800`. All use `preserveAspectRatio="xMidYMid meet"` for centered alignment.
- **Image extension note**: Official sketches in `public/sketches/` are `.jpeg` (not `.jpg` or `.png`).

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (all `.png`)
