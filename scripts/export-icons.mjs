#!/usr/bin/env node
/**
 * Export every TeamsX icon as a standalone assets/icons/*.svg file.
 *
 * The icon bodies live in src/client/icon-data.ts (single source of truth,
 * also consumed by the inline React components). Node ≥22.6 strips the type
 * annotations natively, so this script imports the .ts module directly.
 * Run `pnpm verify:icons` to check the committed files are up to date.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { basename, join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'assets', 'icons')

let ICONS
try {
  const mod = await import(join(root, 'src', 'client', 'icon-data.ts'))
  ICONS = mod.ICONS ?? { ...mod.ICONS_ROLES, ...mod.ICONS }
} catch (error) {
  console.error('[dsh-teams-x] failed to load icon-data.ts (need Node ≥22.6):', error.message)
  process.exit(1)
}

await mkdir(outDir, { recursive: true })

for (const [name, icon] of Object.entries(ICONS)) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"',
    ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
    ` role="img" aria-label="${icon.label}">`,
    icon.body,
    '</svg>',
  ].join('')
  await writeFile(join(outDir, `${name}.svg`), `${svg}\n`, 'utf8')
}
console.log(`[dsh-teams-x] exported ${Object.keys(ICONS).length} icons to assets/icons/`)

// --check mode: verify committed assets match the data (exit 1 on drift).
if (process.argv.includes('--check')) {
  const committed = new Set(await readdir(outDir))
  let drift = 0
  for (const [name, icon] of Object.entries(ICONS)) {
    const file = `${name}.svg`
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"',
      ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
      ` role="img" aria-label="${icon.label}">`,
      icon.body,
      '</svg>',
    ].join('')
    const expected = `${svg}\n`
    if (!committed.has(file)) {
      console.error(`[dsh-teams-x] missing asset: ${file}`)
      drift += 1
      continue
    }
    const actual = await readFile(join(outDir, file), 'utf8')
    if (actual !== expected) {
      console.error(`[dsh-teams-x] stale asset: ${file}`)
      drift += 1
    }
  }
  if (drift > 0) {
    console.error(`[dsh-teams-x] ${drift} icon asset(s) out of date; run pnpm verify:icons exporter without --check`)
    process.exit(1)
  }
  console.log('[dsh-teams-x] icon assets are in sync with icon-data.ts')
}
void basename
