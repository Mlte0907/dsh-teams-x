/**
 * One task bar-card of the flat list: a full-width strip whose state reads
 * from a colored left rail plus a state-tinted surface (color + icon double
 * encoding). No subject text (user direction) — the native title keeps the
 * subject on hover.
 * @module dsh-teams-x/client/task-row
 */
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import { formatElapsed } from './format.ts'
import css from './ActivityPanel.module.css'
import { VISUAL_STATE_ICONS, type IconComponent } from './icons.ts'

export interface TaskRowProps {
  readonly task: TeamActivitySnapshot['tasks'][number]
  readonly t: Translate
}

export function TaskRow({ task, t }: TaskRowProps): ReactElement {
  const StateIcon = VISUAL_STATE_ICONS[task.state] as IconComponent | undefined
  const statusKey = `task.status.${task.status}` as TeamsXLocaleKey
  const sourceDep = task.dependencies[0] ?? ''
  const assignee = task.assignee === '' ? t('task.assignee.shared')
    : task.assignee === 'captain' ? t('task.assignee.captain')
      : task.assignee
  return (
    <>
      <div
        className={css.taskCard}
        data-state={task.state}
        title={task.description || task.subject}
        aria-label={`${task.id} ${t(statusKey)} ${assignee}`}
      >
        <span className={css.taskCardRail} aria-hidden />
        <span className={css.taskCardIcon}>
          {StateIcon !== undefined && <StateIcon size={13} decorative />}
        </span>
        <span className={css.taskCardId}>{task.id}</span>
        <span className={css.taskNoteRow}>
          {task.depth > 0 && (
            <span className={css.taskNote}>{t('task.depth', { depth: task.depth })}</span>
          )}
          {task.dependencies.length > 0 && (
            <span className={css.taskNote}>
              {t('task.depsNote', { deps: task.dependencies.join(' ') })}
            </span>
          )}
          {task.round !== undefined && task.round > 0 && (
            <span className={css.taskNote} data-note="round" title={t('task.roundTitle', { round: task.round })}>
              {`R${task.round}`}
            </span>
          )}
          {task.kind === 'repair' && task.dependencies.length > 0 && (
            <span className={css.taskNote} data-note="source" title={t('task.sourceTitle', { taskId: sourceDep })}>
              {`↻ ${sourceDep}`}
            </span>
          )}
          {typeof task.progressCount === 'number' && task.progressCount > 0 && (
            <span className={css.taskNote} data-note="progress" title={task.progressLatest ?? ''}>
              {`${task.progressCount}×${t('op.task-progress')}`}
            </span>
          )}
          {task.takenOverBy === 'captain' && (
            <span className={css.taskTag} data-tag="taken" title={t('task.takenTitle')}>{t('task.taken')}</span>
          )}
          {task.verdict !== undefined && (
            <span className={css.taskTag} data-tag={task.verdict}>
              {t(`task.verdict.${task.verdict}` as TeamsXLocaleKey)}
            </span>
          )}
        </span>
        <span className={css.taskCardAssignee}>{assignee}</span>
        {typeof task.elapsedMs === 'number' && (
          <span className={css.taskCardElapsed} title={t('task.elapsedTitle')}>{formatElapsed(task.elapsedMs)}</span>
        )}
      </div>
    </>
  )
}
