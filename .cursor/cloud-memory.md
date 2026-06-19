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

- **Phase:** Bootstrap — Phase 1 ✅ complete. Phase 2 ✅ **confirmed complete** as of 2026-06-20. Phase 3 (Next.js project bootstrap) **not started.**
- **Last confirmed action:** Phase 2 executed: all 11 reference images (found as `Screenshot 2026-06-19 at …` files in the project root, using macOS U+202F NARROW NO-BREAK SPACE before AM/PM) were identified by visual content and copied into `.cursor/references/` with correct semantic filenames. Note: all files are `.png` (screenshots), so the `.jpg` extensions listed in master-plan §0 for the photo files were not used — filenames match the semantic names but with `.png` extension. `aerial-top-down-day.png` was **not created** — no daylight straight-down aerial exists among the 11 source images; it is listed in the cloud-memory table but absent from master-plan §0 and from the actual image set.
- **Last updated:** 2026-06-20, Claude Code (claude-sonnet-4-6).

## Completed Tasks Log

*(append-only — newest at the bottom — never delete history)*

- [2026-06-19] Master plan authored (`.cursor/master-plan.md`) — design system, repo structure/ownership, DB schema, API contract, 48h timeline, demo script, Gemini prompt-recipe template.
- [2026-06-19] Challenge brief saved (`.cursor/challenge-brief.md`).
- [2026-06-19] 11 reference images identified by content (aerial/elevation/interior photos of the real Pyramid + 3 screenshots of the existing piramida.edu.al floor-plan UI). Three-phase bootstrap prompt issued to Claude Code. **Session was switched before Phase 2 completion could be confirmed.**
- [2026-06-20 ~00:10] Claude Code (claude-sonnet-4-6) — Phase 2 verified and completed: identified all 11 `Screenshot 2026-06-19 at …` PNGs in project root by visual content, copied and renamed them into `.cursor/references/` with correct semantic names (all `.png`). Directory now contains all 11 expected files. Note: `.jpg` extension in master-plan §0 for photo files was not preserved since sources are PNG screenshots. `aerial-top-down-day` does not exist in the image set and was not created.

## Next Steps

**Phase 2 is complete. Proceed directly to Phase 3.**

**Phase 3 — Next.js project bootstrap (whoever opens this next):**

Run the following in order:
1. `pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` in the project root (or the target repo directory if one is created).
2. Install locked deps: `pnpm add @supabase/supabase-js @supabase/ssr @google/generative-ai framer-motion gsap clsx tailwind-merge date-fns zod`
3. Install dev deps: `pnpm add -D @types/node`
4. Write `tailwind.config.ts` with the EXACT design tokens from master-plan §4 (colors, fonts).
5. Write `types/api.ts` verbatim from master-plan §7.
6. Write `supabase/migrations/0001_init.sql` verbatim from master-plan §6.
7. Scaffold the full folder structure from master-plan §5 (stub all files — empty exports, no errors).
8. Build `components/ui/` primitives: `cube.tsx`, `pill.tsx`, `callout.tsx`, `mono-table.tsx`, `status-dot.tsx`, `section-divider.tsx`, `brand-strip.tsx`.
9. Confirm `pnpm dev` boots and `pnpm tsc --noEmit` is clean.
10. Commit everything.

**Reference images are in `.cursor/references/` — all 11 files present, all `.png`. When attaching to prompts, use `.png` extension (not `.jpg` as listed in master-plan §0).**

**For Backend Dev (once Phase 3 lands):** Supabase project creation + running the migration + seed data + first API routes (`/api/spaces`, `/api/spaces/[code]`, `/api/spaces/availability`).

**For Frontend Dev (once Phase 3 lands):** landing page scroll-video hero using `aerial-top-down.png` / `wide-context.png`, floor selector using `front-elevation.png`, Ground Floor SVG using `current-site-plan-ground.png` as the geometry reference (this one has a real source to trace, do it first). Note: `aerial-top-down-day.png` does not exist — use the single `aerial-top-down.png` (dusk/LED-lit) instead.

## Open Questions / Blockers

- None currently blocking.

## Key Decisions Made

*(anything that clarifies or deviates from master-plan.md — keep this updated so decisions aren't re-made differently by a different agent later)*

- **Reference image extensions are `.png`, not `.jpg`**: The 11 source images were macOS screenshots, all PNG. master-plan §0 lists `.jpg` for 9 of them — ignore those extensions. Whenever a prompt says to attach `aerial-top-down.jpg`, use `aerial-top-down.png` from `.cursor/references/`.
- **`aerial-top-down-day` does not exist**: The cloud-memory table listed it; master-plan §0 does not. No daylight straight-down aerial was in the source image set. Do not attempt to create or reference this file.

## Reference files index

- `.cursor/master-plan.md` — full spec: design system, schema, API contract, timeline, demo script, prompt-recipe template
- `.cursor/challenge-brief.md` — original JunctionX/AADF challenge text
- `.cursor/gemini-operator-brief.md` — the document that makes Gemini the prompt-generating orchestrator for this project
- `.cursor/references/` — 11 reference images of the real Pyramid of Tirana (see table above for filenames)
