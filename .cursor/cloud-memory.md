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
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/QA] — SVG Blueprint Fix: Stripped all fake filled background polygons/rects/circles from all 5 floor plan SVGs (ground, basement, L+3, roof, exterior) so real MVRDV JPEG blueprints (`public/sketches/plan-*.jpeg`, 1600×1131) show through as the base layer. Added `aspectRatio: '1600 / 1131'` to FloorPlan wrapper. Verified all SVG polygon codes (A1–A19, B1–B6, BE1–BE16, L3-*, ROOF-*, GREEN, YELLOW) match `lib/db/mock-data.ts` exactly — zero routing mismatches. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/QA] — Automated QA: Wrote Playwright test `tests/svg-overlay.spec.ts` to verify SVG polygon routing and generate visual alignment screenshots. Three tests: (1) inject highlight CSS + screenshot all 5 floors → `overlay-alignment*.png` artifacts; (2) parse aria-labels of all `g[role="button"]` elements → reconstruct space codes → assert HTTP 200 for each route; (3) real browser click on first ground-floor polygon → assert router navigates to correct `/spaces/{code}` page with `<h1>` visible and no 404. `npx tsc --noEmit` clean.
- [2026-06-20 22:00] OpenCode [Aron/Frontend] — Bugfix: Wired dynamic space data to DOM (H1, Capacity, Images) and patched missing A-ring photo URLs + renamed `public/Sketches/` → `public/sketches/` for case-sensitive URL consistency.
- [2026-06-20 23:30] Claude Code (claude-sonnet-4-6) [Stiven/Backend] — Bugfix: Resolved `ReferenceError: require is not defined` crash in `app/spaces/[code]/page.tsx`.
- [2026-06-20 23:55] Claude Code (claude-sonnet-4-6) [Stiven] — UI/Data: Locked unified space template and injected premium isometric renders and estimated data for all 53 spaces. Replaced flat blueprints with iso renders (iso-6-final, iso-4-programme, iso-1-existing), wired real MVRDV photography for exterior/L3/roof/hero spaces, updated Supabase directly via SQL for all 53 rows (0 spaces without photos). page.tsx now has rigid Breadcrumb→Hero(aspect-video)→TwoColumn(70/30 sticky) template. `npx tsc --noEmit` clean. Root cause: `framer-motion` (CJS shim) being SSR-evaluated via the old `'use client'` + client-fetch pattern in Turbopack. Fix: converted page to a pure async Server Component (no `'use client'`), fetches data directly via `getSpaceByCode()`, extracted interactive `BookingPanel` to `components/spaces/booking-panel.tsx` (`'use client'`). `/spaces/BLUE` now returns HTTP 200 with `<h1>Blue Space</h1>`, capacity 300, and primary image in DOM. `npx tsc --noEmit` clean.
- [2026-06-20] Claude Code (claude-sonnet-4-6) [Stiven/Backend] — Dashboard: Completed ops loop with quote approval, task completion API, and AI task generation sync. Added PATCH /api/quotes/[id] (accepts quote → confirmed event), GET /api/quotes (list all with event join), full PATCH /api/tasks/[id] replacing the 501 stub, new /dashboard/quotes page with Accept button and revenue totals, task completion checkboxes wired to PATCH endpoint with optimistic UI in /dashboard/events, chatbot handleCreateEvent() now calls generateTasks()+insertTasks() for full run-sheet parity with the form path, Quotes added to sidebar nav. `npx tsc --noEmit` clean.
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven+Aron/Full-Stack] — Public client tracking portal: added getEventByRef() to events query layer; created GET /api/track/[ref] (strips admin fields — no notes/tasks/phone); built app/track/[ref]/page.tsx with status pipeline (requested→quoted→confirmed), quote acceptance via PATCH /api/quotes/[id], shareable invite link (navigator.clipboard), floor-aware directions card. Confirmation page: removed /dashboard link, replaced with "Track My Booking" → /track/[ref]. Client-facing booking loop is now fully enclosed — no admin surface exposed. npx tsc --noEmit clean.
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/AI Arch] — Fix: AI "Silent Tool" bug resolved. Root cause: MAX_TOOL_ROUNDS=3 exhausted when llama chained tools without emitting text; hardcoded fallback "I've gathered the information…" fired instead of real data. Fix: replaced fallback with a forced synthesis call using tool_choice:'none' so the LLM narrates all accumulated tool results; bumped MAX_TOOL_ROUNDS to 5; added CRITICAL INSTRUCTION to both system prompts enforcing explicit data narration. Frontend (chatbot-panel.tsx) confirmed clean — no hardcoded transformations. find_ideal_space output verified as clean multi-line string. npx tsc --noEmit clean.
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/AI Arch] — Dual-Brain AI + Anti-Hallucination: Rewrote system prompts (SYSTEM_PROMPT & ADMIN_SYSTEM_PROMPT) with strict anti-hallucination rules. Restructured tools into clientTools (read-only: search_spaces, check_space_availability, list_assets_needed, find_ideal_space, submit_special_request, get_space_booking_url) and adminTools (BI + write: get_dashboard_metrics, get_pending_quotes, query_reservations, get_client_history, get_financial_metrics, get_space_utilization, create_event_request, generate_quote). Updated route.ts to split CLIENT_TOOLS/ADMIN_TOOLS accordingly. All handlers wired in tool-handlers.ts with Supabase + mock fallback. Dashboard layout confirmed passing isAdmin={true} to ChatbotCube. `npx tsc --noEmit` clean.
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven+Aron/Full-Stack] — Red Code conflict system: Added 'red_alert' to EventStatus. POST /api/events now checks for overlapping active bookings (confirmed/quoted/requested/in_progress) on the requested space before creation — returns 409 {error:'conflict'} on overlap. BookingPanel catches 409 and switches to "Conflict Detected" Red Code UI with textarea + Send Priority Request button; priority submissions bypass the conflict check and create the event with status 'red_alert' + custom notes saved to DB. /dashboard/conflicts now fetches red_alert events from /api/events and renders a RED ALERT section at the top with Override & Confirm or Reject buttons (PATCH /api/events/[id]). /dashboard/events expanded rows now show ✓ Approve Request (green) and ✕ Decline (red) admin action buttons wired to PATCH /api/events/[id] with optimistic UI update. checkSpaceConflict() added to lib/db/queries/events.ts (Supabase + mock fallback). `npx tsc --noEmit` clean (zero errors).
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/Backend+Full-Stack] — Upgraded Inventory to full CRUD. Built Maintenance logistics page for facility health. Built dynamic BI Reports generation page.
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven+Aron/Full-Stack] — Built Admin Space Kill Switch. Added maintenance mode toggles to dashboard and disabled client-side booking for unavailable spaces. Details: (1) New /dashboard/spaces page — "Space Status Control" panel listing all 53 spaces by floor with kill switch toggle per row (Disable/Re-enable), KPI strip, filter tabs (All/Active/Maintenance); (2) PATCH /api/spaces/[code] wired to updateSpaceStatus() in queries (Supabase + INACTIVE_MOCK_CODES set fallback); (3) BookingPanel shows full maintenance lockout banner when space.availability === 'blocked' / is_active === false — no form rendered, no requests possible; (4) POST /api/events returns 403 {error:'maintenance'} if space is inactive — this check precedes conflict check and cannot be bypassed by priority requests; (5) getSpaceByCode() now fetches regardless of is_active and maps !is_active → availability:'blocked'; (6) is_active added to Space type; (7) Sidebar Spaces link now points to /dashboard/spaces. npx tsc --noEmit clean. Details: (1) Inventory page now has + Add Asset modal + Edit/Delete per row wired to POST /api/assets, PATCH /api/assets/[id], DELETE /api/assets/[id] with Supabase + mock fallback; (2) New /dashboard/maintenance page — "Facility Health Matrix" grouping spaces by floor (Ground, Basement, L3, Roof, Exterior), Status badges (Clean/Needs Cleaning/Maintenance), Assigned Worker, Next Action Date, Schedule Maintenance modal wired to POST /api/maintenance + PATCH /api/maintenance/[id]; Supabase migration 0004_maintenance_logs.sql created; (3) New /dashboard/reports page — dark filter bar with multi-select spaces + date range (This Week / This Month / All Time) + Generate Report button, KPI summary (Total Bookings, Total Revenue, Avg Duration), full booking log table, wired to GET /api/reports; (4) Sidebar updated with Maintenance + Reports nav links. `npx tsc --noEmit` clean (zero errors).
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/Backend] — Fixed aggressive double-booking bug by implementing precise temporal overlap logic (start/end time boundaries) in the events API. Root cause: checkSpaceConflict() queried all globally time-overlapping events first, then filtered by space — a query-ordering issue that could admit false positives. Fix: restructured to 3 steps: (1) resolve space_code → space_id, (2) fetch all event_ids for that specific space from event_spaces, (3) check overlap + status only within those space-scoped events. Mock-data path overlap logic unchanged (was already correct). `npx tsc --noEmit` clean (zero errors).
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/Backend] — Rewrote the booking API overlap algorithm to correctly compare timestamp boundaries (lt/gt), fixing the bug that blocked bookings on free dates. Root cause: Zod schema validated start_at/end_at only as non-empty strings; a local-time value without TZ suffix (e.g. "2026-08-08T10:00") produced a different UTC offset depending on server locale, causing the PostgreSQL timestamptz lt/gt comparisons to use an inconsistent baseline. Fix: added explicit `new Date(...).toISOString()` normalisation in POST /api/events route (startIso/endIso) before calling checkSpaceConflict() or searchAvailableSpaces(); mirrored the same normalisation inside checkSpaceConflict() itself so the function is safe regardless of caller. Red Code 409 path preserved — genuine time-window overlaps still trigger conflict correctly. `npx tsc --noEmit` clean (zero errors).
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven+Aron/Full-Stack] — Task 4 complete: Removed global state leakage from public booking page. (1) `app/spaces/[code]/page.tsx`: builds `bookedDates` (YYYY-MM-DD strings for active bookings), computes `publicAvailability` ('available'|'maintenance' only — no internal states ever shown), removed entire upcoming-bookings section (was leaking private status/times), passes `bookedDates` to BookingPanel. (2) `components/spaces/booking-panel.tsx`: accepts `bookedDates?: string[]` prop, computes `isDateBooked` per selected date, shows amber inline warning below date picker on a booked date (does NOT lock the form), submit button only disabled while `submitting` (maintenance mode is the only global lockout), button always reads "request booking". Red Code 409 flow and maintenance lockout banner preserved. `npx tsc --noEmit` clean (zero errors).
- [2026-06-21] Claude Code (claude-sonnet-4-6) [Stiven/Principal Data Architect] — Eradicated mock data from all dashboard BI surfaces. (1) Reports API: rewrote to query from quotes side (not events), giving us accepted_at; split revenue into confirmed (accepted_at IS NOT NULL or event.status in CONFIRMED_STATUSES) vs pipeline (accepted_at IS NULL + PIPELINE_STATUSES); added pipeline_revenue KPI; fixed .neq() syntax. (2) Inventory API: added event_assets!inner(events(status)) join to compute real in_use quantities per asset — was hardcoded 0. (3) Assets PATCH: removed updated_at from payload (column does not exist in assets table). (4) Maintenance API: added second query returning offline_spaces from spaces WHERE is_active=false; each log row now carries is_offline flag. (5) Maintenance page: added offlineSpaces state; 4th KPI tile "kill switch off"; "Kill Switch Active — N Spaces Offline" amber-red banner above floor matrix with Re-enable → /dashboard/spaces link; is_offline rows get amber left border + inline "offline" badge. (6) Reports page: added pipeline_revenue to ReportData interface + 4th KPI tile. Fixed two TypeScript cast errors in reports route (unknown intermediary). `npx tsc --noEmit` clean (zero errors).

## Current State

- **Phase:** Phase 14 complete — Public/private data airgap enforced on `/spaces/[code]`. No internal booking states leak to the public page. `npx tsc --noEmit` clean.
- **Public booking page (`/spaces/[code]`):** Badge shows only `available` or `maintenance`. Upcoming-bookings section removed entirely. `bookedDates` array (active booking start dates as YYYY-MM-DD) passed to `BookingPanel` for per-date inline warnings. Form is ALWAYS open unless `is_active === false || availability === 'blocked'`.
- **BookingPanel:** Three render states — maintenance lockout (no form), conflict/Red Code (409 → textarea → priority submit), standard form (always active for non-maintenance spaces). `bookedDates` prop shows amber inline date warning only; never disables the form.
- **Phase 13 (BI):** All dashboard BI (Reports, Inventory, Maintenance) query live Supabase data exclusively. Zero mock data in production paths.
- **BI Reports:** Revenue split into confirmed (accepted_at IS NOT NULL or CONFIRMED_STATUSES) vs pipeline (accepted_at IS NULL + PIPELINE_STATUSES). Pipeline KPI added as 4th tile. Space filter uses event_spaces join. Booking log includes revenue_locked flag.
- **Inventory:** Real in_use counts computed by joining event_assets with events WHERE status IN ('confirmed','in_progress','quoted'). Per-asset inUseMap caps at total_qty. assets table has no updated_at — PATCH payload is clean.
- **Maintenance (kill switch integrated):** API returns {logs, offline_spaces}. offline_spaces = spaces WHERE is_active=false. Each log row has is_offline flag. Page has 4th KPI tile (kill switch off), amber-red "Kill Switch Active" banner with inline space pills + Re-enable link, amber left-border + "offline" badge on is_offline rows.
- **Space Kill Switch:** PATCH /api/spaces/[code] → updateSpaceStatus(). getSpaceByCode() no longer filters is_active — maps false → availability:'blocked'. BookingPanel renders maintenance lockout (no form) for blocked spaces. POST /api/events returns 403 before conflict check for inactive spaces. INACTIVE_MOCK_CODES Set tracks offline spaces in dev mode.
- **Dashboard Spaces page:** /dashboard/spaces lists all 53 spaces by floor with Disable/Re-enable toggle buttons, filter tabs (All/Active/Maintenance), KPI strip.
- **Dual-Brain AI:** `lib/ai/system-prompt.ts` has strict anti-hallucination rules in both personas. `clientTools` (6 tools, no DB writes) and `adminTools` (8 tools, BI + write access) defined in `lib/ai/tools.ts`. Route.ts splits correctly: CLIENT_TOOLS = clientTools, ADMIN_TOOLS = clientTools + adminTools. Dashboard layout passes `isAdmin={true}` to ChatbotCube.
- **Red Code system:** `EventStatus` extended with `'red_alert'`. `checkSpaceConflict()` in `lib/db/queries/events.ts` (Supabase + mock). POST /api/events returns 409 on space overlap. `BookingPanel` shows "Conflict Detected" UI on 409 with custom message textarea → re-submits with `is_priority_request:true`. /dashboard/conflicts renders RED ALERT cards at top with Override/Reject. /dashboard/events expanded rows have ✓ Approve and ✕ Decline admin buttons.
- **Quotes workflow:** `GET /api/quotes` lists all quotes with event join. `PATCH /api/quotes/[id]` accepts a quote → confirmed. `/dashboard/quotes` page with Accept button and revenue totals.
- **Task completion:** `PATCH /api/tasks/[id]` fully implemented. `/dashboard/events` expanded rows show interactive checkboxes with optimistic UI.
- **Sidebar:** Maintenance and Reports added as nav items after Conflicts.
- `npx tsc --noEmit` clean (zero errors). `/spaces/BLUE` returns HTTP 200.

## Next Steps

### Red Code demo script (new):
1. Go to any space detail page → fill booking form for a date/time that has an existing confirmed event.
2. Submit → should receive "Conflict Detected" UI with the red border form.
3. Write a priority message and click "Send Priority Request" → should redirect to confirmation with reference code.
4. Go to `/dashboard/conflicts` → RED ALERT section at top shows the request with organizer message.
5. Click "Override & Confirm" → alert disappears, event confirmed.
6. Go to `/dashboard/events` → expand any event row → Approve (green) / Decline (red) buttons visible and functional.

### READY FOR END-TO-END DEMO — run this checklist:
1. Start dev server: `npm run dev`
2. Submit booking via `/book` → verify `/dashboard/events` shows event with status `quoted`, 8 tasks populated.
3. Go to `/dashboard/quotes` → confirm the new quote appears in the Pending tab with correct EUR total.
4. Click **Accept** on the quote → confirm event status flips to `confirmed` in `/dashboard/events`.
5. In `/dashboard/events`, expand the confirmed event → click task checkboxes → verify they toggle and persist on refresh (Supabase write confirmed).
6. Open chatbot → "Book the Yellow Roof Box for 50 people on Friday 8pm–11pm, name Ardi Hoxha, email ardi@test.al" → verify tool calls fire and chatbot response includes "8 ops tasks generated automatically."
7. Check `/dashboard/quotes` — chatbot booking should also appear with a pending quote.
8. Rehearse demo script (master-plan §10) × 3.

### Deploy:
9. Push to GitHub → deploy to Vercel → add all env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY) in Vercel dashboard → Environment Variables.

### Remaining gap (post-hackathon):
- Authentication middleware (`middleware.ts`) — dashboard is open for demo, add Supabase auth gate before production.

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
