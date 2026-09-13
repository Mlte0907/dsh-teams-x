/**
 * Activity ticker: the operations timeline rendered as one latest-action line
 * that expands into a vertical axis. Server actions are an open-ended
 * kebab-case set — the verb map covers the frequent ones and any unmatched
 * action falls back to its raw kebab string in mono (never blank).
 * Update discipline: poll-driven text swaps render directly, no entry
 * animation (4s cadence is "tens of times a day" per the motion framework).
 * @module dsh-teams-x/client/activity-ticker
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { TeamActivityOperation } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import css from './ActivityPanel.module.css'

/** Actions that were in-flight when logged (hollow axis dots). */
const IN_FLIGHT = new Set(['task-dispatched', 'task-claimed', 'task-progress'])

/** Locale keys for the frequent operation verbs (zh dictionary is truth). */
const OP_VERB_KEYS: Readonly<Record<string, TeamsXLocaleKey>> = {
  'task-dispatched': 'op.task-dispatched',
  'task-claimed': 'op.task-claimed',
  'task-progress': 'op.task-progress',
  'task-updated': 'op.task-updated',
  'task-shadow-takeover': 'op.task-shadow-takeover',
  'dispatch-rolled-back': 'op.dispatch-rolled-back',
  'repair-derived': 'op.repair-derived',
  'repair-cancelled': 'op.repair-cancelled',
  'repair-round-limit': 'op.repair-round-limit',
  'repair-skip-duplicate': 'op.repair-skip-duplicate',
  'stalled-orphan-requeued': 'op.stalled-orphan-requeued',
  'stranded-captain-task-requeued': 'op.stranded-captain-task-requeued',
  'stall-parked-notify': 'op.stall-parked-notify',
  'stall-running-notify': 'op.stall-running-notify',
}

/** Human verb for an operation action; unmatched actions fall back to raw. */
export function operationVerb(t: Translate, action: string): string {
  const key = OP_VERB_KEYS[action]
  return key !== undefined ? t(key) : action
}

/** Merge window for consecutive same-actor same-action entries. */
const MERGE_WINDOW_MS = 60_000

interface MergedOperation {
  readonly op: TeamActivityOperation
  readonly count: number
}

/** Fold consecutive same-actor same-action operations inside the window. */
function mergeOperations(operations: readonly TeamActivityOperation[]): MergedOperation[] {
  const merged: MergedOperation[] = []
  for (const op of operations) {
    const last = merged[merged.length - 1]
    if (last !== undefined
      && last.op.actor === op.actor
      && last.op.action === op.action
      && last.op.ts - op.ts <= MERGE_WINDOW_MS) {
      merged[merged.length - 1] = { op: last.op, count: last.count + 1 }
      continue
    }
    merged.push({ op, count: 1 })
  }
  return merged
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ActivityTicker({ operations, t }: {
  operations: readonly TeamActivityOperation[]
  t: Translate
}): ReactElement | null {
  const [open, setOpen] = useState(false)
  const latest = operations[0]
  if (latest === undefined) return null
  const merged = mergeOperations(operations)
  const latestCount = merged[0]?.count ?? 1
  const verb = operationVerb(t, latest.action)
  return (
    <div className={css.ticker}>
      <button
        type='button'
        className={css.tickerToggle}
        onClick={() => { setOpen((value) => !value) }}
        aria-expanded={open === true || undefined}
        aria-label={t('ticker.aria')}
      >
        <span className={css.tickerCaret} data-open={open === true || undefined} aria-hidden>▸</span>
        <span className={css.tickerTime}>{formatClock(latest.ts)}</span>
        <span className={css.tickerActor}>{latest.actor}</span>
        <span className={css.tickerText}>
          {verb}{latest.taskId !== undefined ? ` ${latest.taskId}` : ''}
          {latestCount > 1 && <span className={css.tickerMerge}>{` ×${latestCount}`}</span>}
        </span>
      </button>
      {open && (
        <div className={css.tickerBody}>
          {merged.map((entry, index) => (
            <div
              key={`${entry.op.ts}-${index}`}
              className={css.tickerAxisRow}
              data-flight={IN_FLIGHT.has(entry.op.action) || undefined}
            >
              <span className={css.tickerTime}>{formatClock(entry.op.ts)}</span>
              <span className={css.tickerActor}>{entry.op.actor}</span>
              <span className={css.tickerText}>
                {operationVerb(t, entry.op.action)}
                {entry.op.taskId !== undefined ? ` ${entry.op.taskId}` : ''}
                {entry.count > 1 && <span className={css.tickerMerge}>{` ×${entry.count}`}</span>}
              </span>
              {entry.op.detail !== undefined && (
                <span className={css.tickerDetail} title={entry.op.detail}>{entry.op.detail}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
