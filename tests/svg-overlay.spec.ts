/**
 * Piramida Backstage — SVG Overlay & Routing Audit
 *
 * Two verification goals:
 *
 * 1. VISUAL ALIGNMENT
 *    Injects bright orange/yellow highlight styles onto every <g role="button">
 *    child inside the floor-plan SVG so a human can confirm the polygons
 *    sit on top of the real MVRDV blueprint JPEGs rather than the old gray
 *    placeholder drawings.
 *    Artifacts written to the project root:
 *      overlay-alignment.png           (ground floor — the required artifact)
 *      overlay-alignment-{floor}.png   (one per floor for complete coverage)
 *
 * 2. ROUTING INTEGRITY
 *    Reads the aria-label of every <g role="button"> on each floor, reconstructs
 *    the space code the onClick handler would pass to router.push(), then asserts
 *    GET /spaces/{code} returns HTTP 200 — not 404.
 *    Also performs one real browser click to confirm the end-to-end path works.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Prerequisites: dev server must be running on http://localhost:3000
 *
 * Run:
 *   npx playwright test tests/svg-overlay.spec.ts --project=chromium
 *
 * Or with visible browser for debugging:
 *   npx playwright test tests/svg-overlay.spec.ts --project=chromium --headed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test'
import path from 'path'

const BASE = 'http://localhost:3000'

/** Floor selector pills in the order they appear in the UI */
const FLOORS = [
  { key: 'l0',        label: 'Ground Floor' },
  { key: 'l3',        label: '3rd Floor'    },
  { key: 'l_minus_1', label: 'B1 Floor'     },
  { key: 'roof',      label: 'Roof'          },
  { key: 'exterior',  label: 'Ext. Boxes'    },
] as const

/**
 * Injected CSS that makes every clickable SVG polygon glow so a human reviewer
 * can compare the highlighted outlines against the MVRDV blueprint background.
 *
 * Selects only elements INSIDE <g role="button"> wrappers — legend squares,
 * tooltip boxes, and structural stroke-only lines are intentionally unaffected.
 */
const HIGHLIGHT_CSS = `
  svg g[role="button"] polygon,
  svg g[role="button"] path,
  svg g[role="button"] rect {
    fill: rgba(255, 90, 0, 0.62) !important;
    stroke: #ffff00 !important;
    stroke-width: 3px !important;
    opacity: 1 !important;
  }
`

/**
 * Derive the space code from an SVG button's aria-label given the active floor.
 *
 * aria-label formats by floor component:
 *   l0, l_minus_1, exterior  →  "{CODE} — {status} — {n} pax"
 *   l3                        →  "{COLOR} Box — {status} — {n} pax"
 *   roof                      →  "{COLOR} Roof Box — {status} — {n} pax"
 *
 * These map to mock-data.ts codes:
 *   l3    "RED Box"          → "L3-RED"
 *   roof  "YELLOW Roof Box"  → "ROOF-YELLOW"
 *   all others are used verbatim (A1, B1, GREEN, BE3, …)
 */
function parseCode(ariaLabel: string, floor: string): string {
  const raw = (ariaLabel.split(' — ')[0] ?? '').trim().toUpperCase()
  if (floor === 'l3')   return `L3-${raw.replace(/ BOX$/, '').trim()}`
  if (floor === 'roof') return `ROOF-${raw.replace(/ ROOF BOX$/, '').trim()}`
  return raw
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Click a floor pill and wait for the API fetch triggered by the floor switch. */
async function switchFloor(
  page: import('@playwright/test').Page,
  label: string,
) {
  // Use CSS text filter to avoid matching SVG g[role="button"] aria-labels
  await page.locator('button').filter({ hasText: label }).first().click()
  // networkidle waits for the /api/spaces?floor=… fetch to settle
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {})
  // Confirm at least one interactive SVG element is visible on the new floor
  await page
    .locator('svg g[role="button"]')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {})
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('SVG Overlay & Routing Audit', () => {

  // ── 1. VISUAL ALIGNMENT ────────────────────────────────────────────────────
  test('1 · visual alignment — highlight polygons and screenshot every floor', async ({ page }) => {
    await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })

    // Ground floor is the default — wait for its SVG elements to mount
    await page
      .locator('svg g[role="button"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })

    // Inject highlight CSS once. Because floor switches are in-page state changes
    // (URL stays /spaces), the <style> tag persists through React re-renders.
    await page.addStyleTag({ content: HIGHLIGHT_CSS })

    // ── Required artifact: ground floor screenshot ──
    await page.screenshot({
      path: path.join(process.cwd(), 'overlay-alignment.png'),
      fullPage: true,
    })
    console.log('\n📸 Saved: overlay-alignment.png  (ground floor — primary artifact)')

    // ── Per-floor screenshots for complete visual coverage ──
    // Ground floor already captured above; start from l3 onward
    for (const { key, label } of FLOORS) {
      await switchFloor(page, label)
      await page.screenshot({
        path: path.join(process.cwd(), `overlay-alignment-${key}.png`),
        fullPage: true,
      })
      console.log(`📸 Saved: overlay-alignment-${key}.png  (${label})`)
    }
  })

  // ── 2. ROUTING INTEGRITY ──────────────────────────────────────────────────
  test('2 · routing — every SVG button code returns HTTP 200', async ({ page }) => {
    await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })

    type Check = { code: string; floor: string; route: string; status: number }
    const checks: Check[] = []

    for (const { key, label } of FLOORS) {
      // Switch to the target floor (ground floor is already active on first iteration)
      if (key !== 'l0') {
        await switchFloor(page, label)
      } else {
        // Ground floor — wait for initial render
        await page
          .locator('svg g[role="button"]')
          .first()
          .waitFor({ state: 'visible', timeout: 15_000 })
      }

      const buttons = page.locator('svg g[role="button"]')
      const count = await buttons.count()

      for (let i = 0; i < count; i++) {
        const ariaLabel = (await buttons.nth(i).getAttribute('aria-label')) ?? ''
        const code = parseCode(ariaLabel, key)
        if (!code) continue

        const route = `/spaces/${code.toLowerCase()}`
        const res = await page.request.get(`${BASE}${route}`)
        const status = res.status()

        checks.push({ code, floor: key, route, status })

        expect
          .soft(status, `[${code} · ${key}] GET ${route} should return 200 (got ${status})`)
          .toBe(200)
      }
    }

    // Summary
    const failed = checks.filter(c => c.status !== 200)
    const passed = checks.filter(c => c.status === 200)

    console.log(
      `\n📊 Routing results: ${passed.length}/${checks.length} OK` +
      (failed.length ? ` — ❌ ${failed.length} broken:` : ' — ✅ no broken routes'),
    )
    failed.forEach(c => console.log(`   [${c.code}] ${c.route} → HTTP ${c.status}`))

    expect(checks.length, 'Must have found at least 1 interactive SVG element').toBeGreaterThan(0)
  })

  // ── 3. END-TO-END CLICK ────────────────────────────────────────────────────
  test('3 · e2e click — clicking the first ground-floor space navigates to its detail page', async ({ page }) => {
    await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })

    // Wait for ground floor SVG (default floor)
    await page
      .locator('svg g[role="button"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })

    // Identify the first clickable space
    const firstBtn = page.locator('svg g[role="button"]').first()
    const ariaLabel = (await firstBtn.getAttribute('aria-label')) ?? ''
    const code = parseCode(ariaLabel, 'l0')
    const expectedPath = `/spaces/${code.toLowerCase()}`

    console.log(`\n🖱  Clicking: aria-label="${ariaLabel}"`)
    console.log(`   Expected navigation → ${expectedPath}`)

    // Click and wait for router.push() to fire
    await Promise.all([
      page.waitForURL(`**${expectedPath}`, { timeout: 12_000 }),
      firstBtn.click(),
    ])

    // Confirm we landed on the correct URL
    expect(page.url()).toContain(expectedPath)

    // The Server Component renders <h1> immediately — no loading spinner
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })

    // Assert the page content is NOT a 404 error page
    const bodyText = (await page.locator('body').textContent()) ?? ''
    expect(bodyText).not.toMatch(/404|this page could not be found|page not found/i)

    console.log(`   ✅ Landed on ${page.url()} — <h1> visible, no 404 text`)
  })
})
