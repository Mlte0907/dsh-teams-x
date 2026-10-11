/**
 * Version-sourcing guard.
 *
 * The plugin's version is authored in ONE place — `package.json` — and the
 * client bundle build injects it into `src/client/version.ts`'s
 * `__TEAMSX_VERSION__` (tsdown `define`). No source file carries a version
 * literal, so a bump cannot leave a stale copy behind in the sources. What CAN
 * go stale is a COMMITTED artefact whose rebuild never happened: this repo
 * ships `lib/`, and a `github:` install consumes exactly those bytes.
 *
 * So this checks the artefacts that could disagree with the manifest:
 *
 *   lib/client.js           the browser bundle — the define must have run, and
 *                           the literal it left must equal the manifest's
 *   lib/client/version.js   the tsc-emitted module — no define here, so it must
 *                           keep the placeholder reference and NO version
 *   src/client/version.ts   the source — a version literal here is the drift
 *                           this arrangement exists to prevent
 *
 * Run: node scripts/verify-version.mjs   (exit 1 on drift)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = (rel) => readFileSync(join(root, rel), 'utf8')

/** Every version-shaped string literal in a chunk of text. */
const semvers = (text) => text.match(/\d+\.\d+\.\d+/g) ?? []

const VERSION = JSON.parse(read('package.json')).version

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail === '' ? '' : ` — ${detail}`}`)
  if (!ok) failures += 1
}

check('package.json declares a version', typeof VERSION === 'string' && VERSION.length > 0, String(VERSION))

// ── the browser bundle: the define ran, and left the manifest's version ──
const bundle = read('lib/client.js')
check('bundle has no uninjected __TEAMSX_VERSION__ reference',
  !bundle.includes('__TEAMSX_VERSION__'),
  bundle.includes('__TEAMSX_VERSION__') ? 'the tsdown define did not run — rebuild lib/' : '')
// Shape-agnostic: the bundler may keep the ternary or fold it to a bare
// literal, so read whatever the assignment actually resolves to.
const assignment = /TEAMSX_VERSION\s*=\s*([^;]+);/.exec(bundle)
const injectedVersions = assignment === null ? [] : semvers(assignment[1])
check('bundle inlines the manifest version',
  injectedVersions.includes(VERSION),
  assignment === null ? 'no TEAMSX_VERSION assignment found' : `bundle=[${injectedVersions.join(', ')}] manifest=${VERSION}`)
check('bundle inlines no other version',
  injectedVersions.every((value) => value === VERSION),
  injectedVersions.filter((value) => value !== VERSION).join(', ') || 'none')

// ── the tsc-emitted module: placeholder only, never a version literal ──
const emitted = read('lib/client/version.js')
check('emitted module keeps the placeholder reference', emitted.includes('__TEAMSX_VERSION__'))
check('emitted module carries no version literal', semvers(emitted).length === 0, semvers(emitted).join(', ') || 'none')

// ── the source: the version is never authored here ──
check('source carries no version literal', semvers(read('src/client/version.ts')).length === 0,
  semvers(read('src/client/version.ts')).join(', ') || 'none')

// ── the versioned titles actually RENDER the version ──
// A template that lost its `{version}` placeholder shows a correct version
// nowhere (and the plain twin would be indistinguishable) — the drift that hit
// the English panel title once, so it is checked, not assumed.
for (const key of ['tab', 'panel.title']) {
  const escaped = key.replace('.', '\\.')
  const versioned = [...bundle.matchAll(new RegExp(`"${escaped}":\\s*"([^"]*)"`, 'g'))].map((match) => match[1])
  const plain = [...bundle.matchAll(new RegExp(`"${escaped}\\.plain":\\s*"([^"]*)"`, 'g'))].map((match) => match[1])
  check(`"${key}" templates carry {version}`, versioned.length > 0 && versioned.every((text) => text.includes('{version}')),
    versioned.map((text) => JSON.stringify(text)).join(' ') || 'no template found')
  check(`"${key}.plain" twins exist, one per language, without {version}`,
    plain.length === versioned.length && plain.every((text) => !text.includes('{version}')),
    `versioned=${versioned.length} plain=${plain.length}`)
}

console.log(failures === 0
  ? `\nversion sourcing clean: ${VERSION} lives in package.json only, injected into lib/client.js`
  : `\n${failures} version-sourcing problem(s)`)
process.exitCode = failures === 0 ? 0 : 1
