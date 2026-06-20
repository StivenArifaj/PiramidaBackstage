/**
 * Piramida Backstage — Exhaustive Space Pages Audit
 *
 * Visits every space detail page, validates rendered data against the live API
 * (which mirrors either Supabase or mock-data depending on env vars), and
 * writes a full Markdown report to spaces-audit-report.md.
 *
 * Run with dev server active:
 *   npx playwright test tests/spaces-audit.spec.ts
 */

import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3000'
const REPORT = path.join(process.cwd(), 'spaces-audit-report.md')

const FLOORS = ['l0', 'l3', 'l_minus_1', 'roof', 'exterior'] as const

interface AuditSpace {
  code: string
  name: string
  floor: string
  capacity_pax: number
  photo_urls: string[]
}

interface AuditResult {
  code: string
  name: string
  floor: string
  h1Ok: boolean
  h1Found: string
  capacityOk: boolean
  imageStatus: '✅' | '❌' | '⚠️'
  imageNote: string
}

test('exhaustive space pages audit', async ({ page }) => {
  // ── 1. Collect all spaces from the live API ───────────────────────────────
  const spaces: AuditSpace[] = []

  for (const floor of FLOORS) {
    const res = await page.request.get(`${BASE}/api/spaces?floor=${floor}`)
    if (!res.ok()) {
      console.warn(`⚠ /api/spaces?floor=${floor} returned ${res.status()}`)
      continue
    }
    const body = await res.json()
    const floorSpaces: AuditSpace[] = body.spaces ?? []
    spaces.push(...floorSpaces)
  }

  expect(spaces.length, 'API must return at least 1 space').toBeGreaterThan(0)

  // ── 2. Initialise the Markdown report ────────────────────────────────────
  const header = [
    '# Piramida Backstage — Spaces Audit Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Dev server:** ${BASE}`,
    `**Total spaces from API:** ${spaces.length}`,
    '',
    '| # | Code | Name | Floor | `<h1>` | Capacity | Image | Notes |',
    '|---|------|------|-------|:------:|:--------:|:-----:|-------|',
  ].join('\n')

  fs.writeFileSync(REPORT, header + '\n')

  // ── 3. Audit every space page ─────────────────────────────────────────────
  const results: AuditResult[] = []

  for (let i = 0; i < spaces.length; i++) {
    const space = spaces[i]

    // Navigate and wait for client-side data fetch to complete
    await page.goto(`${BASE}/spaces/${space.code}`, { waitUntil: 'networkidle' })

    // The page shows "loading space data..." until the API responds.
    // Wait for h1 to appear (means data is loaded and rendered).
    const h1Locator = page.locator('h1').first()
    await h1Locator.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {})

    // ── Check 1: <h1> text matches expected space name ──────────────────
    const h1Text = (await h1Locator.textContent().catch(() => ''))?.trim() ?? ''
    const h1Ok = h1Text === space.name

    // ── Check 2: Capacity number present anywhere in the DOM ────────────
    const bodyText = (await page.locator('body').textContent().catch(() => '')) ?? ''
    const capacityOk = bodyText.includes(String(space.capacity_pax))

    // ── Check 3: Primary image loaded ───────────────────────────────────
    let imageStatus: '✅' | '❌' | '⚠️' = '⚠️'
    let imageNote = 'no photo_urls configured'

    if (space.photo_urls.length > 0) {
      const primaryUrl = space.photo_urls[0]

      // Check the img element is in the DOM
      const imgLocator = page.locator(`img[src="${primaryUrl}"]`).first()
      const imgCount = await imgLocator.count()

      if (imgCount === 0) {
        imageStatus = '❌'
        imageNote = `img not in DOM — src: ${primaryUrl}`
      } else {
        // Verify the image actually decoded (naturalWidth > 0 = HTTP 200 + decoded)
        const naturalWidth = await page.evaluate((src: string) => {
          const el = document.querySelector(`img[src="${src}"]`) as HTMLImageElement | null
          return el?.naturalWidth ?? 0
        }, primaryUrl)

        if (naturalWidth > 0) {
          imageStatus = '✅'
          imageNote = ''
        } else {
          imageStatus = '❌'
          imageNote = `img in DOM but failed to decode (404 or broken) — src: ${primaryUrl}`
        }
      }
    }

    const result: AuditResult = {
      code: space.code,
      name: space.name,
      floor: space.floor,
      h1Ok,
      h1Found: h1Text,
      capacityOk,
      imageStatus,
      imageNote,
    }
    results.push(result)

    // Build notes column
    const notes: string[] = []
    if (!h1Ok) notes.push(`h1 found: \`${h1Text || '(empty)'}\``)
    if (!capacityOk) notes.push(`capacity ${space.capacity_pax} pax not found in DOM`)
    if (imageNote) notes.push(imageNote)

    const row = `| ${i + 1} | \`${space.code}\` | ${space.name} | \`${space.floor}\` | ${h1Ok ? '✅' : '❌'} | ${capacityOk ? '✅' : '❌'} | ${imageStatus} | ${notes.join(' · ') || '—'} |`
    fs.appendFileSync(REPORT, row + '\n')

    // Soft assertions: test keeps running even if one space fails
    expect.soft(h1Ok, `[${space.code}] <h1> should be "${space.name}", got "${h1Text}"`).toBe(true)
    expect.soft(capacityOk, `[${space.code}] capacity_pax ${space.capacity_pax} must appear in DOM`).toBe(true)
  }

  // ── 4. Write summary ──────────────────────────────────────────────────────
  const h1Failures    = results.filter(r => !r.h1Ok)
  const capFailures   = results.filter(r => !r.capacityOk)
  const imgFailures   = results.filter(r => r.imageStatus === '❌')
  const imgWarnings   = results.filter(r => r.imageStatus === '⚠️')
  const totalFailed   = results.filter(r => !r.h1Ok || !r.capacityOk || r.imageStatus === '❌')
  const totalPassed   = results.filter(r => r.h1Ok && r.capacityOk && r.imageStatus !== '❌')

  const summaryLines = [
    '',
    '---',
    '',
    '## Summary',
    '',
    `| Check | Passed | Failed | Warned |`,
    `|-------|--------|--------|--------|`,
    `| \`<h1>\` name match | ${results.length - h1Failures.length} | ${h1Failures.length} | — |`,
    `| Capacity in DOM | ${results.length - capFailures.length} | ${capFailures.length} | — |`,
    `| Primary image loaded | ${results.length - imgFailures.length - imgWarnings.length} | ${imgFailures.length} | ${imgWarnings.length} (no photo) |`,
    `| **Overall** | **${totalPassed.length}** | **${totalFailed.length}** | — |`,
    '',
  ]

  if (h1Failures.length > 0) {
    summaryLines.push('### ❌ H1 Failures', '')
    h1Failures.forEach(r => summaryLines.push(`- \`${r.code}\` — expected \`${r.name}\`, got \`${r.h1Found || '(empty)'}\``))
    summaryLines.push('')
  }

  if (capFailures.length > 0) {
    summaryLines.push('### ❌ Capacity Not Found', '')
    capFailures.forEach(r => summaryLines.push(`- \`${r.code}\` — capacity not in DOM`))
    summaryLines.push('')
  }

  if (imgFailures.length > 0) {
    summaryLines.push('### ❌ Image Failures', '')
    imgFailures.forEach(r => summaryLines.push(`- \`${r.code}\` — ${r.imageNote}`))
    summaryLines.push('')
  }

  if (imgWarnings.length > 0) {
    summaryLines.push('### ⚠️ Spaces Without Photos (non-blocking)', '')
    imgWarnings.forEach(r => summaryLines.push(`- \`${r.code}\` (${r.floor}) — no photo_urls in data`))
    summaryLines.push('')
  }

  if (totalFailed.length === 0) {
    summaryLines.push('### ✅ All checks passed — every space page renders correct data.')
  }

  fs.appendFileSync(REPORT, summaryLines.join('\n') + '\n')

  console.log(`\n📋 Audit report → ${REPORT}`)
  console.log(`   ${totalPassed.length}/${results.length} spaces fully passed | ${totalFailed.length} failed | ${imgWarnings.length} without photos`)
})
