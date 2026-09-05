#!/usr/bin/env node
/**
 * Clean build output, then signal the caller to continue with tsc/tsdown.
 * Keeps `pnpm build` a single deterministic pipeline: rm -rf lib, then the
 * two tsc passes emit lib/ + lib/types, then tsdown emits lib/client.js.
 */
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
await rm(`${root}lib`, { recursive: true, force: true })
console.log('[dsh-teams-x] cleaned lib/')
