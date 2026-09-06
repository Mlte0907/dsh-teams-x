/**
 * Publish gate: runs after `pnpm build` (prepublishOnly) and asserts the
 * artifacts about to be packed are present and clean. Fails the publish on:
 * - missing build output (lib/index.js, lib/client.js, lib/types, icons)
 * - stale references to the old reference-implementation framing
 * @module dsh-teams-x/prepublish-guard
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const required = ['lib/index.js', 'lib/client.js', 'lib/types/index.d.ts', 'cordis.patch.yml', 'assets/icons']

let failed = false
for (const rel of required) {
  if (!existsSync(join(pkgRoot, rel))) {
    console.error(`prepublish-guard: missing build output "${rel}" — run \`pnpm build\` first`)
    failed = true
  }
}

/** Scan every emitted .js under lib/ for stale reference-implementation text. */
const scan = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      scan(path)
      continue
    }
    if (!entry.name.endsWith('.js')) continue
    const text = readFileSync(path, 'utf8')
    if (/agent-teams/i.test(text)) {
      console.error(`prepublish-guard: stale reference to the old reference implementation in ${path}`)
      failed = true
    }
  }
}
if (existsSync(join(pkgRoot, 'lib'))) scan(join(pkgRoot, 'lib'))

if (failed) process.exit(1)
console.log('prepublish-guard: build output present and clean')
