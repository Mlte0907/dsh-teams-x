/**
 * The staged-plan review bar: approve, return-to-chat, and discard (2-step).
 * Behavior-preserving extraction from ActivityPanel (v0.9 P0).
 * @module dsh-teams-x/client/plan-review
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { Translate } from './format.ts'
import { planAction } from './api.ts'
import css from './ActivityPanel.module.css'

export function PlanReviewBar({ team, t }: { team: TeamActivitySnapshot; t: Translate }): ReactElement {
  const [busy, setBusy] = useState<'approve' | 'discard' | 'continue' | undefined>(undefined)
  const [discardArmed, setDiscardArmed] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const runnable = team.members.length > 0 && team.tasks.length > 0

  const run = async (action: 'approve' | 'discard' | 'continue'): Promise<void> => {
    setBusy(action)
    setError(undefined)
    try {
      await planAction(team.captainSessionId, team.teamId, action)
      // No local state flip: the next poll reflects disk truth (phase flips to
      // running, or the team disappears into the archive) and unmounts us.
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setBusy(undefined)
    }
  }

  return (
    <div className={css.planBar} role='group' aria-label={t('plan.needsReview')}>
      <p className={css.planBarText}>{t('plan.needsReview')}</p>
      {error !== undefined && <p className={css.planError}>{error}</p>}
      <div className={css.planActions}>
        <button
          type='button'
          className={css.planApprove}
          disabled={busy !== undefined || !runnable}
          title={runnable ? undefined : t('plan.notRunnable')}
          onClick={() => { void run('approve') }}
        >
          {busy === 'approve' ? '…' : t('plan.approve')}
        </button>
        <button
          type='button'
          className={css.planChat}
          disabled={busy !== undefined}
          onClick={() => { void run('continue') }}
        >
          {busy === 'continue' ? '…' : t('plan.returnToChat')}
        </button>
        {discardArmed ? (
          <>
            <button type='button' className={css.planCancel} onClick={() => { setDiscardArmed(false) }} disabled={busy !== undefined}>
              {t('team.stopCancel')}
            </button>
            <button type='button' className={css.planDiscard} onClick={() => { void run('discard') }} disabled={busy !== undefined}>
              {busy === 'discard' ? '…' : t('plan.discardConfirm')}
            </button>
          </>
        ) : (
          <button type='button' className={css.planDiscardArm} onClick={() => { setDiscardArmed(true) }} disabled={busy !== undefined}>
            {t('plan.discard')}
          </button>
        )}
      </div>
    </div>
  )
}
