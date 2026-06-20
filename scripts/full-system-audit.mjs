#!/usr/bin/env node
/**
 * scripts/full-system-audit.mjs — exhaustive Playwright visual & functional audit
 *
 * Usage:  node scripts/full-system-audit.mjs
 *
 * Outputs screenshots to: ./tmp/audit/<route-label>/<shot>.png
 * Outputs JSON data log:   ./tmp/audit/audit-data.json
 *
 * Requires: dev server running at http://localhost:3000
 */

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT     = path.resolve(__dirname, '..')
const OUT_DIR  = path.join(ROOT, 'tmp', 'audit')
const BASE     = 'http://localhost:3001'
const VIEWPORT = { width: 1440, height: 900 }

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true })

// ── Routes to audit ──────────────────────────────────────────────────────────
const ROUTES = [
  { url: '/',                          label: 'landing',            waitMs: 5000, scrollable: true  },
  { url: '/spaces',                    label: 'spaces',             waitMs: 3000, scrollable: false },
  { url: '/spaces/BLUE',               label: 'detail-blue',        waitMs: 3000, scrollable: true  },
  { url: '/spaces/A1',                 label: 'detail-a1',          waitMs: 3000, scrollable: true  },
  { url: '/spaces/NONEXISTENT',        label: 'detail-404',         waitMs: 2000, scrollable: false },
  { url: '/book',                      label: 'book',               waitMs: 2000, scrollable: false },
  { url: '/book/confirmation?ref=TEST',label: 'confirmation',       waitMs: 4000, scrollable: false },
  { url: '/dashboard',                 label: 'dashboard',          waitMs: 3000, scrollable: true  },
  { url: '/dashboard/events',          label: 'dashboard-events',   waitMs: 3000, scrollable: true  },
  { url: '/dashboard/inventory',       label: 'dashboard-inventory',waitMs: 3000, scrollable: true  },
  { url: '/dashboard/conflicts',       label: 'dashboard-conflicts',waitMs: 3000, scrollable: false },
]

// ── Audit data accumulator ────────────────────────────────────────────────────
const auditData = []

// ── Console collector ────────────────────────────────────────────────────────
async function auditRoute(page, { url, label, waitMs, scrollable }) {
  const routeDir = path.join(OUT_DIR, label)
  fs.mkdirSync(routeDir, { recursive: true })

  const jsErrors   = []
  const consoleWrn = []
  const networkErr = []

  page.on('pageerror',    e  => jsErrors.push(e.message))
  page.on('console',      msg => { if (msg.type() === 'warning') consoleWrn.push(msg.text()) })
  page.on('requestfailed',req => networkErr.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`))

  console.log(`\n[AUDIT] ${label} → ${url}`)

  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(waitMs)

  // ── 1. Top-of-page viewport ───────────────────────────────────────────────
  await page.screenshot({ path: path.join(routeDir, '01-top.png') })
  console.log(`  ✓ 01-top.png`)

  // ── 2. Full-page screenshot ───────────────────────────────────────────────
  await page.screenshot({ path: path.join(routeDir, '02-fullpage.png'), fullPage: true })
  console.log(`  ✓ 02-fullpage.png`)

  // ── 3. Mid-scroll (if scrollable) ────────────────────────────────────────
  if (scrollable) {
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5))
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(routeDir, '03-midscroll.png') })
    console.log(`  ✓ 03-midscroll.png`)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(routeDir, '04-bottom.png') })
    console.log(`  ✓ 04-bottom.png`)

    // Return to top
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
  }

  // ── 4. Collect DOM diagnostics ────────────────────────────────────────────
  const domData = await page.evaluate(() => {
    // Check for overlapping elements (rough heuristic: elements with the same bounding box)
    const all = Array.from(document.querySelectorAll('[style*="position: absolute"], [style*="position:absolute"]'))
    const overlapSuspects = []
    all.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0 && r.top < window.innerHeight) {
        overlapSuspects.push({
          tag: el.tagName,
          text: el.textContent?.slice(0, 60),
          zIndex: window.getComputedStyle(el).zIndex,
          top: Math.round(r.top),
          left: Math.round(r.left),
          w: Math.round(r.width),
          h: Math.round(r.height),
        })
      }
    })

    // Check for non-mono numeric values
    const numericPattern = /\b[\d,]+(?:\.\d+)?(?:\s*(?:m²|pax|hr|EUR|€|\$|%)|\b)/
    const nonMonoNumbers = []
    document.querySelectorAll('p, span, td, div').forEach(el => {
      const style = window.getComputedStyle(el)
      const family = style.fontFamily.toLowerCase()
      const text = el.childNodes.length === 1 && el.firstChild?.nodeType === 3
        ? el.textContent?.trim() ?? ''
        : ''
      if (numericPattern.test(text) && !family.includes('jetbrains') && !family.includes('mono')) {
        nonMonoNumbers.push({ tag: el.tagName, text: text.slice(0, 80), font: style.fontFamily })
      }
    })

    // Check for placeholder copy
    const placeholderPhrases = ['lorem ipsum', 'placeholder', 'coming soon', 'todo', 'tbd', 'test content']
    const suspectCopy = []
    document.querySelectorAll('p, h1, h2, h3, span').forEach(el => {
      const t = (el.textContent ?? '').toLowerCase().trim()
      for (const phrase of placeholderPhrases) {
        if (t.includes(phrase)) {
          suspectCopy.push({ tag: el.tagName, text: el.textContent?.trim().slice(0, 80) })
        }
      }
    })

    // Check for unauthorized rounded corners (borderRadius > 0 outside known exceptions)
    const roundedViolations = []
    document.querySelectorAll('div, section, article, button, a').forEach(el => {
      const style = window.getComputedStyle(el)
      const br = style.borderRadius
      // Allow: 50% (circles), 24px (glass plate authorized), 2px (inputs)
      if (br && br !== '0px' && br !== '0%' && !br.startsWith('50%')) {
        const pxVal = parseFloat(br)
        if (!isNaN(pxVal) && pxVal > 2 && pxVal !== 24) {
          const text = el.textContent?.trim().slice(0, 50) ?? ''
          roundedViolations.push({ tag: el.tagName, borderRadius: br, text })
        }
      }
    })

    // Page meta
    const canvas = document.querySelector('canvas')
    const frameP = Array.from(document.querySelectorAll('p')).find(p => p.textContent?.includes('FRAME'))

    return {
      title: document.title,
      scrollHeight: document.body.scrollHeight,
      viewportH: window.innerHeight,
      canvasPresent: !!canvas,
      canvasSize: canvas ? `${canvas.width}×${canvas.height}` : null,
      frameCounter: frameP?.textContent ?? null,
      absoluteElements: overlapSuspects.length,
      nonMonoNumbers: nonMonoNumbers.slice(0, 20),
      suspectCopy: suspectCopy.slice(0, 10),
      roundedViolations: roundedViolations.slice(0, 20),
      h1Text: document.querySelector('h1')?.textContent?.trim() ?? null,
      allH: Array.from(document.querySelectorAll('h1,h2,h3')).map(h => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 60) })),
    }
  })

  // ── 5. Accessibility / contrast checks (heuristic) ───────────────────────
  const a11yData = await page.evaluate(() => {
    const issues = []
    // Images without alt text
    document.querySelectorAll('img:not([alt])').forEach(img => {
      issues.push({ type: 'img-no-alt', src: img.src.slice(0, 80) })
    })
    // Buttons without accessible name
    document.querySelectorAll('button').forEach(btn => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        issues.push({ type: 'button-no-label', html: btn.outerHTML.slice(0, 80) })
      }
    })
    // Links without href
    document.querySelectorAll('a:not([href])').forEach(a => {
      issues.push({ type: 'link-no-href', text: a.textContent?.trim().slice(0, 40) })
    })
    return issues
  })

  // ── 6. API health check (if route fetches data) ───────────────────────────
  let apiStatus = null
  const apiRoutes = {
    '/spaces/BLUE': '/api/spaces/BLUE',
    '/spaces/A1':   '/api/spaces/A1',
    '/dashboard':   '/api/dashboard/overview',
    '/dashboard/events': '/api/events',
    '/dashboard/inventory': '/api/inventory',
    '/dashboard/conflicts': '/api/conflicts',
  }
  if (apiRoutes[url]) {
    try {
      const resp = await page.request.get(`${BASE}${apiRoutes[url]}`)
      apiStatus = { endpoint: apiRoutes[url], status: resp.status(), ok: resp.ok() }
    } catch (e) {
      apiStatus = { endpoint: apiRoutes[url], error: String(e) }
    }
  }

  const result = {
    route: url,
    label,
    dom: domData,
    a11y: a11yData,
    apiStatus,
    jsErrors,
    consoleWarnings: consoleWrn,
    networkErrors: networkErr,
  }

  auditData.push(result)

  // Print summary
  const issues = jsErrors.length + domData.nonMonoNumbers.length + domData.suspectCopy.length + a11yData.length
  console.log(`  DOM: scrollH=${domData.scrollHeight} | h1="${domData.h1Text ?? 'none'}"`)
  if (jsErrors.length)               console.log(`  ⚠ JS errors: ${jsErrors.length}`)
  if (domData.nonMonoNumbers.length) console.log(`  ⚠ Non-mono numbers: ${domData.nonMonoNumbers.length}`)
  if (domData.suspectCopy.length)    console.log(`  ⚠ Suspect copy: ${domData.suspectCopy.length}`)
  if (domData.roundedViolations.length) console.log(`  ⚠ Rounded corners: ${domData.roundedViolations.length}`)
  if (a11yData.length)               console.log(`  ⚠ A11y issues: ${a11yData.length}`)
  if (apiStatus)                     console.log(`  API ${apiStatus.endpoint}: ${apiStatus.status ?? apiStatus.error}`)
  if (issues === 0)                  console.log(`  ✓ No automated issues detected`)

  // Reset event listeners for next page
  page.removeAllListeners('pageerror')
  page.removeAllListeners('console')
  page.removeAllListeners('requestfailed')

  return result
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════')
console.log(' PIRAMIDA BACKSTAGE — FULL SYSTEM PLAYWRIGHT AUDIT')
console.log(`══════════════════════════════════════════════════════`)
console.log(`Target:   ${BASE}`)
console.log(`Viewport: ${VIEWPORT.width}×${VIEWPORT.height}`)
console.log(`Output:   ${OUT_DIR}`)
console.log(`Routes:   ${ROUTES.length}`)
console.log('══════════════════════════════════════════════════════')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: VIEWPORT })
const page    = await context.newPage()

for (const route of ROUTES) {
  try {
    await auditRoute(page, route)
  } catch (err) {
    console.error(`  ✗ FAILED: ${route.label} — ${err.message}`)
    auditData.push({ route: route.url, label: route.label, error: err.message })
  }
}

await browser.close()

// ── Write JSON log ────────────────────────────────────────────────────────────
const jsonPath = path.join(OUT_DIR, 'audit-data.json')
fs.writeFileSync(jsonPath, JSON.stringify(auditData, null, 2))

console.log('\n══════════════════════════════════════════════════════')
console.log(` AUDIT COMPLETE — ${ROUTES.length} routes processed`)
console.log(`══════════════════════════════════════════════════════`)
console.log(`Screenshots: ${OUT_DIR}/<route>/`)
console.log(`JSON log:    ${jsonPath}`)
console.log('══════════════════════════════════════════════════════')
