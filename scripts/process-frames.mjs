#!/usr/bin/env node
/**
 * scripts/process-frames.mjs
 *
 * Renames Ezgif frames from root source directories, moves them to
 * /public/frames/<dest>/ with 4-digit zero-padded filenames, then deletes
 * the source directories.
 *
 * Usage:  node scripts/process-frames.mjs
 *
 * Sources expected in project root:
 *   background1/  → /public/frames/detail-sample/
 *   background2/  → /public/frames/hero/
 *
 * No dependencies beyond Node built-ins.
 * Compression is skipped (frames average ~130 KB, well under 500 KB limit).
 */

import { readdir, rename, mkdir, stat, rm, access } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = join(__dirname, '..')

const IMAGE_RE = /\.(jpe?g|png|webp)$/i

async function exists(p) {
  try { await access(p); return true } catch { return false }
}

/**
 * Moves and renames all image files from srcDir into destDir.
 * Files are sorted alphabetically (preserves Ezgif's original order),
 * then renamed 0001.ext … NNNN.ext.
 * The source directory is deleted once all files are moved.
 *
 * @returns {{ count: number, totalBytes: number } | null}
 */
async function processSource(srcDir, destDir, label) {
  if (!await exists(srcDir)) {
    console.log(`⚠  ${label}: "${srcDir}" not found — skipping.`)
    return null
  }

  const all   = await readdir(srcDir)
  const files = all.filter(f => IMAGE_RE.test(f)).sort()

  if (files.length === 0) {
    console.log(`⚠  ${label}: no image files in "${srcDir}" — skipping.`)
    return null
  }

  await mkdir(destDir, { recursive: true })

  let totalBytes = 0
  let errors     = 0

  for (let i = 0; i < files.length; i++) {
    const src  = join(srcDir, files[i])
    const ext  = extname(files[i]).toLowerCase()
    const dest = join(destDir, `${String(i + 1).padStart(4, '0')}${ext}`)

    try {
      const { size } = await stat(src)
      totalBytes += size
      await rename(src, dest)
    } catch (err) {
      console.error(`  ✗ failed to move ${files[i]}:`, err.message)
      errors++
    }

    if ((i + 1) % 50 === 0 || i + 1 === files.length) {
      const pct = Math.round(((i + 1) / files.length) * 100)
      process.stdout.write(`\r  ${label}: ${i + 1}/${files.length} (${pct}%)   `)
    }
  }

  process.stdout.write('\n')

  if (errors === 0) {
    // Only delete source dir if all files moved successfully
    try {
      await rm(srcDir, { recursive: true })
    } catch (err) {
      console.warn(`  ⚠ could not remove source dir: ${err.message}`)
    }
  } else {
    console.warn(`  ⚠ ${errors} errors — source dir "${srcDir}" was NOT deleted.`)
  }

  const mb    = (totalBytes / 1024 / 1024).toFixed(2)
  const avgKb = files.length > 0 ? Math.round(totalBytes / files.length / 1024) : 0

  console.log(`✓  ${label}`)
  console.log(`   ${files.length} frames → ${destDir}`)
  console.log(`   Total: ${mb} MB  |  Avg: ${avgKb} KB / frame`)
  if (avgKb > 500) {
    console.warn(`   ⚠ Avg frame size exceeds 500 KB. Consider adding sharp compression.`)
  }

  return { count: files.length, totalBytes }
}

// ─── Run ───────────────────────────────────────────────────────────────────────

console.log('\n=== Piramida Backstage — frame processor ===\n')

const results = []

// background2/ → /public/frames/hero/
const heroResult = await processSource(
  join(ROOT, 'background2'),
  join(ROOT, 'public', 'frames', 'hero'),
  'background2 → public/frames/hero'
)
if (heroResult) results.push({ label: 'hero', ...heroResult })

// background1/ → /public/frames/detail-sample/
const detailResult = await processSource(
  join(ROOT, 'background1'),
  join(ROOT, 'public', 'frames', 'detail-sample'),
  'background1 → public/frames/detail-sample'
)
if (detailResult) results.push({ label: 'detail-sample', ...detailResult })

if (results.length === 0) {
  console.error('\n✗ No frames processed. Ensure background1/ or background2/ exist in the project root.')
  process.exit(1)
}

console.log('\n=== Summary ===')
for (const r of results) {
  console.log(`  /frames/${r.label}/  →  ${r.count} frames, ${(r.totalBytes / 1024 / 1024).toFixed(2)} MB`)
}

console.log(`
Next steps:
  1. Verify frames: ls public/frames/hero/ | head -5 && ls public/frames/hero/ | tail -3
  2. The ScrollVideo component reads /frames/hero/0001.jpg ... 0300.jpg
  3. detail-sample frames: uses hero frames with frameCount=100 (background1 was absent)
`)
