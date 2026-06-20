/**
 * Piramida Backstage — Brute-Force Visual Screenshot Sweep
 *
 * Visits /spaces, injects red-highlight CSS onto ALL SVG polygons so the
 * human developer can visually verify overlay alignment against the real
 * MVRDV blueprint backgrounds.  No assertions — just screenshots.
 *
 * Run (dev server must be on http://localhost:3000):
 *   npx playwright test tests/visual-sweep.spec.ts --project=chromium
 */

import { test } from '@playwright/test'

const FLOORS = [
  { label: 'Ground Floor', slug: 'ground'   },
  { label: 'B1 Floor',     slug: 'b1'       },
  { label: '3rd Floor',    slug: '3rd'      },
  { label: 'Roof',         slug: 'roof'     },
  { label: 'Ext. Boxes',   slug: 'exterior' },
]

const HIGHLIGHT = `
  polygon, path, rect {
    fill: rgba(255, 0, 0, 0.5) !important;
    stroke: red !important;
    stroke-width: 2px !important;
  }
`

test('visual sweep — screenshot every floor with SVG polygons highlighted', async ({ page }) => {
  await page.goto('http://localhost:3000/spaces')

  // Inject once — persists across in-page floor switches
  await page.addStyleTag({ content: HIGHLIGHT })

  for (const { label, slug } of FLOORS) {
    await page.getByText(label).first().click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `audit-floor-${slug}.png`, fullPage: true })
    console.log(`📸  audit-floor-${slug}.png`)
  }
})
