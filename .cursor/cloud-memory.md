# Cloud Memory — Piramida Backstage

## Current State

Floor selector overlay calibrated: high-res MVRDV photograph (mvrdv-28.jpg, 1333×1000) replaces low-res front-elevation.png. Aspect-ratio locked to 1333/1000 to eliminate stretch distortion. Pill positions adjusted for stepped facade geometry (roof 7%, l3 30%, l0 58%, b1 76%, exterior 64%/12%). Gradient scrim preserves image detail while keeping pills legible.

## Completed Tasks Log

- [2026-06-20 13:31] [frontend] — Session Init: Synced repo, fixed M4 mock images, wired dashboard events to API (M5), and hooked up Chatbot UI fetch logic.
- [2026-06-20 14:03] [frontend] — Architectural Correction: Redrew octagonal ground floor plan (strict polygon geometry) and wired direct space-click navigation. Updated mock data with explicit A1–A19 entries.
- [2026-06-20 14:15] [Aron/Frontend] — Calibration: Replaced low-res background, fixed topographic alignment, and locked overlay to high-res image container.

## Next Steps

1. Backend: Finalize API endpoints (`/api/dashboard/overview`, `/api/chatbot`) ensuring response shapes match `types/api.ts` contracts.
2. Frontend: Build remaining floor plan SVGs for L+3, L-1, Roof, Exterior if not yet complete. Wire `ImageGallery` to render real space photos from mock data.
3. Both: End-to-end test the booking flow from floor plan click → detail page → booking submission → confirmation.
4. Frontend: Verify floor-selector pill positions visually against mvrdv-28.jpg and fine-tune if needed — the human should check that each pill's leader line points to the correct building level in the new image.
