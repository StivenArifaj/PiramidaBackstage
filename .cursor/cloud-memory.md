# Cloud Memory — Piramida Backstage

## Current State

Dashboard is wired to fetch from `/api/dashboard/overview` and `/api/events`. A-ring spaces (A1–A15) have photo_urls assigned from `/references/`. Chatbot UI in `chatbot-cube.tsx` POSTs to `/api/chatbot` and renders responses. All frontend files pass TypeScript checks with no errors.

## Completed Tasks Log

- [2026-06-20 13:31] [frontend] — Session Init: Synced repo, fixed M4 mock images, wired dashboard events to API (M5), and hooked up Chatbot UI fetch logic.

## Next Steps

Hand over to Backend to finalize the API endpoints (`/api/dashboard/overview`, `/api/chatbot`) and ensure response shapes match the frontend contracts in `types/api.ts`.
