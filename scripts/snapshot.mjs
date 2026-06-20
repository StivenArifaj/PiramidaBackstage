#!/usr/bin/env node
/**
 * scripts/snapshot.mjs — visual audit tool
 * Usage: node scripts/snapshot.mjs
 * Saves screenshots to /tmp/audit-*.png
 */
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs'

const BASE = 'http://localhost:3000'
const VIEWPORT = { width: 1440, height: 900 }

const browser = await chromium.launch({ headless: true })
const page    = await browser.newPage()
await page.setViewportSize(VIEWPORT)

const errors = []
page.on('pageerror', e => errors.push(e.message))

async function snap(url, label) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(4000)
  // at-load (top of page)
  await page.screenshot({ path: `/tmp/audit-${label}-top.png` })
  // scroll 60% into video zone
  const vh = VIEWPORT.height
  await page.evaluate((h) => window.scrollTo(0, h * 1.8), vh)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/tmp/audit-${label}-mid.png` })
  // scroll completely past video zone
  await page.evaluate((h) => window.scrollTo(0, h * 3.5), vh)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/tmp/audit-${label}-past.png` })
  // back to top, full-page
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.screenshot({ path: `/tmp/audit-${label}-fullpage.png`, fullPage: true })

  const frame = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p'))
      .find(el => el.textContent?.includes('FRAME'))
    const canvas = document.querySelector('canvas')
    return {
      frameCounter: p?.textContent,
      canvasSize: canvas ? `${canvas.width}×${canvas.height}` : 'none',
      scrollHeight: document.body.scrollHeight,
    }
  })
  console.log(`[${label}]`, JSON.stringify(frame))
}

await snap('/', 'landing')
await snap('/spaces/BLUE', 'detail')

if (errors.length) console.error('JS errors:', errors)
console.log('\nSaved: /tmp/audit-landing-{top,mid,past,fullpage}.png')
console.log('       /tmp/audit-detail-{top,mid,past,fullpage}.png')

await browser.close()
