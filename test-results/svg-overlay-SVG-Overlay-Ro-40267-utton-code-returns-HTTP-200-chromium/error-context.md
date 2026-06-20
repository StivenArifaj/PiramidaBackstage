# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: svg-overlay.spec.ts >> SVG Overlay & Routing Audit >> 2 · routing — every SVG button code returns HTTP 200
- Location: tests/svg-overlay.spec.ts:141:7

# Error details

```
Error: [A16 · l0] GET /spaces/a16 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [A17 · l0] GET /spaces/a17 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [A18 · l0] GET /spaces/a18 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [A19 · l0] GET /spaces/a19 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [RF · l0] GET /spaces/rf should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3 · l0] GET /spaces/l3 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L0 · l0] GET /spaces/l0 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [EX · l0] GET /spaces/ex should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3-RF · l3] GET /spaces/l3-rf should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3-L3 · l3] GET /spaces/l3-l3 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3-L0 · l3] GET /spaces/l3-l0 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3-B1 · l3] GET /spaces/l3-b1 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3-EX · l3] GET /spaces/l3-ex should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [RF · l_minus_1] GET /spaces/rf should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3 · l_minus_1] GET /spaces/l3 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L0 · l_minus_1] GET /spaces/l0 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [EX · l_minus_1] GET /spaces/ex should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [ROOF-RF · roof] GET /spaces/roof-rf should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [ROOF-L3 · roof] GET /spaces/roof-l3 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [ROOF-L0 · roof] GET /spaces/roof-l0 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [ROOF-B1 · roof] GET /spaces/roof-b1 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [ROOF-EX · roof] GET /spaces/roof-ex should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [RF · exterior] GET /spaces/rf should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L3 · exterior] GET /spaces/l3 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [L0 · exterior] GET /spaces/l0 should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

```
Error: [EX · exterior] GET /spaces/ex should return 200 (got 404)

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "piramida backstage" [ref=e5] [cursor=pointer]:
          - /url: /
          - img [ref=e6]
          - generic [ref=e10]:
            - generic [ref=e11]: piramida
            - generic [ref=e12]: backstage
        - navigation [ref=e13]:
          - link "spaces" [ref=e14] [cursor=pointer]:
            - /url: /spaces
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - paragraph [ref=e18]: pyramid of tirana
          - heading "select a floor" [level=1] [ref=e19]
        - generic [ref=e21]:
          - button "Roof" [ref=e24] [cursor=pointer]
          - button "3rd Floor" [ref=e26] [cursor=pointer]
          - button "Ground Floor" [ref=e28] [cursor=pointer]
          - button "B1 Floor" [ref=e30] [cursor=pointer]
          - generic [ref=e31]:
            - generic [ref=e33]: EX
            - button "Ext. Boxes" [active] [ref=e34] [cursor=pointer]
          - paragraph [ref=e36]: pyramid of tirana — select floor
          - paragraph [ref=e38]: Ext. Boxes
        - generic [ref=e39]:
          - generic [ref=e40]:
            - paragraph [ref=e41]: 80+
            - paragraph [ref=e42]: total spaces
          - generic [ref=e43]:
            - paragraph [ref=e44]: "5"
            - paragraph [ref=e45]: floors
          - generic [ref=e46]:
            - paragraph [ref=e47]: "300"
            - paragraph [ref=e48]: max capacity
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - paragraph [ref=e52]: floor plan
            - heading "Exterior Boxes" [level=2] [ref=e53]
            - paragraph [ref=e54]: Kutitë Jashtë
          - generic [ref=e55]:
            - generic [ref=e56]: "16"
            - generic [ref=e57]: available
        - img "Exterior — Pyramid of Tirana" [ref=e62]:
          - button "BE1 — available — 40 pax" [ref=e77] [cursor=pointer]:
            - generic [ref=e82]: BE1
          - button "BE2 — available — 65 pax" [ref=e83] [cursor=pointer]:
            - generic [ref=e88]: BE2
          - button "BE3 — available — 90 pax" [ref=e89] [cursor=pointer]:
            - generic [ref=e94]: BE3
          - button "BE4 — available — 115 pax" [ref=e95] [cursor=pointer]:
            - generic [ref=e100]: BE4
          - button "BE5 — available — 40 pax" [ref=e101] [cursor=pointer]:
            - generic [ref=e106]: BE5
          - button "BE6 — available — 65 pax" [ref=e107] [cursor=pointer]:
            - generic [ref=e112]: BE6
          - button "BE7 — available — 90 pax" [ref=e113] [cursor=pointer]:
            - generic [ref=e118]: BE7
          - button "BE8 — available — 115 pax" [ref=e119] [cursor=pointer]:
            - generic [ref=e124]: BE8
          - button "BE9 — available — 40 pax" [ref=e125] [cursor=pointer]:
            - generic [ref=e130]: BE9
          - button "BE10 — available — 65 pax" [ref=e131] [cursor=pointer]:
            - generic [ref=e136]: BE10
          - button "BE11 — available — 90 pax" [ref=e137] [cursor=pointer]:
            - generic [ref=e142]: BE11
          - button "BE12 — available — 115 pax" [ref=e143] [cursor=pointer]:
            - generic [ref=e148]: BE12
          - button "BE13 — available — 40 pax" [ref=e149] [cursor=pointer]:
            - generic [ref=e154]: BE13
          - button "BE14 — available — 65 pax" [ref=e155] [cursor=pointer]:
            - generic [ref=e160]: BE14
          - button "BE15 — available — 90 pax" [ref=e161] [cursor=pointer]:
            - generic [ref=e166]: BE15
          - button "BE16 — available — 115 pax" [ref=e167] [cursor=pointer]:
            - generic [ref=e172]: BE16
          - generic [ref=e173]: EXTERIOR — JASHTË NDËRTESËS
          - generic [ref=e176]: "N"
          - generic [ref=e177]:
            - generic [ref=e180]: available
            - generic [ref=e183]: reserved
            - generic [ref=e186]: pending
            - generic [ref=e189]: blocked
        - paragraph [ref=e191]: click any space to view details and book
    - generic "Floor navigator" [ref=e192]:
      - img [ref=e193]:
        - button "RF" [ref=e194] [cursor=pointer]:
          - generic [ref=e196]: RF
        - button "L3" [ref=e197] [cursor=pointer]:
          - generic [ref=e199]: L3
        - button "L0" [ref=e200] [cursor=pointer]:
          - generic [ref=e202]: L0
        - button "B1" [ref=e203] [cursor=pointer]:
          - generic [ref=e205]: B1
        - button "EX" [ref=e206] [cursor=pointer]:
          - generic [ref=e209]: EX
  - button "Open Piramida AI assistant" [ref=e212] [cursor=pointer]:
    - img [ref=e213]
    - generic [ref=e218]: ai
  - button "Open Next.js Dev Tools" [ref=e224] [cursor=pointer]:
    - img [ref=e225]
  - alert [ref=e228]
```

# Test source

```ts
  75  |  *   all others are used verbatim (A1, B1, GREEN, BE3, …)
  76  |  */
  77  | function parseCode(ariaLabel: string, floor: string): string {
  78  |   const raw = (ariaLabel.split(' — ')[0] ?? '').trim().toUpperCase()
  79  |   if (floor === 'l3')   return `L3-${raw.replace(/ BOX$/, '').trim()}`
  80  |   if (floor === 'roof') return `ROOF-${raw.replace(/ ROOF BOX$/, '').trim()}`
  81  |   return raw
  82  | }
  83  | 
  84  | // ─── Helpers ─────────────────────────────────────────────────────────────────
  85  | 
  86  | /** Click a floor pill and wait for the API fetch triggered by the floor switch. */
  87  | async function switchFloor(
  88  |   page: import('@playwright/test').Page,
  89  |   label: string,
  90  | ) {
  91  |   // Use CSS text filter to avoid matching SVG g[role="button"] aria-labels
  92  |   await page.locator('button').filter({ hasText: label }).first().click()
  93  |   // networkidle waits for the /api/spaces?floor=… fetch to settle
  94  |   await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {})
  95  |   // Confirm at least one interactive SVG element is visible on the new floor
  96  |   await page
  97  |     .locator('svg g[role="button"]')
  98  |     .first()
  99  |     .waitFor({ state: 'visible', timeout: 10_000 })
  100 |     .catch(() => {})
  101 | }
  102 | 
  103 | // ─── Test suite ───────────────────────────────────────────────────────────────
  104 | 
  105 | test.describe('SVG Overlay & Routing Audit', () => {
  106 | 
  107 |   // ── 1. VISUAL ALIGNMENT ────────────────────────────────────────────────────
  108 |   test('1 · visual alignment — highlight polygons and screenshot every floor', async ({ page }) => {
  109 |     await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })
  110 | 
  111 |     // Ground floor is the default — wait for its SVG elements to mount
  112 |     await page
  113 |       .locator('svg g[role="button"]')
  114 |       .first()
  115 |       .waitFor({ state: 'visible', timeout: 15_000 })
  116 | 
  117 |     // Inject highlight CSS once. Because floor switches are in-page state changes
  118 |     // (URL stays /spaces), the <style> tag persists through React re-renders.
  119 |     await page.addStyleTag({ content: HIGHLIGHT_CSS })
  120 | 
  121 |     // ── Required artifact: ground floor screenshot ──
  122 |     await page.screenshot({
  123 |       path: path.join(process.cwd(), 'overlay-alignment.png'),
  124 |       fullPage: true,
  125 |     })
  126 |     console.log('\n📸 Saved: overlay-alignment.png  (ground floor — primary artifact)')
  127 | 
  128 |     // ── Per-floor screenshots for complete visual coverage ──
  129 |     // Ground floor already captured above; start from l3 onward
  130 |     for (const { key, label } of FLOORS) {
  131 |       await switchFloor(page, label)
  132 |       await page.screenshot({
  133 |         path: path.join(process.cwd(), `overlay-alignment-${key}.png`),
  134 |         fullPage: true,
  135 |       })
  136 |       console.log(`📸 Saved: overlay-alignment-${key}.png  (${label})`)
  137 |     }
  138 |   })
  139 | 
  140 |   // ── 2. ROUTING INTEGRITY ──────────────────────────────────────────────────
  141 |   test('2 · routing — every SVG button code returns HTTP 200', async ({ page }) => {
  142 |     await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })
  143 | 
  144 |     type Check = { code: string; floor: string; route: string; status: number }
  145 |     const checks: Check[] = []
  146 | 
  147 |     for (const { key, label } of FLOORS) {
  148 |       // Switch to the target floor (ground floor is already active on first iteration)
  149 |       if (key !== 'l0') {
  150 |         await switchFloor(page, label)
  151 |       } else {
  152 |         // Ground floor — wait for initial render
  153 |         await page
  154 |           .locator('svg g[role="button"]')
  155 |           .first()
  156 |           .waitFor({ state: 'visible', timeout: 15_000 })
  157 |       }
  158 | 
  159 |       const buttons = page.locator('svg g[role="button"]')
  160 |       const count = await buttons.count()
  161 | 
  162 |       for (let i = 0; i < count; i++) {
  163 |         const ariaLabel = (await buttons.nth(i).getAttribute('aria-label')) ?? ''
  164 |         const code = parseCode(ariaLabel, key)
  165 |         if (!code) continue
  166 | 
  167 |         const route = `/spaces/${code.toLowerCase()}`
  168 |         const res = await page.request.get(`${BASE}${route}`)
  169 |         const status = res.status()
  170 | 
  171 |         checks.push({ code, floor: key, route, status })
  172 | 
  173 |         expect
  174 |           .soft(status, `[${code} · ${key}] GET ${route} should return 200 (got ${status})`)
> 175 |           .toBe(200)
      |            ^ Error: [EX · exterior] GET /spaces/ex should return 200 (got 404)
  176 |       }
  177 |     }
  178 | 
  179 |     // Summary
  180 |     const failed = checks.filter(c => c.status !== 200)
  181 |     const passed = checks.filter(c => c.status === 200)
  182 | 
  183 |     console.log(
  184 |       `\n📊 Routing results: ${passed.length}/${checks.length} OK` +
  185 |       (failed.length ? ` — ❌ ${failed.length} broken:` : ' — ✅ no broken routes'),
  186 |     )
  187 |     failed.forEach(c => console.log(`   [${c.code}] ${c.route} → HTTP ${c.status}`))
  188 | 
  189 |     expect(checks.length, 'Must have found at least 1 interactive SVG element').toBeGreaterThan(0)
  190 |   })
  191 | 
  192 |   // ── 3. END-TO-END CLICK ────────────────────────────────────────────────────
  193 |   test('3 · e2e click — clicking the first ground-floor space navigates to its detail page', async ({ page }) => {
  194 |     await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })
  195 | 
  196 |     // Wait for ground floor SVG (default floor)
  197 |     await page
  198 |       .locator('svg g[role="button"]')
  199 |       .first()
  200 |       .waitFor({ state: 'visible', timeout: 15_000 })
  201 | 
  202 |     // Identify the first clickable space
  203 |     const firstBtn = page.locator('svg g[role="button"]').first()
  204 |     const ariaLabel = (await firstBtn.getAttribute('aria-label')) ?? ''
  205 |     const code = parseCode(ariaLabel, 'l0')
  206 |     const expectedPath = `/spaces/${code.toLowerCase()}`
  207 | 
  208 |     console.log(`\n🖱  Clicking: aria-label="${ariaLabel}"`)
  209 |     console.log(`   Expected navigation → ${expectedPath}`)
  210 | 
  211 |     // Click and wait for router.push() to fire
  212 |     await Promise.all([
  213 |       page.waitForURL(`**${expectedPath}`, { timeout: 12_000 }),
  214 |       firstBtn.click(),
  215 |     ])
  216 | 
  217 |     // Confirm we landed on the correct URL
  218 |     expect(page.url()).toContain(expectedPath)
  219 | 
  220 |     // The Server Component renders <h1> immediately — no loading spinner
  221 |     await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
  222 | 
  223 |     // Assert the page content is NOT a 404 error page
  224 |     const bodyText = (await page.locator('body').textContent()) ?? ''
  225 |     expect(bodyText).not.toMatch(/404|this page could not be found|page not found/i)
  226 | 
  227 |     console.log(`   ✅ Landed on ${page.url()} — <h1> visible, no 404 text`)
  228 |   })
  229 | })
  230 | 
```