/**
 * One team card, v0.9 「调度台」form: identity row (logo + goal + phase tag +
 * stop), instrument row (progress ring + counts + elapsed + tokens), member
 * channel strips, the task track section (single labeled section — the only
 * survivor of the v0.8 label row), the activity ticker, and a one-line inbox
 * preview. No card box: sections separate by hairline (DENSITY 8).
 * @module dsh-teams-x/client/team-card
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import { formatElapsed, formatTokens } from './format.ts'
import { haltTeam } from './api.ts'
import { MemberRow } from './member-row.tsx'
import { TaskRow } from './task-row.tsx'
import { PlanReviewBar } from './plan-review.tsx'
import { StagedPlanEditor } from './StagedPlanEditor.tsx'
import { countTasks, ProgressRing } from './progress-ring.tsx'
import { ActivityTicker } from './activity-ticker.tsx'
import css from './ActivityPanel.module.css'
import { GlyphClock, GlyphInbox, TeamsXLogo } from './icons.ts'

/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void

export interface TeamCardProps {
  readonly team: TeamActivitySnapshot
  readonly t: Translate
  readonly openMember: OpenMember
  readonly readOnly?: boolean
  /** Called after a staged-plan edit batch commits, to refresh immediately. */
  readonly onSaved: () => void
}

/** Longest elapsed among running tasks, for the instrument row. */
function runningElapsedMs(tasks: TeamActivitySnapshot['tasks']): number | undefined {
  let max: number | undefined
  for (const task of tasks) {
    if (task.status !== 'in_progress' && task.status !== 'claimed') continue
    if (typeof task.elapsedMs !== 'number') continue
    max = max === undefined ? task.elapsedMs : Math.max(max, task.elapsedMs)
  }
  return max
}

interface TokenSum {
  readonly input: number
  readonly output: number
}

/** Sum member token usage; undefined when no member reports usage. */
function sumTokens(members: TeamActivitySnapshot['members']): TokenSum | undefined {
  let input: number | undefined
  let output: number | undefined
  for (const member of members) {
    if (member.usage === undefined) continue
    input = (input ?? 0) + member.usage.inputTokens
    output = (output ?? 0) + member.usage.outputTokens
  }
  return input === undefined || output === undefined ? undefined : { input, output }
}

export function TeamCard({ team, t, openMember, readOnly, onSaved }: TeamCardProps): ReactElement {
  const [confirming, setConfirming] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stopError, setStopError] = useState<string | undefined>(undefined)
  const counts = countTasks(team.tasks)
  const phaseKey = (team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running') as TeamsXLocaleKey

  const stop = async (): Promise<void> => {
    setStopping(true)
    setStopError(undefined)
    try {
      await haltTeam(team.captainSessionId, team.teamId)
      setConfirming(false)
    } catch (cause: unknown) {
      setStopError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setStopping(false)
    }
  }

  const elapsed = runningElapsedMs(team.tasks)
  const tokens = sumTokens(team.members)
  const latestInbox = team.captainInbox[0]

  return (
    <section className={css.teamCard} data-phase={team.phase} data-halted={team.halted === true || undefined}>
      {team.phase === 'staged' && !readOnly && (
        <>
          <PlanReviewBar team={team} t={t} />
          <StagedPlanEditor team={team} t={t} onSaved={onSaved} />
        </>
      )}
      <header className={css.teamHeader}>
        <TeamsXLogo size={20} className={css.teamLogo} decorative />
        <div className={css.teamTitleBlock}>
          <h3 className={css.teamName} title={team.name}>{team.name}</h3>
          {team.description !== undefined && <p className={css.teamGoal}>{team.description}</p>}
        </div>
        {team.planReviewState === 'awaiting_feedback' && (
          <span className={css.teamNote}>{t('team.planReview.awaiting_feedback')}</span>
        )}
        {team.halted === true && <span className={css.teamNote} data-halted>{t('team.halted')}</span>}
        <span className={css.phaseTag} data-phase={team.phase}>{t(phaseKey)}</span>
        {!readOnly && team.phase === 'running' && team.halted !== true && !confirming && (
          <button type='button' className={css.stopButton} onClick={() => { setConfirming(true) }}>
            {t('team.stop')}
          </button>
        )}
      </header>

      {team.phase === 'running' ? (
        <div className={css.instrumentRow}>
          <ProgressRing
            tasks={team.tasks}
            size={72}
            ok={'var(--tx-ok)'}
            accent={'var(--tx-accent)'}
            bad={'var(--tx-bad)'}
            track={'var(--tx-viz-track)'}
            centerValue={`${counts.completed}/${counts.denom}`}
            centerLabel={t('team.progressLabel')}
          />
          <span
            className={css.statTile}
            role='status'
            aria-label={t('team.done', { done: counts.completed, total: counts.denom })}
          >
            <span className={css.statTileValue}>{elapsed !== undefined ? formatElapsed(elapsed) : '--'}</span>
            <span className={css.statTileLabel}>{t('task.elapsedTitle')}</span>
          </span>
          <span className={css.statTile}>
            <span className={css.statTileValue}>
              {tokens !== undefined ? `↑${formatTokens(tokens.input)} ↓${formatTokens(tokens.output)}` : '--'}
            </span>
            <span className={css.statTileLabel}>{t('member.tokensTitle')}</span>
          </span>
          <span className={css.instrumentSpacer} />
        </div>
      ) : (
        <div className={css.instrumentRow}>
          <span className={css.instrumentBlock}>{t('team.members', { count: team.members.length })}</span>
          <span className={css.instrumentBlock}>{t('team.tasks', { count: team.tasks.length })}</span>
          <span className={css.instrumentSpacer} />
        </div>
      )}

      {confirming && (
        <div className={css.stopConfirmBox} role='alertdialog' aria-label={t('team.stopTitle', { team: team.name })}>
          <p>{t('team.stopDescription', { tasks: team.tasks.filter((task) => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress').length, members: team.members.filter((member) => member.activity === 'working').length })}</p>
          {stopError !== undefined && <p className={css.stopError}>{t('team.stopFailed', { message: stopError })}</p>}
          <div className={css.stopActions}>
            <button type='button' className={css.stopCancel} onClick={() => { setConfirming(false) }} disabled={stopping}>
              {t('team.stopCancel')}
            </button>
            <button type='button' className={css.stopConfirm} onClick={() => { void stop() }} disabled={stopping}>
              {stopping ? t('team.stopping') : t('team.stopConfirm')}
            </button>
          </div>
        </div>
      )}

      <div className={css.sectionCard}>
        {team.members.length > 0 ? (
          <div className={css.roster}>
            {team.members.map((member) => <MemberRow key={member.id !== '' ? member.id : member.name} member={member} team={team} t={t} openMember={openMember} />)}
          </div>
        ) : (
          <p className={css.inboxEmpty}>{t('team.members', { count: 0 })}</p>
        )}
      </div>

      <div className={css.sectionCard}>
        <div className={css.sectionCardHead}>
          <span className={css.sectionCardTitle}>{t('editor.tasks')}</span>
          <span className={css.dagCount}>{team.tasks.length}</span>
        </div>
        <div className={css.dag}>
          {team.tasks.length === 0 && team.phase === 'running' && (
            <div className={css.dagEmpty} role='status'>
              <p className={css.dagEmptyText}>{t('task.decomposing')}</p>
              <span className={css.skeletonRow} style={{ width: '72%' }} aria-hidden />
              <span className={css.skeletonRow} style={{ width: '54%' }} aria-hidden />
              <span className={css.skeletonRow} style={{ width: '63%' }} aria-hidden />
            </div>
          )}
          {team.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              t={t}
            />
          ))}
        </div>
      </div>

      <div className={css.sectionCard}>
        {team.operations.length > 0 && <ActivityTicker operations={team.operations} t={t} />}

        <footer className={css.inbox}>
        <div className={css.inboxHead}>
          <GlyphInbox size={12} decorative />
          <span>{t('inbox.title')}</span>
          {team.messageCount > 0 && <span className={css.inboxUnreadBadge}>{team.messageCount}</span>}
        </div>
        {latestInbox === undefined
          ? <p className={css.inboxEmpty}>{t('inbox.empty')}</p>
          : (
            <>
              <span className={css.inboxPreview} title={latestInbox.content}>
                <span className={css.inboxFrom}>{latestInbox.from}</span>
                <span className={css.inboxContent}>{latestInbox.content}</span>
              </span>
              {team.captainInbox.length > 1 && (
                <span className={css.inboxMore}>{t('inbox.more', { count: team.captainInbox.length - 1 })}</span>
              )}
            </>
          )}
        </footer>
      </div>
    </section>
  )
}
