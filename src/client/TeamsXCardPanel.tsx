/**
 * In-chat TeamsX team card renderer (keyed on `conversation.chat.node`).
 *
 * Compact durable summary: lifecycle badges, roster rows (active members
 * with a child session open their transcript), and a task digest. Copy
 * reuses the panel's `teamsX` locale namespace.
 * @module dsh-teams-x/client/TeamsXCardPanel
 */
import type { ReactElement } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TeamsXCardData, TeamsXCardMember } from './card-state.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import { TeamsXLogo } from './icons.tsx'
import css from './TeamsXCard.module.css'

/** Navigation injected from the plugin shell. */
export interface TeamsXCardInjected {
  readonly openMember: (parentId: string, childId: string) => void
}

/** Complete keyed Chat renderer props. */
export type TeamsXCardPanelProps =
  PropsRuntime<'conversation.chat.node', 'teamsx-card'>
  & PropsLocale<'teamsX'>
  & TeamsXCardInjected

/** Task rows rendered before the "+N more" digest line. */
const MAX_TASK_ROWS = 8

function phaseKey(phase: TeamsXCardData['phase']): TeamsXLocaleKey {
  return phase === 'running' ? 'team.phase.running' : phase === 'deleted' ? 'card.phase.deleted' : 'team.phase.staged'
}

function CardMemberRow({ member, captainSessionId, openMember, t }: {
  member: TeamsXCardMember
  captainSessionId: string
  openMember: TeamsXCardInjected['openMember']
  t: TeamsXCardPanelProps['t']
}): ReactElement {
  const openable = member.status === 'active' && member.childId !== undefined
  const content = (
    <>
      <span className={css.cardDot} data-state={member.status} aria-hidden />
      <span className={css.cardMemberName}>{member.name}</span>
      {member.role !== undefined && <span className={css.cardMemberRole}>{member.role}</span>}
      {member.status === 'removed' && <span className={css.cardMemberState}>{t('member.state.removed')}</span>}
    </>
  )
  if (!openable || member.childId === undefined) {
    return <span className={css.cardMember} data-status={member.status}>{content}</span>
  }
  const childId = member.childId
  return (
    <button
      type='button'
      className={css.cardMember}
      data-status={member.status}
      onClick={() => { openMember(captainSessionId, childId) }}
      title={t('member.openSession')}
    >
      {content}
    </button>
  )
}

/** The team card body. Renders nothing for an unnamed state. */
export function TeamsXCardPanel({ node, t, openMember }: TeamsXCardPanelProps): ReactElement {
  const data = node.data
  if (typeof data?.name !== 'string' || data.name === '') return <></>
  const done = data.tasks.filter((task) => task.status === 'completed').length
  const visible = data.tasks.slice(0, MAX_TASK_ROWS)
  const hidden = data.tasks.length - visible.length
  const activeMembers = data.members.filter((member) => member.status === 'active').length
  return (
    <div className={css.card} data-phase={data.phase} data-halted={data.halted === true || undefined}>
      <header className={css.cardHeader}>
        <TeamsXLogo size={16} decorative />
        <span className={css.cardName} title={data.name}>{data.name}</span>
        <span className={css.cardBadge} data-phase={data.phase}>{t(phaseKey(data.phase))}</span>
        {data.halted === true && <span className={css.cardHalted}>{t('team.halted')}</span>}
        <span className={css.cardCounts}>
          {t('editor.members')} {activeMembers} · {t('team.done', { done, total: data.tasks.length })}
        </span>
      </header>
      {data.members.length > 0 && (
        <div className={css.cardRoster}>
          {data.members.map((member) => (
            <CardMemberRow key={member.name} member={member} captainSessionId={data.captainSessionId} openMember={openMember} t={t} />
          ))}
        </div>
      )}
      {visible.length > 0 && (
        <div className={css.cardTasks}>
          {visible.map((task) => (
            <div key={task.id} className={css.cardTask} data-status={task.status}>
              <span className={css.cardTaskId}>{task.id}</span>
              <span className={css.cardTaskSubject} title={task.subject}>{task.subject}</span>
              <span className={css.cardTaskStatus}>{t(`task.status.${task.status}` as TeamsXLocaleKey)}</span>
            </div>
          ))}
          {hidden > 0 && <span className={css.cardMore}>{t('card.more', { count: hidden })}</span>}
        </div>
      )}
    </div>
  )
}
