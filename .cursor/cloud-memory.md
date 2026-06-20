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

- **Phase:** Phase 5 — Supabase live (53 spaces, 11 assets, 3 demo events, 6 tasks, 1 quote seeded). All API routes wired with Supabase + mock-data fallback. Chatbot migrating from Gemini → Groq. `.env.local` has URL + anon key; needs SUPABASE_SERVICE_ROLE_KEY + GROQ_API_KEY to activate server-side queries and chatbot.
- **Stack:** Next.js 16.2.9 (App Router) + TypeScript + Tailwind CSS v4 + pnpm. `npx tsc --noEmit` passes with zero errors.
- **Ground floor plan:** Strict octagonal SVG using only `<polygon>` elements (no `<path>` or `<circle>` for layout). All 19 spaces (A1–A19) are clickable and navigate directly to their detail page via `router.push`. Mock data contains explicit A1–A19 entries with official area/capacity/rate values.
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
  - Chatbot: currently Gemini 2.5-flash — migrating to Groq llama-3.1-70b this session

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

## Next Steps

### IMMEDIATE — Developer must do:
1. **Fill in `.env.local`** — add `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard → Project Settings → API) and `GROQ_API_KEY` (console.groq.com). Restart `pnpm dev`.
2. **Verify live DB**: `GET /api/spaces` should return 53 spaces from Supabase. `GET /api/events` should return 3 seeded events.

### End-to-end test checklist:
3. Submit event via `/book` → check `/dashboard/events` shows it (live DB row).
4. Open chatbot → "Book Yellow Roof Box for 50 people Friday 8pm–11pm, name Ardi, email ardi@test.al" → tools fire, event appears in dashboard.
5. Accept quote via `POST /api/quotes/{id}` → tasks auto-generated and inserted.

### Demo prep:
6. Rehearse demo script (master-plan §10) at least 3 times.
7. Deploy to Vercel — add all env vars in Vercel dashboard → Environment Variables.

### Frontend (Aron):
1. Wire `/spaces/page.tsx` floor selector to live `GET /api/spaces?floor=…` — currently uses `DEMO_SPACES` constant.
2. Add photo URLs to A-ring spaces in mock-data (or seed real URLs to Supabase) so ImageGallery doesn't show hatch placeholder.

## Open Questions / Blockers

- **`.env.local` missing 2 keys**: `SUPABASE_SERVICE_ROLE_KEY` + `GROQ_API_KEY`. URL + anon key already present.
- `pnpm tsc --noEmit` fails due to unrelated pnpm native build script error (sharp, unrs-resolver). Use `npx tsc --noEmit` instead.

## Key Decisions Made

- **Mock-data fallback in query layer**: `lib/db/queries/spaces.ts` checks `isSupabaseConfigured()` (env vars present + URL starts with `http`) and falls back to `lib/db/mock-data.ts` if not. This keeps the frontend working during development before Supabase is wired up.
- **`createAdminClient()` uses service-role key**: API routes use the service-role client (bypasses RLS). The browser client uses anon key. RLS policies are not defined in 0001_init.sql — add them before production.
- **Zod v4 compatibility**: The project has `zod ^4.4.3`. Schemas use only v3-compatible APIs (`z.object`, `z.string`, `z.coerce.number`, `z.enum`, `.transform`, `.optional`, `.safeParse`). Avoided `.flatten()` on ZodError since that API changed in v4.
- **Tailwind v4, not v3**: `create-next-app` installed Tailwind v4. There is NO `tailwind.config.ts` — all tokens live in `app/globals.css` inside `@theme {}`. This is correct. Do not create a `tailwind.config.ts`.
- **`overflowX: 'clip'` on landing page root div**: Using `clip` not `hidden` — `overflow: hidden` creates a new scroll context which silently kills `position: sticky` children. `clip` clips overflow without creating a scroll context.
- **Ground Floor SVG**: Strict octagonal geometry using `octPt()` / `octSector()`, pure `<polygon>` elements. A1–A19 all clickable, navigate via `router.push('/spaces/[code]')`.
- **Chatbot migrating to Groq**: Gemini billing-blocked. Use `openai` SDK with `baseURL: 'https://api.groq.com/openai/v1'` and model `llama-3.1-70b-versatile`. Tool definitions stay in `lib/ai/tools.ts` (converted to OpenAI function-calling format).
- **Reference image extensions are `.png`, not `.jpg`**: The 11 source images were macOS screenshots, all PNG.
- **Landing page uses GSAP ScrollVideo**: 265 frames at `/public/frames/detail-sample/`, `reversed=true`. Space detail: 300 frames at `/public/frames/hero/`, `reversed=true`.
- **FloorSelector background**: `mvrdv-28.jpg` (1333×1000px), aspect-ratio locked. Pill positions (% from top): roof 7%, l3 30%, l0 58%, b1 76%, exterior 64% left / 12% top.

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (all `.png`)
