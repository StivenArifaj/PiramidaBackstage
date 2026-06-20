# Piramida Backstage — Full System Playwright Audit Report

**Date:** 2026-06-20
**Auditor:** Claude Code (claude-sonnet-4-6) — Aron / Frontend
**Tool:** `scripts/full-system-audit.mjs` (Playwright 1.61.0, Chromium headless, 1440×900)
**Server:** `http://localhost:3001` (Next.js 16.2.9, Turbopack dev)
**Routes audited:** 11 (`/`, `/spaces`, `/spaces/BLUE`, `/spaces/A1`, `/spaces/NONEXISTENT`, `/book`, `/book/confirmation`, `/dashboard`, `/dashboard/events`, `/dashboard/inventory`, `/dashboard/conflicts`)

---

## Executive Summary

| Severity | Count |
|---|---|
| **Critical** | 2 |
| **High** | 5 |
| **Medium** | 6 |
| **Low Polish** | 5 |

All API endpoints return 200. No JavaScript runtime errors detected on any route. No placeholder lorem-ipsum copy. Canvas scroll-video renders correctly (1440×900, frame counter active). The demo happy-path (`/spaces/BLUE` → detail → booking panel → confirmation) is structurally sound. Two critical gaps block the demo script.

Screenshots stored at: `tmp/audit/<route>/`

---

## 🔴 CRITICAL

### C1 — `/book` is an empty stub page
**File:** `app/book/page.tsx:1–3`
**What's broken:** The route renders only a blank bone-colored `<main>` with no content whatsoever. The "+ NEW BOOKING" button in the dashboard header and sidebar both link to `/book`. Clicking them drops the user on a completely empty screen.

```tsx
// current — literally the entire file:
export default function BookPage() {
  return <main className="min-h-screen" style={{ backgroundColor: 'var(--color-concrete-bone)' }} />
}
```

**Impact:** Blocks the primary booking entry point. The demo script requires a standalone booking form flow independent of the space detail page. This is listed as the highest-priority next step in `cloud-memory.md` but has never been implemented.
**Fix:** Implement `app/book/page.tsx` with space search/picker, date/time/attendees form, live quote display. Wire to `POST /api/events`. On success redirect to `/book/confirmation?ref=...`.

---

### C2 — Chatbot UI is a completely empty stub
**Files:** `components/chatbot/chatbot-cube.tsx`, `components/chatbot/chatbot-panel.tsx`
**What's broken:** Both files exist but render nothing (stubs written in Phase 3). The chatbot is not mounted anywhere in the app. The demo script explicitly requires asking the chatbot to book a second event with a single sentence.
**Impact:** Blocks the secondary demo proof point. No floating cube, no expandable panel, no Gemini API call.
**Fix:** Implement the floating dark cube (bottom-right, fixed, `z-50`) that expands to a chat panel. Wire to `POST /api/chatbot`. Mount in `app/layout.tsx` or inside the marketing/spaces layouts.

---

## 🟠 HIGH

### H1 — Floor selector `Pill` component uses `rounded-full` — violates design system
**File:** `components/ui/pill.tsx:17`
**Routes affected:** `/` (landing page bottom floor selector), `/spaces`
**What's broken:** `Pill` uses Tailwind class `rounded-full` which computes to `border-radius: 9999px` (full pill shape). The Playwright DOM inspector detected this as `3.35544e+07px` on all 5 floor selector buttons. The design system explicitly prohibits rounded corners except two authorized exceptions (macOS dots in `scroll-video.tsx` and `mini-map.tsx` indicator dots). The pill shape is not an authorized exception.

```tsx
// pill.tsx:17
'border-2 rounded-full cursor-pointer',   // ← VIOLATION
```

**Impact:** Every page showing the floor elevation selector has a design-system breach visible to judges.
**Fix:** Replace `rounded-full` with no rounding (remove the class entirely, keeping the hard rectangular border from `border-2`). Adjust padding if needed for visual balance.

---

### H2 — Dashboard KPI numbers render in Space Grotesk, not JetBrains Mono
**File:** `app/dashboard/page.tsx:241`
**What's broken:** The four large KPI numerals (Events Today, This Week, This Month, Active Conflicts) displayed at 46px use `fontFamily: D` where `const D = 'Space Grotesk, sans-serif'`. The design system rule: **all numbers, IDs, dimensions, prices, times → JetBrains Mono**. Confirmed by Playwright: `{ tag: 'P', text: '0', font: '"Space Grotesk", sans-serif' }` × 4.

```tsx
// dashboard/page.tsx:241
<p style={{ fontFamily: D, fontSize: '46px', ... }}>   // D = 'Space Grotesk, sans-serif'
  {data ? value : <span>—</span>}
</p>
```

**Fix:** Change `fontFamily: D` → `fontFamily: M` on that `<p>`. The `M = 'JetBrains Mono, monospace'` constant is already declared in the same file.

---

### H3 — Inventory page KPI strip numbers render in Space Grotesk
**File:** `app/dashboard/inventory/page.tsx` (KPI strip section)
**What's broken:** The four KPI values (11, 1082, 139, 0) are in Space Grotesk. Playwright confirmed: `{ tag: 'P', text: '11', font: '"Space Grotesk"' }`, `{ text: '1082' }`, `{ text: '139' }`, `{ text: '0' }`.
**Fix:** Audit the inventory KPI `<p>` elements and switch `fontFamily` from `D` to `M`.

---

### H4 — ImageGallery navigation buttons have no accessible label
**File:** `components/ui/image-gallery.tsx` (nav arrow buttons)
**Routes affected:** `/spaces/BLUE` (2 violations confirmed by Playwright a11y check)
**What's broken:** The ← and → navigation `<button>` elements contain only SVG arrow icons with no text content and no `aria-label` attribute. Screen readers cannot describe these controls. The Playwright a11y scan found `button-no-label` on both.

```tsx
// image-gallery.tsx — both nav buttons look like:
<button style={{ ... }} onClick={...}>
  ← {/* no text, no aria-label */}
</button>
```

**Fix:** Add `aria-label="Previous image"` / `aria-label="Next image"` to both buttons.

---

### H5 — Interlude section: "80+ SPACES" label uses Space Grotesk (display font), not mono
**File:** `app/(marketing)/page.tsx:148`
**What's broken:** The interlude stat labels (`{ label: '80+ spaces', ... }`) render via `fontFamily: 'var(--font-display)'` (Space Grotesk). "80+" is a numeric value. The design system requires JetBrains Mono for any numeric quantity displayed as a label or stat.

```tsx
// page.tsx:148
<p style={{ fontFamily: 'var(--font-display)', ... }}>
  {label}  {/* "80+ spaces", "Auto-generated quotes", etc. */}
</p>
```

**Note:** "Auto-generated quotes" and "Conflict detection" are fine as display-font labels. The violation is specifically the "80+" within the first label, and the detail text for all three which contains inline numbers ("16 exterior boxes", "200+ shared operational assets") rendered in `var(--font-body)` (Inter).
**Fix:** Split interlude stat values from their label text. Render the numeric portion ("80+") in `var(--font-mono)` and the label ("spaces") in display or body. Or switch the entire label to mono since they are all data-forward stats.

---

## 🟡 MEDIUM

### M1 — Space detail 404 path shows blank loading screen briefly, then "not found" — no H1
**File:** `app/spaces/[code]/page.tsx:144–156`
**What's broken:** For invalid space codes (e.g. `/spaces/NONEXISTENT`), the page first shows a full dark "loading space data..." screen, then transitions to the not-found state. The not-found state has no `<h1>` or page title indicating the error — just a `<p>` and a back-link. Playwright confirmed `h1Text: null` and `scrollHeight: 900` (minimal content). The BrandStrip is present (correct) but the page is visually ambiguous.
**Fix:** Add an `<h1>` to the not-found return, e.g. `<h1>Space not found</h1>`.

---

### M2 — Dashboard, Inventory, Conflicts pages have no H1 heading
**Routes:** `/dashboard`, `/dashboard/inventory`, `/dashboard/conflicts`
**What's broken:** Playwright confirmed `h1Text: null` on all three. The `/dashboard/events` correctly has `h1: "Event Register"`. The other dashboard pages have section-label text only (`<span>` elements in breadcrumbs, no semantic heading hierarchy).
**Impact:** Accessibility and SEO. Screen readers have no page landmark to announce.
**Fix:** Add a visually hidden or visible `<h1>` to each dashboard page. Could be the breadcrumb text ("Dashboard", "Asset Inventory", "Conflict Resolution").

---

### M3 — Conflict description body text uses `Inter, sans-serif` hardcoded
**File:** `app/dashboard/page.tsx:557`, `app/dashboard/conflicts/page.tsx`
**What's broken:** The conflict card description:
```tsx
<p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', ... }}>
  {c.description}
</p>
```
Uses a hardcoded `'Inter, sans-serif'` string instead of `var(--font-body)`. While Inter is correct for body prose, the hardcoded string bypasses the design token. If the font variable changes, this will diverge.
**Fix:** Replace with `fontFamily: 'var(--font-body)'`.

---

### M4 — Space A1 (and all A-ring mock spaces) show full-height SVG hatch placeholder in gallery
**File:** `lib/db/mock-data.ts` (A1–A16 entries), `components/ui/image-gallery.tsx`
**What's broken:** The A-ring spaces (A1–A16) in mock data have `photo_urls: []`. When their detail pages load, the ImageGallery shows a 62vh dark hatch placeholder for all 6 slots. For the demo this means clicking any extension space from the floor plan shows an empty dark gallery — visually jarring next to the hero spaces (BLUE/ORANGE/GREEN/YELLOW) which have real images.
**Fix (two options):** (a) Add representative photo URLs to mock data for at least 3–4 A-ring spaces pointing to `public/references/` or Unsplash architecture images. (b) Change gallery fallback to show a floor plan SVG thumbnail instead of the hatch placeholder.

---

### M5 — Dashboard event register shows attendee count discrepancy
**File:** `app/dashboard/page.tsx` (static `UPCOMING` array) vs `lib/db/mock-data.ts`
**What's broken:** The dashboard overview page hardcodes `attendees: 160` for "Startup Albania Night" (PB-2026-003), but the API mock data returns `attendees_count: 128` for the same event. The events register page (`/dashboard/events`) shows 126 pax (another value). Three different numbers for the same event.
**Fix:** Remove the hardcoded `UPCOMING` array from `app/dashboard/page.tsx` and drive the upcoming events section from the same `/api/dashboard/overview` response that already fetches `events_today` and `events_this_week`.

---

### M6 — `Pill` label font is Space Grotesk — should be JetBrains Mono for elevation codes
**File:** `components/ui/pill.tsx:24`
**What's broken:** `style={{ fontFamily: 'var(--font-display)' }}` — the pill labels ("ROOF", "3RD FLOOR", "GROUND FLOOR", "B1 FLOOR", "EXT. BOXES") use Space Grotesk. The elevation tags shown beside active pills (`+4`, `+3`, `±0`, `-1`, `EX`) correctly use `var(--font-mono)`. For consistency and architectural character, the pill labels themselves should also use mono — they are structural codes, not marketing copy.
**Fix:** Change `fontFamily: 'var(--font-display)'` → `fontFamily: 'var(--font-mono)'` in `pill.tsx`.

---

## 🔵 LOW POLISH

### L1 — Landing page interlude detail text (body copy) contains inline numbers in Inter
**File:** `app/(marketing)/page.tsx:151`
**What's broken:** The detail text lines ("Four hero spaces, 16 exterior boxes...", "...200+ shared operational assets") render in `var(--font-body)` (Inter). They contain numeric quantities inline within prose sentences. Strictly per design-system rules, numbers should be mono.
**Fix level:** Low — changing these inline numbers to `<span style={{ fontFamily: 'var(--font-mono)' }}>16</span>` is technically correct but disrupts readability. Consider wrapping only the cardinal numbers in mono spans.

---

### L2 — `app/book/confirmation` task list shows `06` index line with no text briefly
**File:** `app/book/confirmation/page.tsx:67`
**What's broken:** Tasks animate in one every 280ms. When the Playwright snapshot was taken at 4000ms, 5 of 6 tasks had appeared but the `06` lime index number was rendered with an empty task text alongside it (the 6th interval had fired but the text hadn't resolved yet). A human watching live would see this briefly. Minor cosmetic issue.
**Fix:** Pre-compute task count and render the loader dot only when `tasks.length === 0`. Or simply reduce the interval to 200ms so all 6 tasks appear well within any realistic viewing window.

---

### L3 — Space detail booking panel time input defaults to 12-hour AM/PM format on some locales
**File:** `app/spaces/[code]/page.tsx:87–88`
**What's broken:** `<input type="time" value="10:00" />` and `value="14:00"` — Chrome on Windows 11 renders these as "10:00 AM" and "02:00 PM" in 12-hour format even though the value is stored in 24h. Non-critical but visually inconsistent with the mono 24h time displays elsewhere in the app.
**No code change needed** — this is OS/browser locale behavior. Consider documenting or adding `step="1800"` (30-min increments) to help usability.

---

### L4 — Next.js Turbopack dev badge ("N" circle) visible in all screenshots
**Observed in:** All 11 routes, bottom-left corner
**What's:** The Next.js development mode floating devtools indicator. Not in production. Not a bug — noted for completeness so no one wastes time debugging it.

---

### L5 — `/spaces` page: `paddingTop: '48px'` on main grid clips the `<h1>` "select a floor" near top edge
**File:** `app/spaces/page.tsx:47`
**What's broken:** The main layout has `paddingTop: '48px'` which is the BrandStrip height — correct. But in the landing page's embedded floor selector (which also renders this layout at the bottom of the page), the top padding creates a visible gap where the heading "select a floor" is partially clipped by the BrandStrip if you land there via scroll rather than direct navigation. Minor alignment issue in the embedded context only.

---

## API Health Summary

All endpoints tested returned HTTP 200:

| Endpoint | Status |
|---|---|
| `GET /api/spaces/BLUE` | ✅ 200 |
| `GET /api/spaces/A1` | ✅ 200 |
| `GET /api/dashboard/overview` | ✅ 200 |
| `GET /api/events` | ✅ 200 |
| `GET /api/inventory` | ✅ 200 |
| `GET /api/conflicts` | ✅ 200 |

---

## No-Issue Routes

- `/book/confirmation` — renders correctly, task list animates, CTA buttons functional
- `/dashboard/events` — full event register with filter tabs, 3 rows, expand-row pattern
- `/dashboard/conflicts` — conflict card, related event, affected space, resolution checklist
- `/ ` (landing) — both flythroughs, glass hero plate, interlude, inline floor selector
- `/spaces/BLUE` — full hero images, metrics in mono, booking panel, quote calculation

---

## Recommended Fix Order (for remaining hackathon time)

1. **C1** — Implement `app/book/page.tsx` (booking entry form)
2. **C2** — Implement chatbot cube + panel + wire to `/api/chatbot`
3. **H1** — Remove `rounded-full` from `components/ui/pill.tsx`
4. **H2** — Fix dashboard KPI `fontFamily: D` → `fontFamily: M`
5. **H3** — Fix inventory KPI `fontFamily`
6. **M4** — Add placeholder images to A-ring mock-data spaces
7. **M5** — Replace hardcoded `UPCOMING` array with live API data
8. **H4** — Add `aria-label` to gallery nav buttons
9. **H5 / L1** — Wrap numeric portions of interlude text in mono spans
10. **M2** — Add H1 headings to dashboard pages
