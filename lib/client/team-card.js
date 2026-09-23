import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useMemo, useState } from 'react';
import { formatElapsed, formatTokens } from "./format.js";
import { haltTeam, pauseMember } from "./api.js";
import { PlanReviewBar } from "./plan-review.js";
import { StagedPlanEditor } from "./StagedPlanEditor.js";
import { countTasks } from "./progress-ring.js";
import { beatActivity, useLiveBeats } from "./live-activity.js";
import { memberInk, memberSigil } from "./member-identity.js";
import { applyStreamFilter, buildStreamEntries, TimelineStream } from "./timeline-stream.js";
import css from './ActivityPanel.module.css';
import { GlyphClock, ROLE_ICONS, TeamsXLogo } from "./icons.js";
/**
 * Total task elapsed time: every task contributes its wall-clock run time —
 * terminal tasks their final duration, running tasks their growing current
 * elapsed — so the tile always reads the team's accumulated working time
 * instead of going blank the moment the last task completes.
 */
function totalElapsedMs(tasks) {
    let total;
    for (const task of tasks) {
        if (typeof task.elapsedMs !== 'number')
            continue;
        total = (total ?? 0) + task.elapsedMs;
    }
    return total;
}
/**
 * Team-wide cumulative token total: each member owns a dedicated session, so
 * summing the per-member cumulative usage never double-counts.
 */
function sumTokens(members) {
    let input;
    let output;
    for (const member of members) {
        if (member.usage === undefined)
            continue;
        input = (input ?? 0) + member.usage.inputTokens;
        output = (output ?? 0) + member.usage.outputTokens;
    }
    return input === undefined || output === undefined ? undefined : { input, output };
}
/** Visual task state used by the segmented bar and the task meter. */
function nodeStateOf(task) {
    if (task.state === 'blocked')
        return 'blocked';
    if (task.status === 'in_progress' || task.status === 'claimed')
        return 'running';
    if (task.status === 'completed')
        return 'done';
    if (task.status === 'failed')
        return 'failed';
    return 'pending';
}
const SEGMENT_ORDER = ['done', 'running', 'failed', 'blocked', 'pending'];
const SEGMENT_KEYS = {
    done: 'task.status.completed',
    running: 'task.status.in_progress',
    failed: 'task.status.failed',
    blocked: 'task.visual.blocked',
    pending: 'task.status.pending',
};
/* ── 头部仪表：完成度环 + 累计耗时 + token 双条 ─────────────── */
function HeadRing({ done, denom, t }) {
    const pct = denom > 0 ? Math.round((done / denom) * 100) : 0;
    const size = 32;
    const stroke = 3.5;
    const r = (size - stroke) / 2 - 0.5;
    const c = 2 * Math.PI * r;
    return (_jsxs("span", { className: css.headStat, children: [_jsxs("span", { className: css.headRing, role: 'img', "aria-label": t('team.done', { done, total: denom }), title: t('team.done', { done, total: denom }), children: [_jsx("svg", { className: css.ringSvg, width: size, height: size, viewBox: `0 0 ${size} ${size}`, "aria-hidden": true, children: _jsxs("g", { transform: `rotate(-90 ${size / 2} ${size / 2})`, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: 'var(--tx-viz-track)', strokeWidth: stroke }), _jsx("circle", { className: css.ringSeg, cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: pct >= 100 ? 'var(--tx-ok)' : 'var(--tx-accent)', strokeWidth: stroke, strokeLinecap: 'round', strokeDasharray: `${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}` })] }) }), _jsx("span", { className: css.headRingValue, children: `${done}/${denom}` })] }), _jsxs("span", { className: css.sl, children: [_jsx("b", { children: `${pct}%` }), _jsx("i", { children: t('team.progressLabel') })] })] }));
}
function TokenViz({ tokens }) {
    const max = Math.max(tokens.input, tokens.output, 1);
    const width = (value) => `${Math.min(100, Math.round((value / max) * 100))}%`;
    return (_jsxs("span", { className: css.headStat, children: [_jsxs("span", { className: css.tokviz, title: `↑${formatTokens(tokens.input)} / ↓${formatTokens(tokens.output)}`, "aria-hidden": true, children: [_jsx("i", { children: _jsx("b", { style: { width: width(tokens.input) } }) }), _jsx("i", { "data-out": true, children: _jsx("b", { style: { width: width(tokens.output) } }) })] }), _jsxs("span", { className: css.sl, children: [_jsx("b", { children: `↑${formatTokens(tokens.input)}` }), _jsx("i", { children: `↓${formatTokens(tokens.output)}` })] })] }));
}
/** 26px mini progress ring for the 「正在发生」 pills. */
function MiniRing({ pct, color }) {
    const size = 26;
    const stroke = 3;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return (_jsxs("span", { className: css.headRing, "data-mini": true, "aria-hidden": true, children: [_jsx("svg", { className: css.ringSvg, width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: _jsxs("g", { transform: `rotate(-90 ${size / 2} ${size / 2})`, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: 'var(--tx-viz-track)', strokeWidth: stroke }), _jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeDasharray: `${(c * Math.max(0, Math.min(100, pct)) / 100).toFixed(1)} ${c.toFixed(1)}` })] }) }), _jsx("span", { className: css.headRingValue, children: pct })] }));
}
/* ── 任务状态分段条 ──────────────────────────────────────────── */
function SegBar({ team, t }) {
    const counts = useMemo(() => {
        const result = new Map();
        for (const task of team.tasks) {
            const state = nodeStateOf(task);
            result.set(state, (result.get(state) ?? 0) + 1);
        }
        return result;
    }, [team.tasks]);
    const total = team.tasks.length;
    if (total === 0)
        return null;
    return (_jsxs("div", { className: css.segbar, "aria-hidden": true, children: [_jsx("div", { className: css.segtrack, children: SEGMENT_ORDER.map((state) => {
                    const count = counts.get(state) ?? 0;
                    if (count === 0)
                        return null;
                    return _jsx("i", { "data-seg": state, style: { width: `${((count / total) * 100).toFixed(2)}%` } }, state);
                }) }), _jsx("div", { className: css.seglegend, children: SEGMENT_ORDER.map((state) => {
                    const count = counts.get(state) ?? 0;
                    if (count === 0)
                        return null;
                    return (_jsxs("span", { className: css.lg, children: [_jsx("span", { className: css.sw, "data-seg": state }), t(SEGMENT_KEYS[state]), _jsx("b", { children: count })] }, state));
                }) })] }));
}
/* ── 成员条：印记芯片 + 悬停/点击浮层（保留会话跳转/暂停/未读） ── */
function MemberChip({ member, team, t, openMember, readOnly, beat }) {
    // 悬停预览与点击钉住分开建模：enter 只置 hover，click 只翻 pinned，
    // 二者任一为真即展开（无头点击/真实悬停/触屏点按三条路都成立）。
    const [pinned, setPinned] = useState(false);
    const [hover, setHover] = useState(false);
    const [pausing, setPausing] = useState(false);
    const [pauseError, setPauseError] = useState(undefined);
    const infoOpen = pinned || hover;
    const sigil = memberSigil(member.name, member.role);
    const Sigil = (sigil !== undefined ? ROLE_ICONS[sigil] : undefined);
    const activity = beatActivity(member.activity, beat);
    const stateKey = (activity === 'working' ? 'member.state.working'
        : activity === 'idle' ? 'member.state.idle'
            : 'member.state.unknown');
    const openable = member.id !== '' && member.status !== 'removed';
    const inkStyle = { '--tx-ink': memberInk(member.name) };
    const pause = async () => {
        setPausing(true);
        setPauseError(undefined);
        try {
            await pauseMember(team.captainSessionId, team.teamId, member.name);
        }
        catch (cause) {
            setPauseError(cause instanceof Error ? cause.message : String(cause));
        }
        finally {
            setPausing(false);
        }
    };
    return (_jsxs("span", { className: css.memberChip, style: inkStyle, "data-activity": activity, onMouseEnter: () => { setHover(true); }, onMouseLeave: () => { setHover(false); }, children: [member.unread > 0 && (_jsx("span", { className: css.memberChipUnread, title: t('member.unread', { count: member.unread }), children: member.unread })), _jsx("button", { type: 'button', className: css.memberChipInfo, onClick: () => { setPinned((value) => !value); }, "aria-expanded": infoOpen === true || undefined, "aria-label": `${t('member.info')} · ${member.name}`, title: `${member.name} · ${t(stateKey)}`, children: _jsx("span", { className: css.memberChipIcon, children: Sigil !== undefined ? _jsx(Sigil, { size: 13, decorative: true }) : _jsx(TeamsXLogo, { size: 13, label: member.name }) }) }), openable ? (_jsx("button", { type: 'button', className: css.memberChipName, onClick: () => { openMember(team.captainSessionId, member.id); }, title: t('member.openSession'), children: member.name })) : (_jsx("span", { className: css.memberChipName, title: `${member.name} · ${t(stateKey)}`, children: member.name })), _jsxs("span", { className: css.memberChipPop, "data-open": infoOpen === true || undefined, role: 'status', children: [_jsxs("span", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('member.model') }), _jsx("span", { children: pauseError ?? member.model })] }), _jsxs("span", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('member.tokensTitle') }), _jsx("span", { children: member.usage !== undefined
                                    ? `↑${formatTokens(member.usage.inputTokens)} ↓${formatTokens(member.usage.outputTokens)}`
                                    : '--' })] }), _jsxs("span", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('editor.tasks') }), _jsx("span", { children: t('member.progress', { done: member.done, total: member.total }) })] }), !readOnly && activity === 'working' && (_jsx("button", { type: 'button', className: css.memberChipPause, onClick: () => { void pause(); }, disabled: pausing, children: pausing ? '…' : t('member.pause') }))] })] }));
}
/* ── 卡片本体 ────────────────────────────────────────────────── */
export function TeamCard({ team, t, openMember, readOnly, onSaved }) {
    const [confirming, setConfirming] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [stopError, setStopError] = useState(undefined);
    const [filter, setFilter] = useState('all');
    const [focusTaskId, setFocusTaskId] = useState(undefined);
    const counts = countTasks(team.tasks);
    const phaseKey = (team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running');
    // 脉搏层: subscribe to the members' host sessions once per card; beats
    // override the polled activity in the strip and the now-bar until quiet.
    const memberIds = useMemo(() => team.members.map((member) => member.id), [team.members]);
    const beats = useLiveBeats(memberIds);
    const elapsed = totalElapsedMs(team.tasks);
    const tokens = sumTokens(team.members);
    const staged = team.phase === 'staged';
    const running = team.phase === 'running';
    const entries = useMemo(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox]);
    const filteredCount = applyStreamFilter(entries, filter).length;
    const unread = team.messageCount;
    const stop = async () => {
        setStopping(true);
        setStopError(undefined);
        try {
            await haltTeam(team.captainSessionId, team.teamId);
            setConfirming(false);
        }
        catch (cause) {
            setStopError(cause instanceof Error ? cause.message : String(cause));
        }
        finally {
            setStopping(false);
        }
    };
    const toggleMemberFilter = (name) => {
        setFilter((prev) => (typeof prev === 'object' && prev.member === name ? 'all' : { member: name }));
    };
    // 「正在发生」: working members first (rings), then running tasks nobody
    // is visibly driving (shared-pool or idle assignee).
    const workingMembers = team.members.filter((member) => beatActivity(member.activity, beats[member.id]) === 'working');
    const workingNames = new Set(workingMembers.map((member) => member.name));
    const orphanRunning = running
        ? team.tasks.filter((task) => task.status === 'in_progress' && !workingNames.has(task.assignee))
        : [];
    return (_jsxs("section", { className: css.teamCard, "data-phase": team.phase, "data-halted": team.halted === true || undefined, children: [_jsxs("header", { className: css.teamHeader, children: [_jsx(TeamsXLogo, { size: 20, className: css.teamLogo, decorative: true }), _jsxs("div", { className: css.teamTitleBlock, children: [_jsx("h3", { className: css.teamName, title: team.name, children: team.name }), team.description !== undefined && _jsx("p", { className: css.teamGoal, children: team.description })] }), readOnly && _jsx("span", { className: css.teamNote, children: t('card.readonly') }), team.planReviewState === 'awaiting_feedback' && (_jsx("span", { className: css.teamNote, children: t('team.planReview.awaiting_feedback') })), team.halted === true && _jsx("span", { className: css.teamNote, "data-halted": true, children: t('team.halted') }), _jsx("span", { className: css.phaseTag, "data-phase": team.phase, children: t(phaseKey) }), !readOnly && running && team.halted !== true && !confirming && (_jsx("button", { type: 'button', className: css.stopButton, onClick: () => { setConfirming(true); }, children: t('team.stop') }))] }), staged && !readOnly && (_jsxs(_Fragment, { children: [_jsx(PlanReviewBar, { team: team, t: t }), _jsx(StagedPlanEditor, { team: team, t: t, onSaved: onSaved })] })), _jsx("div", { className: css.headStats, children: running ? (_jsxs(_Fragment, { children: [_jsx(HeadRing, { done: counts.completed, denom: counts.denom, t: t }), _jsxs("span", { className: css.headStat, children: [_jsx("span", { className: css.headStatIcon, children: _jsx(GlyphClock, { size: 13, decorative: true }) }), _jsxs("span", { className: css.sl, children: [_jsx("b", { children: elapsed !== undefined ? formatElapsed(elapsed) : '--' }), _jsx("i", { children: t('task.elapsedTitle') })] })] }), tokens !== undefined && _jsx(TokenViz, { tokens: tokens })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: css.headStat, children: _jsxs("span", { className: css.sl, children: [_jsx("b", { children: team.members.length }), _jsx("i", { children: t('editor.members') })] }) }), _jsx("span", { className: css.headStat, children: _jsxs("span", { className: css.sl, children: [_jsx("b", { children: team.tasks.length }), _jsx("i", { children: t('editor.tasks') })] }) })] })) }), confirming && (_jsxs("div", { className: css.stopConfirmBox, role: 'alertdialog', "aria-label": t('team.stopTitle', { team: team.name }), children: [_jsx("p", { children: t('team.stopDescription', { tasks: team.tasks.filter((task) => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress').length, members: team.members.filter((member) => member.activity === 'working').length }) }), stopError !== undefined && _jsx("p", { className: css.stopError, children: t('team.stopFailed', { message: stopError }) }), _jsxs("div", { className: css.stopActions, children: [_jsx("button", { type: 'button', className: css.stopCancel, onClick: () => { setConfirming(false); }, disabled: stopping, children: t('team.stopCancel') }), _jsx("button", { type: 'button', className: css.stopConfirm, onClick: () => { void stop(); }, disabled: stopping, children: stopping ? t('team.stopping') : t('team.stopConfirm') })] })] })), running && _jsx(SegBar, { team: team, t: t }), (workingMembers.length > 0 || orphanRunning.length > 0) && (_jsxs(_Fragment, { children: [_jsx("div", { className: css.nowLabel, children: t('now.title') }), _jsxs("div", { className: css.nowbar, role: 'group', "aria-label": t('now.title'), children: [workingMembers.map((member) => {
                                const task = team.tasks.find((candidate) => candidate.status === 'in_progress' && candidate.assignee === member.name);
                                return (_jsxs("button", { type: 'button', className: css.nowitem, style: { '--tx-ink': memberInk(member.name) }, "data-active": typeof filter === 'object' && filter.member === member.name || undefined, onClick: () => { toggleMemberFilter(member.name); }, title: t('now.hint', { name: member.name }), children: [_jsx(MiniRing, { pct: member.progress, color: memberInk(member.name) }), _jsx("b", { className: css.nowName, children: member.name }), task !== undefined && _jsx("span", { className: css.nowTaskId, children: task.id }), _jsx("span", { className: css.nowText, children: task !== undefined ? task.subject : member.currentTask !== '' ? member.currentTask : t('member.state.working') }), member.unread > 0 && _jsx("span", { className: css.memberChipUnread, "data-inline": true, children: member.unread })] }, member.id !== '' ? member.id : member.name));
                            }), orphanRunning.map((task) => (_jsxs("button", { type: 'button', className: css.nowitem, onClick: () => { setFilter('all'); setFocusTaskId(task.id); }, title: t('wm.hint', { status: t(`task.status.${task.status}`) }), children: [_jsx("span", { className: css.nowDot, "aria-hidden": true }), _jsx("span", { className: css.nowTaskId, children: task.id }), _jsx("span", { className: css.nowText, children: task.subject })] }, task.id)))] })] })), team.members.length > 0 && (_jsx("div", { className: css.memberStrip, role: 'group', "aria-label": t('editor.members'), children: team.members.map((member) => (_jsx(MemberChip, { member: member, team: team, t: t, openMember: openMember, readOnly: readOnly, beat: beats[member.id] }, member.id !== '' ? member.id : member.name))) })), running && team.tasks.length > 0 && (_jsxs("div", { className: css.wmbar, role: 'group', "aria-label": t('wm.title'), children: [_jsx("span", { className: css.wmLabel, children: t('wm.title') }), team.tasks.map((task) => {
                        const state = nodeStateOf(task);
                        const statusLabel = t(`task.status.${task.status}`);
                        return (_jsxs("button", { type: 'button', className: css.wm, "data-state": state, onClick: () => { setFilter('all'); setFocusTaskId(task.id); }, title: `${task.subject} · ${t('wm.hint', { status: statusLabel })}`, "aria-label": `${task.subject} · ${statusLabel}`, children: [_jsx("span", { children: task.id }), _jsx("span", { className: css.wmFill, "aria-hidden": true, children: _jsx("i", { style: { width: state === 'done' || state === 'failed' ? '100%' : state === 'running' || state === 'blocked' ? '52%' : '0%' } }) })] }, task.id));
                    })] })), (running || entries.length > 0) && (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.filters, role: 'group', "aria-label": t('ticker.aria'), children: [_jsx("button", { type: 'button', className: css.filterChip, "aria-pressed": filter === 'all', onClick: () => { setFilter('all'); }, children: t('stream.filter.all') }), _jsx("button", { type: 'button', className: css.filterChip, "aria-pressed": filter === 'task', onClick: () => { setFilter('task'); }, children: t('stream.filter.task') }), _jsxs("button", { type: 'button', className: css.filterChip, "aria-pressed": filter === 'msg', onClick: () => { setFilter('msg'); }, children: [t('stream.filter.msg'), unread > 0 && _jsx("b", { className: css.filterUnread, children: unread })] }), typeof filter === 'object' && (_jsxs("button", { type: 'button', className: css.filterChip, "data-member": true, "aria-pressed": 'true', onClick: () => { setFilter('all'); }, children: [t('stream.filter.member', { name: filter.member }), _jsx("span", { "aria-hidden": true, children: " \u2715" })] })), _jsx("span", { className: css.filterCount, children: t('stream.count', { shown: filteredCount, total: entries.length }) })] }), _jsx(TimelineStream, { team: team, t: t, openMember: openMember, readOnly: readOnly, filter: filter, decomposing: running && team.tasks.length === 0, focusTaskId: focusTaskId, onFocusHandled: () => { setFocusTaskId(undefined); } })] }))] }));
}
