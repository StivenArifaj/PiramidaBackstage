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

- **Phase:** Phase 3 ✅ **complete** as of 2026-06-20. Phase 4 (backend API implementation + frontend page build-out) **not started.**
- **Stack:** Next.js 16.2.9 (App Router) + TypeScript + Tailwind CSS v4 + pnpm. `npx tsc --noEmit` passes with zero errors.
- **What exists now:**
  - Full folder structure scaffolded per master-plan §5
  - `app/globals.css` — Tailwind v4 `@theme` block with all design tokens (concrete, lime, box palette, status, fonts)
  - `app/layout.tsx` — Space Grotesk + Inter + JetBrains Mono via `next/font/google`
  - `styles/tokens.ts` — TS color/typography constants for non-CSS contexts (SVG, animations)
  - `types/api.ts`, `types/db.ts`, `types/domain.ts` — full type system + bilingual dictionary
  - `supabase/migrations/0001_init.sql` — complete schema verbatim from master-plan §6
  - `lib/` — all stubs present (db client/server, queries, ai, pricing, availability, tasks)
  - All API route stubs (return empty/501 for now)
  - All page stubs (marketing, spaces, book, dashboard)
  - `components/ui/` — all 7 primitives: Cube, Pill, Callout, MonoTable, StatusDot, SectionDivider, BrandStrip
  - `components/pyramid/` — GroundFloorPlan SVG (16-space interactive radial plan, A1–A16, lime/red/orange/gray status), FloorSelector (elevation photo + 5 pills), MiniMap, FloorPlan wrapper, ScrollVideo (GSAP)
  - `components/booking/`, `components/dashboard/`, `components/chatbot/` — stubs
- **Tailwind v4 note:** No `tailwind.config.ts` — tokens live in `app/globals.css` `@theme` block. This is correct for v4.
- **Last updated:** 2026-06-20, Claude Code (claude-sonnet-4-6).

## Completed Tasks Log

*(append-only — newest at the bottom — never delete history)*

- [2026-06-19] Master plan authored (`.cursor/master-plan.md`) — design system, repo structure/ownership, DB schema, API contract, 48h timeline, demo script, Gemini prompt-recipe template.
- [2026-06-19] Challenge brief saved (`.cursor/challenge-brief.md`).
- [2026-06-19] 11 reference images identified by content (aerial/elevation/interior photos of the real Pyramid + 3 screenshots of the existing piramida.edu.al floor-plan UI). Three-phase bootstrap prompt issued to Claude Code. **Session was switched before Phase 2 completion could be confirmed.**
- [2026-06-20 ~00:10] Claude Code (claude-sonnet-4-6) — Phase 2 verified and completed: identified all 11 `Screenshot 2026-06-19 at …` PNGs in project root by visual content, copied and renamed them into `.cursor/references/` with correct semantic names (all `.png`).
- [2026-06-20] Claude Code (claude-sonnet-4-6) — Phase 3 complete: Next.js 16 bootstrapped, all locked deps installed, design tokens in Tailwind v4 CSS, types + DB schema + all folder stubs + 7 UI primitives + Ground Floor SVG + all pyramid components written. `tsc --noEmit` clean.

## Next Steps

### Frontend Dev (Aron Gjoka) — immediate priorities:

1. **Landing page** (`app/(marketing)/page.tsx`): Build the scroll-scrubbed video hero using ScrollVideo component + `aerial-top-down.png` / `wide-context.png`. Use GSAP ScrollTrigger already installed. Hero text: "PIRAMIDA BACKSTAGE" in Space Grotesk. SectionDivider between hero and floor selector.

2. **Spaces page** (`app/spaces/page.tsx`): Wire up FloorSelector (uses `front-elevation.png` as bg — copy it to `public/references/` or use the `.cursor/references/` path via next.config image config) + FloorPlan component. On floor select → show the Ground Floor SVG. Add BrandStrip at top.

3. **Space detail page** (`app/spaces/[code]/page.tsx`): Background video (use `interior-atrium.png` or `interior-boxes-detail.png` as static fallback). Show space name, MonoTable with specs (capacity, area, hourly rate, ceiling height). Add BookingPanel on the right. Scroll behavior: image zooms in slightly on scroll.

4. **Polish Ground Floor SVG** (`components/pyramid/floor-plans/ground-floor.tsx`): The SVG is functional but the A17–A19 spaces use tiny arc spans — consider removing or repositioning them. The main 16 spaces (A1–A16) are solid. Wire real data from `/api/spaces?floor=l0` once the backend exists.

5. **public/references/**: Copy the reference images that are needed as actual URLs (front-elevation.png, aerial-top-down.png, etc.) from `.cursor/references/` to `public/references/` so Next.js can serve them. OR configure `next.config.ts` to allow local file paths.

### Backend Dev — immediate priorities (once Supabase project is created):

1. Create Supabase project, add env vars to `.env.local` (copy from `.env.local.example`)
2. Run `supabase db push` with `supabase/migrations/0001_init.sql`
3. Write `supabase/migrations/0002_seed.sql` per master-plan §6 seed spec (~50 spaces, assets)
4. Implement `GET /api/spaces` — query Supabase, return `ListSpacesResponse`
5. Implement `GET /api/spaces/[code]` — return `GetSpaceResponse` with upcoming bookings
6. Implement `GET /api/spaces/availability` — date/capacity filter

**Sync point:** once `/api/spaces?floor=l0` returns real data, frontend can wire the Ground Floor SVG to live availability colors.

## Open Questions / Blockers

- `public/references/` does not exist yet — the FloorSelector uses `backgroundImage: url('/references/front-elevation.png')` which will 404 until either (a) images are copied to `public/references/` or (b) next.config is updated. **Frontend dev: copy `.cursor/references/*.png` to `public/references/` as a first step.**
- `pnpm tsc --noEmit` fails due to an unrelated pnpm native build script error (sharp, unrs-resolver). Use `npx tsc --noEmit` instead — this works fine.

## Key Decisions Made

- **Reference image extensions are `.png`, not `.jpg`**: The 11 source images were macOS screenshots, all PNG. master-plan §0 lists `.jpg` for 9 of them — ignore those extensions.
- **`aerial-top-down-day` does not exist**: No daylight straight-down aerial was in the source image set.
- **Tailwind v4, not v3**: `create-next-app` installed Tailwind v4. There is NO `tailwind.config.ts` — all tokens live in `app/globals.css` inside `@theme {}`. This is correct. Do not create a `tailwind.config.ts`.
- **Package name is `piramida-backstage`** (lowercase): The directory is `PiramidaBackstage` but npm requires lowercase names. `package.json` uses `"name": "piramida-backstage"`.
- **Ground Floor SVG geometry**: 16 radial spaces (A1–A16) at every 22.5° centered angle, each ~16.5° arc span between corridor wedges. BOX_INNER=178, BOX_OUTER=318, center at (400,400). A17–A19 are tiny transition connectors — may be removed in polish pass.
- **API route stubs return empty data**: All API routes are stubbed to return empty arrays / 501. Backend dev fills them in Phase 4.

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/gemini-operator-brief.md` — the document that makes Gemini the prompt-generating orchestrator for this project
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (all `.png`)
