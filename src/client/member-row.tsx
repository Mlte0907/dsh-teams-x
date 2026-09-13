/**
 * One member channel strip of the roster grid. Static state piece (form +
 * color dual encoding, zero loop animation — the motion budget belongs to the
 * collapsed badge pulse). Unread badge and pause control are resident (never
 * hover-only); model/token/progress details live in a popover reachable via
 * hover, focus, and tap alike.
 * @module dsh-teams-x/client/member-row
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import { formatTokens } from './format.ts'
import { pauseMember } from './api.ts'
import css from './ActivityPanel.module.css'
import {
  GlyphInfo,
  GlyphPause,
  ROLE_ICONS,
  TeamsXLogo,
  type IconComponent,
} from './icons.ts'

/** Props MemberRow needs from its host card. */
export interface MemberRowProps {
  readonly member: TeamActivitySnapshot['members'][number]
  readonly team: TeamActivitySnapshot
  readonly t: Translate
  readonly openMember: (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void
  readonly readOnly?: boolean
}

export function MemberRow({ member, team, t, openMember, readOnly }: MemberRowProps): ReactElement {
  const [pausing, setPausing] = useState(false)
  const [pauseError, setPauseError] = useState<string | undefined>(undefined)
  const [infoOpen, setInfoOpen] = useState(false)
  const roleKey = (member.role?.trim().toLowerCase() ?? '') as keyof typeof ROLE_ICONS
  const RoleIcon = ROLE_ICONS[roleKey] as IconComponent | undefined
  const stateKey = (member.activity === 'working' ? 'member.state.working'
    : member.activity === 'idle' ? 'member.state.idle'
      : 'member.state.unknown') as TeamsXLocaleKey
  const openable = member.id !== ''
  const scale = Math.max(0, Math.min(100, member.progress)) / 100

  const pause = async (): Promise<void> => {
    setPausing(true)
    setPauseError(undefined)
    try {
      await pauseMember(team.captainSessionId, team.teamId, member.name)
    } catch (cause: unknown) {
      setPauseError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setPausing(false)
    }
  }

  return (
    <div className={css.memberCell} data-activity={member.activity}>
      {member.unread > 0 && (
        <span className={css.memberUnread} title={t('member.unread', { count: member.unread })}>{member.unread}</span>
      )}
      <div className={css.memberCellTop}>
        <span className={css.memberIcon}>
          {RoleIcon !== undefined
            ? <RoleIcon size={16} decorative />
            : <TeamsXLogo size={16} label={member.name} />}
        </span>
        <span className={css.memberName} title={member.name}>
          {openable ? (
            <button
              type='button'
              className={css.memberLink}
              onClick={() => { openMember(team.captainSessionId, member.id) }}
              title={t('member.openSession')}
            >
              {member.name}
            </button>
          ) : member.name}
        </span>
      </div>
      <span className={css.memberState}>
        <span className={css.memberStateDot} data-activity={member.activity} aria-hidden />
        <span className={css.memberStateText}>{t(stateKey)}</span>
      </span>
      <span
        className={css.memberTrack}
        role='progressbar'
        aria-valuenow={member.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('member.progress', { done: member.done, total: member.total })}
      >
        <span
          className={css.memberTrackFill}
          data-done={member.progress >= 100 || undefined}
          style={{ transform: `scaleX(${scale})` }}
        />
      </span>
      <div className={css.memberCellActions}>
        <button
          type='button'
          className={css.memberInfo}
          onClick={() => { setInfoOpen((value) => !value) }}
          aria-expanded={infoOpen === true || undefined}
          aria-label={t('member.info')}
          title={t('member.info')}
        >
          <GlyphInfo size={13} decorative />
        </button>
        {!readOnly && member.activity === 'working' && (
          <button
            type='button'
            className={css.memberPause}
            onClick={() => { void pause() }}
            disabled={pausing}
            aria-label={t('member.pause')}
            title={t('member.pause')}
          >
            {pausing ? '…' : <GlyphPause size={11} decorative />}
          </button>
        )}
      </div>
      <div className={css.memberPopover} data-open={infoOpen === true || undefined}>
        <span className={css.memberPopoverRow}>
          <span className={css.memberPopoverKey}>{t('member.model')}</span>
          <span className={css.memberPopoverVal}>{pauseError ?? member.model}</span>
        </span>
        <span className={css.memberPopoverRow}>
          <span className={css.memberPopoverKey}>{t('member.tokensTitle')}</span>
          <span className={css.memberPopoverVal}>
            {member.usage !== undefined
              ? `↑${formatTokens(member.usage.inputTokens)} ↓${formatTokens(member.usage.outputTokens)}`
              : '--'}
          </span>
        </span>
        <span className={css.memberPopoverRow}>
          <span className={css.memberPopoverKey}>{t('editor.tasks')}</span>
          <span className={css.memberPopoverVal}>{t('member.progress', { done: member.done, total: member.total })}</span>
        </span>
        {pauseError !== undefined && <span className={css.memberPopoverErr}>{pauseError}</span>}
      </div>
    </div>
  )
}
