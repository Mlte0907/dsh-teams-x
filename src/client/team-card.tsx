/**
 * One team card, v0.10 「时间线叙事流」form (Direction C).
 *
 * Single-column narrative: the identity header keeps its compact instruments
 * (completion ring, elapsed, token bars) plus a task-status segmented bar;
 * 「正在发生」 pins who is working right now; a slim member strip preserves
 * transcript/pause/unread reachability without re-erecting the roster block;
 * the task meter locates any task in the stream; and ONE unified timeline
 * (operations + mail + per-task state cards) carries the story below.
 * No module boxes: hairlines and the rail do the separating (DENSITY 8).
 * @module dsh-teams-x/client/team-card
 */
import { useMemo, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import type { TeamActivityMember, TeamActivitySnapshot, TeamActivityTask } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import { formatElapsed, formatTokens } from './format.ts'
import { haltTeam, pauseMember } from './api.ts'
import { PlanReviewBar } from './plan-review.tsx'
import { StagedPlanEditor } from './StagedPlanEditor.tsx'
import { countTasks } from './progress-ring.tsx'
import { beatActivity, useLiveBeats, type LiveBeat } from './live-activity.ts'
import { memberInk, memberSigil } from './member-identity.ts'
import { applyStreamFilter, buildStreamEntries, TimelineStream, type StreamFilter } from './timeline-stream.tsx'
import css from './ActivityPanel.module.css'
import { GlyphClock, ROLE_ICONS, TeamsXLogo, type IconComponent } from './icons.tsx'

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

/**
 * Total task elapsed time: every task contributes its wall-clock run time —
 * terminal tasks their final duration, running tasks their growing current
 * elapsed — so the tile always reads the team's accumulated working time
 * instead of going blank the moment the last task completes.
 */
function totalElapsedMs(tasks: readonly TeamActivityTask[]): number | undefined {
  let total: number | undefined
  for (const task of tasks) {
    if (typeof task.elapsedMs !== 'number') continue
    total = (total ?? 0) + task.elapsedMs
  }
  return total
}

interface TokenSum {
  readonly input: number
  readonly output: number
}

/**
 * Team-wide cumulative token total: each member owns a dedicated session, so
 * summing the per-member cumulative usage never double-counts.
 */
function sumTokens(members: readonly TeamActivityMember[]): TokenSum | undefined {
  let input: number | undefined
  let output: number | undefined
  for (const member of members) {
    if (member.usage === undefined) continue
    input = (input ?? 0) + member.usage.inputTokens
    output = (output ?? 0) + member.usage.outputTokens
  }
  return input === undefined || output === undefined ? undefined : { input, output }
}

/** Visual task state used by the segmented bar and the task meter. */
function nodeStateOf(task: TeamActivityTask): 'done' | 'running' | 'blocked' | 'failed' | 'pending' {
  if (task.state === 'blocked') return 'blocked'
  if (task.status === 'in_progress' || task.status === 'claimed') return 'running'
  if (task.status === 'completed') return 'done'
  if (task.status === 'failed') return 'failed'
  return 'pending'
}

const SEGMENT_ORDER = ['done', 'running', 'failed', 'blocked', 'pending'] as const
const SEGMENT_KEYS: Readonly<Record<(typeof SEGMENT_ORDER)[number], TeamsXLocaleKey>> = {
  done: 'task.status.completed',
  running: 'task.status.in_progress',
  failed: 'task.status.failed',
  blocked: 'task.visual.blocked',
  pending: 'task.status.pending',
}

/* ── 头部仪表：完成度环 + 累计耗时 + token 双条 ─────────────── */

function HeadRing({ done, denom, t }: { done: number; denom: number; t: Translate }): ReactElement {
  const pct = denom > 0 ? Math.round((done / denom) * 100) : 0
  const size = 32
  const stroke = 3.5
  const r = (size - stroke) / 2 - 0.5
  const c = 2 * Math.PI * r
  return (
    <span className={css.headStat}>
      <span
        className={css.headRing}
        role='img'
        aria-label={t('team.done', { done, total: denom })}
        title={t('team.done', { done, total: denom })}
      >
        <svg className={css.ringSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke='var(--tx-viz-track)' strokeWidth={stroke} />
            <circle
              className={css.ringSeg}
              cx={size / 2} cy={size / 2} r={r} fill='none'
              stroke={pct >= 100 ? 'var(--tx-ok)' : 'var(--tx-accent)'}
              strokeWidth={stroke} strokeLinecap='round'
              strokeDasharray={`${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}`}
            />
          </g>
        </svg>
        <span className={css.headRingValue}>{`${done}/${denom}`}</span>
      </span>
      <span className={css.sl}>
        <b>{`${pct}%`}</b>
        <i>{t('team.progressLabel')}</i>
      </span>
    </span>
  )
}

function TokenViz({ tokens }: { tokens: TokenSum }): ReactElement {
  const max = Math.max(tokens.input, tokens.output, 1)
  const width = (value: number): string => `${Math.min(100, Math.round((value / max) * 100))}%`
  return (
    <span className={css.headStat}>
      <span
        className={css.tokviz}
        title={`↑${formatTokens(tokens.input)} / ↓${formatTokens(tokens.output)}`}
        aria-hidden
      >
        <i><b style={{ width: width(tokens.input) }} /></i>
        <i data-out><b style={{ width: width(tokens.output) }} /></i>
      </span>
      <span className={css.sl}>
        <b>{`↑${formatTokens(tokens.input)}`}</b>
        <i>{`↓${formatTokens(tokens.output)}`}</i>
      </span>
    </span>
  )
}

/** 26px mini progress ring for the 「正在发生」 pills. */
function MiniRing({ pct, color }: { pct: number; color: string }): ReactElement {
  const size = 26
  const stroke = 3
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className={css.headRing} data-mini aria-hidden>
      <svg className={css.ringSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke='var(--tx-viz-track)' strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill='none'
            stroke={color} strokeWidth={stroke} strokeLinecap='round'
            strokeDasharray={`${(c * Math.max(0, Math.min(100, pct)) / 100).toFixed(1)} ${c.toFixed(1)}`}
          />
        </g>
      </svg>
      <span className={css.headRingValue}>{pct}</span>
    </span>
  )
}

/* ── 任务状态分段条 ──────────────────────────────────────────── */

function SegBar({ team, t }: { team: TeamActivitySnapshot; t: Translate }): ReactElement | null {
  const counts = useMemo(() => {
    const result = new Map<string, number>()
    for (const task of team.tasks) {
      const state = nodeStateOf(task)
      result.set(state, (result.get(state) ?? 0) + 1)
    }
    return result
  }, [team.tasks])
  const total = team.tasks.length
  if (total === 0) return null
  return (
    <div className={css.segbar} aria-hidden>
      <div className={css.segtrack}>
        {SEGMENT_ORDER.map((state) => {
          const count = counts.get(state) ?? 0
          if (count === 0) return null
          return <i key={state} data-seg={state} style={{ width: `${((count / total) * 100).toFixed(2)}%` }} />
        })}
      </div>
      <div className={css.seglegend}>
        {SEGMENT_ORDER.map((state) => {
          const count = counts.get(state) ?? 0
          if (count === 0) return null
          return (
            <span key={state} className={css.lg}>
              <span className={css.sw} data-seg={state} />
              {t(SEGMENT_KEYS[state])}
              <b>{count}</b>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ── 成员条：印记芯片 + 悬停/点击浮层（保留会话跳转/暂停/未读） ── */

function MemberChip({ member, team, t, openMember, readOnly, beat }: {
  member: TeamActivityMember
  team: TeamActivitySnapshot
  t: Translate
  openMember: OpenMember
  readOnly?: boolean
  beat?: LiveBeat
}): ReactElement {
  // 悬停预览与点击钉住分开建模：enter 只置 hover，click 只翻 pinned，
  // 二者任一为真即展开（无头点击/真实悬停/触屏点按三条路都成立）。
  const [pinned, setPinned] = useState(false)
  const [hover, setHover] = useState(false)
  const [pausing, setPausing] = useState(false)
  const [pauseError, setPauseError] = useState<string | undefined>(undefined)
  const infoOpen = pinned || hover
  const sigil = memberSigil(member.name, member.role)
  const Sigil = (sigil !== undefined ? ROLE_ICONS[sigil] : undefined) as IconComponent | undefined
  const activity = beatActivity(member.activity, beat)
  const stateKey = (activity === 'working' ? 'member.state.working'
    : activity === 'idle' ? 'member.state.idle'
      : 'member.state.unknown') as TeamsXLocaleKey
  const openable = member.id !== '' && member.status !== 'removed'
  const inkStyle = { '--tx-ink': memberInk(member.name) } as CSSProperties

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
    <span
      className={css.memberChip}
      style={inkStyle}
      data-activity={activity}
      onMouseEnter={() => { setHover(true) }}
      onMouseLeave={() => { setHover(false) }}
    >
      {member.unread > 0 && (
        <span className={css.memberChipUnread} title={t('member.unread', { count: member.unread })}>{member.unread}</span>
      )}
      {/* 徽记 = 详情开关（悬停预览 + 点击钉住，触屏可达）；名字 = 会话跳转 */}
      <button
        type='button'
        className={css.memberChipInfo}
        onClick={() => { setPinned((value) => !value) }}
        aria-expanded={infoOpen === true || undefined}
        aria-label={`${t('member.info')} · ${member.name}`}
        title={`${member.name} · ${t(stateKey)}`}
      >
        <span className={css.memberChipIcon}>
          {Sigil !== undefined ? <Sigil size={13} decorative /> : <TeamsXLogo size={13} label={member.name} />}
        </span>
      </button>
      {openable ? (
        <button
          type='button'
          className={css.memberChipName}
          onClick={() => { openMember(team.captainSessionId, member.id) }}
          title={t('member.openSession')}
        >
          {member.name}
        </button>
      ) : (
        <span className={css.memberChipName} title={`${member.name} · ${t(stateKey)}`}>{member.name}</span>
      )}
      <span className={css.memberChipPop} data-open={infoOpen === true || undefined} role='status'>
        <span className={css.taskPopRow}>
          <span className={css.taskPopKey}>{t('member.model')}</span>
          <span>{pauseError ?? member.model}</span>
        </span>
        <span className={css.taskPopRow}>
          <span className={css.taskPopKey}>{t('member.tokensTitle')}</span>
          <span>
            {member.usage !== undefined
              ? `↑${formatTokens(member.usage.inputTokens)} ↓${formatTokens(member.usage.outputTokens)}`
              : '--'}
          </span>
        </span>
        <span className={css.taskPopRow}>
          <span className={css.taskPopKey}>{t('editor.tasks')}</span>
          <span>{t('member.progress', { done: member.done, total: member.total })}</span>
        </span>
        {!readOnly && activity === 'working' && (
          <button
            type='button'
            className={css.memberChipPause}
            onClick={() => { void pause() }}
            disabled={pausing}
          >
            {pausing ? '…' : t('member.pause')}
          </button>
        )}
      </span>
    </span>
  )
}

/* ── 卡片本体 ────────────────────────────────────────────────── */

export function TeamCard({ team, t, openMember, readOnly, onSaved }: TeamCardProps): ReactElement {
  const [confirming, setConfirming] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stopError, setStopError] = useState<string | undefined>(undefined)
  const [filter, setFilter] = useState<StreamFilter>('all')
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>(undefined)
  const counts = countTasks(team.tasks)
  const phaseKey = (team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running') as TeamsXLocaleKey
  // 脉搏层: subscribe to the members' host sessions once per card; beats
  // override the polled activity in the strip and the now-bar until quiet.
  const memberIds = useMemo(() => team.members.map((member) => member.id), [team.members])
  const beats = useLiveBeats(memberIds)

  const elapsed = totalElapsedMs(team.tasks)
  const tokens = sumTokens(team.members)
  const staged = team.phase === 'staged'
  const running = team.phase === 'running'

  const entries = useMemo(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox])
  const filteredCount = applyStreamFilter(entries, filter).length
  const unread = team.messageCount

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

  const toggleMemberFilter = (name: string): void => {
    setFilter((prev) => (typeof prev === 'object' && prev.member === name ? 'all' : { member: name }))
  }

  // 「正在发生」: working members first (rings), then running tasks nobody
  // is visibly driving (shared-pool or idle assignee).
  const workingMembers = team.members.filter(
    (member) => beatActivity(member.activity, beats[member.id]) === 'working',
  )
  const workingNames = new Set(workingMembers.map((member) => member.name))
  const orphanRunning = running
    ? team.tasks.filter((task) => task.status === 'in_progress' && !workingNames.has(task.assignee))
    : []

  return (
    <section className={css.teamCard} data-phase={team.phase} data-halted={team.halted === true || undefined}>
      <header className={css.teamHeader}>
        <TeamsXLogo size={20} className={css.teamLogo} decorative />
        <div className={css.teamTitleBlock}>
          <h3 className={css.teamName} title={team.name}>{team.name}</h3>
          {team.description !== undefined && <p className={css.teamGoal}>{team.description}</p>}
        </div>
        {readOnly && <span className={css.teamNote}>{t('card.readonly')}</span>}
        {team.planReviewState === 'awaiting_feedback' && (
          <span className={css.teamNote}>{t('team.planReview.awaiting_feedback')}</span>
        )}
        {team.halted === true && <span className={css.teamNote} data-halted>{t('team.halted')}</span>}
        <span className={css.phaseTag} data-phase={team.phase}>{t(phaseKey)}</span>
        {!readOnly && running && team.halted !== true && !confirming && (
          <button type='button' className={css.stopButton} onClick={() => { setConfirming(true) }}>
            {t('team.stop')}
          </button>
        )}
      </header>

      {staged && !readOnly && (
        <>
          <PlanReviewBar team={team} t={t} />
          <StagedPlanEditor team={team} t={t} onSaved={onSaved} />
        </>
      )}

      <div className={css.headStats}>
        {running ? (
          <>
            <HeadRing done={counts.completed} denom={counts.denom} t={t} />
            <span className={css.headStat}>
              <span className={css.headStatIcon}><GlyphClock size={13} decorative /></span>
              <span className={css.sl}>
                <b>{elapsed !== undefined ? formatElapsed(elapsed) : '--'}</b>
                <i>{t('task.elapsedTitle')}</i>
              </span>
            </span>
            {tokens !== undefined && <TokenViz tokens={tokens} />}
          </>
        ) : (
          <>
            <span className={css.headStat}>
              <span className={css.sl}>
                <b>{team.members.length}</b>
                <i>{t('editor.members')}</i>
              </span>
            </span>
            <span className={css.headStat}>
              <span className={css.sl}>
                <b>{team.tasks.length}</b>
                <i>{t('editor.tasks')}</i>
              </span>
            </span>
          </>
        )}
      </div>

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

      {running && <SegBar team={team} t={t} />}

      {(workingMembers.length > 0 || orphanRunning.length > 0) && (
        <>
          <div className={css.nowLabel}>{t('now.title')}</div>
          <div className={css.nowbar} role='group' aria-label={t('now.title')}>
            {workingMembers.map((member) => {
              const task = team.tasks.find(
                (candidate) => candidate.status === 'in_progress' && candidate.assignee === member.name,
              )
              return (
                <button
                  key={member.id !== '' ? member.id : member.name}
                  type='button'
                  className={css.nowitem}
                  style={{ '--tx-ink': memberInk(member.name) } as CSSProperties}
                  data-active={typeof filter === 'object' && filter.member === member.name || undefined}
                  onClick={() => { toggleMemberFilter(member.name) }}
                  title={t('now.hint', { name: member.name })}
                >
                  <MiniRing pct={member.progress} color={memberInk(member.name)} />
                  <b className={css.nowName}>{member.name}</b>
                  {task !== undefined && <span className={css.nowTaskId}>{task.id}</span>}
                  <span className={css.nowText}>{task !== undefined ? task.subject : member.currentTask !== '' ? member.currentTask : t('member.state.working')}</span>
                  {member.unread > 0 && <span className={css.memberChipUnread} data-inline>{member.unread}</span>}
                </button>
              )
            })}
            {orphanRunning.map((task) => (
              <button
                key={task.id}
                type='button'
                className={css.nowitem}
                onClick={() => { setFilter('all'); setFocusTaskId(task.id) }}
                title={t('wm.hint', { status: t(`task.status.${task.status}` as TeamsXLocaleKey) })}
              >
                <span className={css.nowDot} aria-hidden />
                <span className={css.nowTaskId}>{task.id}</span>
                <span className={css.nowText}>{task.subject}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {team.members.length > 0 && (
        <div className={css.memberStrip} role='group' aria-label={t('editor.members')}>
          {team.members.map((member) => (
            <MemberChip
              key={member.id !== '' ? member.id : member.name}
              member={member}
              team={team}
              t={t}
              openMember={openMember}
              readOnly={readOnly}
              beat={beats[member.id]}
            />
          ))}
        </div>
      )}

      {running && team.tasks.length > 0 && (
        <div className={css.wmbar} role='group' aria-label={t('wm.title')}>
          <span className={css.wmLabel}>{t('wm.title')}</span>
          {team.tasks.map((task) => {
            const state = nodeStateOf(task)
            const statusLabel = t(`task.status.${task.status}` as TeamsXLocaleKey)
            return (
              <button
                key={task.id}
                type='button'
                className={css.wm}
                data-state={state}
                onClick={() => { setFilter('all'); setFocusTaskId(task.id) }}
                title={`${task.subject} · ${t('wm.hint', { status: statusLabel })}`}
                aria-label={`${task.subject} · ${statusLabel}`}
              >
                <span>{task.id}</span>
                <span className={css.wmFill} aria-hidden>
                  <i style={{ width: state === 'done' || state === 'failed' ? '100%' : state === 'running' || state === 'blocked' ? '52%' : '0%' }} />
                </span>
              </button>
            )
          })}
        </div>
      )}

      {(running || entries.length > 0) && (
        <>
          <div className={css.filters} role='group' aria-label={t('ticker.aria')}>
            <button
              type='button'
              className={css.filterChip}
              aria-pressed={filter === 'all'}
              onClick={() => { setFilter('all') }}
            >
              {t('stream.filter.all')}
            </button>
            <button
              type='button'
              className={css.filterChip}
              aria-pressed={filter === 'task'}
              onClick={() => { setFilter('task') }}
            >
              {t('stream.filter.task')}
            </button>
            <button
              type='button'
              className={css.filterChip}
              aria-pressed={filter === 'msg'}
              onClick={() => { setFilter('msg') }}
            >
              {t('stream.filter.msg')}
              {unread > 0 && <b className={css.filterUnread}>{unread}</b>}
            </button>
            {typeof filter === 'object' && (
              <button type='button' className={css.filterChip} data-member aria-pressed='true' onClick={() => { setFilter('all') }}>
                {t('stream.filter.member', { name: filter.member })}
                <span aria-hidden> ✕</span>
              </button>
            )}
            <span className={css.filterCount}>
              {t('stream.count', { shown: filteredCount, total: entries.length })}
            </span>
          </div>
          <TimelineStream
            team={team}
            t={t}
            openMember={openMember}
            readOnly={readOnly}
            filter={filter}
            decomposing={running && team.tasks.length === 0}
            focusTaskId={focusTaskId}
            onFocusHandled={() => { setFocusTaskId(undefined) }}
          />
        </>
      )}
    </section>
  )
}
