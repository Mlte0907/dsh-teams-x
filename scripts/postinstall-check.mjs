/**
 * Install-time sanity check (postinstall, best effort — never fails the
 * install): the npm tarball ships the built plugin, so a missing bundle
 * means the package was installed from a source checkout. Print a clear
 * pointer instead of failing, since building requires the harness devLinks.
 * @module dsh-teams-x/postinstall-check
 */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const required = ['lib/index.js', 'lib/client.js', 'lib/types/index.d.ts']
const missing = required.filter((rel) => !existsSync(join(pkgRoot, rel)))

if (missing.length > 0) {
  console.warn(
    `[dsh-teams-x] build output missing (${missing.join(', ')}).`
    + ' If you installed from a source checkout, run `pnpm build` before mounting the plugin;'
    + ' the npm tarball (npm i dsh-teams-x) ships these files prebuilt.',
  )
} else {
  console.log('[dsh-teams-x] plugin bundles present')
}
