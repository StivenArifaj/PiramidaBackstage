# Cloud Memory — Piramida Backstage

## Current State

Ground floor plan is a strict octagonal SVG using only `<polygon>` elements (no `<path>` or `<circle>` for layout). All 19 spaces (A1–A19) are clickable and navigate directly to their detail page via `router.push`. Mock data contains explicit A1–A19 entries with official area/capacity/rate values matching the ground-floor SVG geometry. The detail page fetches from the API and renders real data for any space code.

## Completed Tasks Log

- [2026-06-20 13:31] [frontend] — Session Init: Synced repo, fixed M4 mock images, wired dashboard events to API (M5), and hooked up Chatbot UI fetch logic.
- [2026-06-20 14:03] [frontend] — Architectural Correction: Redrew octagonal ground floor plan (strict polygon geometry) and wired direct space-click navigation. Updated mock data with explicit A1–A19 entries.

## Next Steps

1. Backend: Finalize API endpoints (`/api/dashboard/overview`, `/api/chatbot`) ensuring response shapes match `types/api.ts` contracts.
2. Frontend: Build remaining floor plan SVGs for L+3, L-1, Roof, Exterior if not yet complete. Wire `ImageGallery` to render real space photos from mock data.
3. Both: End-to-end test the booking flow from floor plan click → detail page → booking submission → confirmation.
