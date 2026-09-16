/**
 * Structural equality for activity snapshots — the quiet-poll gate.
 *
 * The panel polls on a fixed cadence; the overwhelming majority of ticks
 * return data identical to what is already on screen. Committing each tick
 * anyway re-renders the whole panel and restarts control states for nothing.
 * This module answers "did anything the panel renders actually change" with
 * a plain structural walk over the JSON-safe snapshot shapes, so an unchanged
 * tick is a no-op: no state write, no render, no visible flicker.
 * @module dsh-teams-x/client/snapshot-compare
 */
import type { TeamActivitySnapshot } from '../snapshot-types.ts'

/**
 * Deep equality over plain JSON data (objects, arrays, primitives). Snapshot
 * payloads arrive from `JSON.parse`, so prototypes are `Object.prototype` and
 * `undefined`-valued keys are impossible — key-set equality is sound.
 */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  const arrayA = Array.isArray(a)
  if (arrayA !== Array.isArray(b)) return false
  if (arrayA) {
    if ((a as readonly unknown[]).length !== (b as readonly unknown[]).length) return false
    return (a as readonly unknown[]).every((item, index) => sameValue(item, (b as readonly unknown[])[index]))
  }
  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) => (
    Object.prototype.hasOwnProperty.call(b, key)
    && sameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  ))
}

/**
 * True when both poll results would render identically. Snapshot arrays are
 * compared position-by-position; the assembler emits a stable order, so a
 * reordered roster is a real change worth re-rendering.
 */
export function sameTeamsSnapshots(
  a: readonly TeamActivitySnapshot[],
  b: readonly TeamActivitySnapshot[],
): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  return a.every((team, index) => sameValue(team, b[index]))
}
