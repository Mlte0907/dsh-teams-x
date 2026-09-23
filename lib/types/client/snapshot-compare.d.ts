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
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
/**
 * True when both poll results would render identically. Snapshot arrays are
 * compared position-by-position; the assembler emits a stable order, so a
 * reordered roster is a real change worth re-rendering.
 */
export declare function sameTeamsSnapshots(a: readonly TeamActivitySnapshot[], b: readonly TeamActivitySnapshot[]): boolean;
