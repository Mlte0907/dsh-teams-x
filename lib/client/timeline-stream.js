import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 统一时间流（timeline stream）— the Direction-C narrative core.
 *
 * One rail, everything in occurrence order: structured operations and
 * captain-inbox mail interleave by timestamp, each task expands a compact
 * state card at its NEWEST event (the card is the task, the events are its
 * story), and the viewer reads one column instead of hopping between a
 * roster block, a task block, and a ticker.
 *
 * Discipline carried over from the ticker it replaces:
 * - consecutive same-actor same-action operations inside 60s fold into one
 *   row with a ×N counter (poll bursts read as one beat);
 * - unmatched server actions fall back to their raw kebab string (never
 *   blank);
 * - poll-driven text swaps render directly, no entry animation.
 * @module dsh-teams-x/client/timeline-stream
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatElapsed } from "./format.js";
import { memberInk } from "./member-identity.js";
import { RichText } from "./rich-text.js";
import css from './ActivityPanel.module.css';
import { VISUAL_STATE_ICONS } from "./icons.js";
/** Locale keys for the frequent operation verbs (zh dictionary is truth). */
const OP_VERB_KEYS = {
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
};
/** Human verb for an operation action; unmatched actions fall back to raw. */
export function operationVerb(t, action) {
    const key = OP_VERB_KEYS[action];
    return key !== undefined ? t(key) : action;
}
/** Actions that were in-flight when logged (hollow rail dots). */
const IN_FLIGHT = new Set(['task-dispatched', 'task-claimed', 'task-progress']);
/** Merge window for consecutive same-actor same-action operations. */
const MERGE_WINDOW_MS = 60_000;
/** Rows shown before the "load earlier" fold. */
const FRESH_ROW_LIMIT = 10;
/** Merge operations + mail into one newest-first stream with fold + anchors. */
export function buildStreamEntries(operations, messages) {
    const newestByTask = new Map();
    for (const op of operations) {
        if (op.taskId === undefined)
            continue;
        const current = newestByTask.get(op.taskId);
        if (current === undefined || op.ts >= current.ts)
            newestByTask.set(op.taskId, op);
    }
    const raw = [
        ...operations.map((op) => ({
            key: `op-${op.ts}-${op.actor}-${op.action}`,
            kind: 'op',
            ts: op.ts,
            op,
            count: 1,
            anchor: op.taskId !== undefined && newestByTask.get(op.taskId) === op,
        })),
        ...messages.map((message, index) => ({
            key: `msg-${message.ts ?? 0}-${index}`,
            kind: 'inbox',
            ts: message.ts ?? 0,
            message,
            count: 1,
            anchor: false,
        })),
    ].sort((a, b) => b.ts - a.ts);
    const merged = [];
    for (const entry of raw) {
        const last = merged[merged.length - 1];
        if (entry.kind === 'op' && last !== undefined && last.kind === 'op'
            && last.op !== undefined && entry.op !== undefined
            && last.op.actor === entry.op.actor
            && last.op.action === entry.op.action
            && last.op.ts - entry.op.ts <= MERGE_WINDOW_MS) {
            merged[merged.length - 1] = { ...last, count: last.count + 1 };
            continue;
        }
        merged.push(entry);
    }
    return merged;
}
/** Visual row kind: drives the rail dot's shape/color. */
function rowKind(entry) {
    if (entry.kind === 'inbox')
        return 'inbox';
    const action = entry.op?.action;
    if (action === 'task-failed')
        return 'bad';
    if (action === 'task-completed')
        return 'ok';
    if (entry.op?.taskId !== undefined)
        return 'task';
    return 'op';
}
/** Apply a stream filter to merged entries (shared by the filter chips row). */
export function applyStreamFilter(entries, filter) {
    if (filter === 'all')
        return entries;
    if (filter === 'task')
        return entries.filter((entry) => entry.kind === 'op' && entry.op?.taskId !== undefined);
    if (filter === 'msg')
        return entries.filter((entry) => entry.kind === 'inbox');
    return entries.filter((entry) => (entry.kind === 'inbox' ? entry.message?.from === filter.member : entry.op?.actor === filter.member));
}
function sameFilter(a, b) {
    if (a === b)
        return true;
    if (typeof a === 'object' && typeof b === 'object')
        return a.member === b.member;
    return false;
}
function formatClock(ts) {
    // hourCycle 显式 23 制：宿主 locale 不确定（zh 一般无上午/后缀，en 会拖出
    // AM/PM 撑爆时间列），不能依赖运行环境默认。
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}
function formatDay(ts) {
    return new Date(ts).toLocaleDateString([], { month: 'numeric', day: 'numeric', weekday: 'short' });
}
/* ── 任务状态卡（锚定在最新事件处） ──────────────────────────── */
/** Progress-note sparkline: up to 8 ascending bars. */
function Trend({ count }) {
    const steps = Math.min(count, 8);
    if (steps < 2)
        return null;
    return (_jsx("span", { className: css.trend, "aria-hidden": true, children: Array.from({ length: steps }, (_, index) => (_jsx("i", { style: { height: `${Math.min(14, 3 + index * 2)}px` } }, index))) }));
}
function TaskStreamCard({ task, t, onOpen }) {
    const StateIcon = VISUAL_STATE_ICONS[task.state];
    const statusKey = `task.status.${task.status}`;
    const shared = task.assignee === '';
    const assignee = shared ? t('task.assignee.shared')
        : task.assignee === 'captain' ? t('task.assignee.captain')
            : task.assignee;
    const inkStyle = shared ? undefined : { '--tx-ink': memberInk(task.assignee) };
    return (_jsxs("button", { type: 'button', className: css.tcard, "data-state": task.state, onClick: (event) => { onOpen(task, event.currentTarget); }, "aria-label": `${task.id} ${t(statusKey)} ${assignee}`, children: [_jsxs("span", { className: css.tcTop, children: [_jsx("span", { className: css.tcId, children: task.id }), task.kind === 'repair' && task.round !== undefined && task.round > 0 && (_jsx("span", { className: css.chipRepair, title: t('task.roundTitle', { round: task.round }), children: `R${task.round}` })), task.takenOverBy === 'captain' && (_jsx("span", { className: css.chipTaken, title: t('task.takenTitle'), children: t('task.taken') })), typeof task.elapsedMs === 'number' && (_jsx("span", { className: css.tcElapsed, title: t('task.elapsedTitle'), children: formatElapsed(task.elapsedMs) }))] }), _jsx("span", { className: css.tcSubj, title: task.description || task.subject, children: task.subject }), _jsxs("span", { className: css.tcFoot, children: [_jsxs("span", { className: css.tcStatus, children: [StateIcon !== undefined && _jsx(StateIcon, { size: 11, decorative: true }), t(statusKey)] }), task.depth > 0 && _jsx("span", { className: css.chip, children: t('task.depth', { depth: task.depth }) }), task.kind === 'repair' && task.dependencies.length > 0 && (_jsx("span", { className: css.chip, "data-note": "source", title: t('task.sourceTitle', { taskId: task.dependencies[0] ?? '' }), children: `↻ ${task.dependencies[0] ?? ''}` })), typeof task.progressCount === 'number' && task.progressCount > 0 && (_jsx("span", { className: css.chip, "data-note": "progress", title: task.progressLatest ?? '', children: `${task.progressCount}×${t('op.task-progress')}` })), task.verdict !== undefined && (_jsx("span", { className: css.chip, "data-verdict": task.verdict, children: t(`task.verdict.${task.verdict}`) })), task.dependencies.length > 0 && (_jsx("span", { className: css.chip, title: t('task.depsNote', { deps: task.dependencies.join(' ') }), children: `deps ${task.dependencies.join(' ')}` })), _jsx("span", { className: css.tcAssignee, style: inkStyle, children: assignee })] }), task.status === 'in_progress' && (task.progressCount ?? 0) > 1 && _jsx(Trend, { count: task.progressCount ?? 0 })] }));
}
/* ── 任务详情浮层（点击状态卡；点外/Esc/滚动关闭） ────────────── */
function TaskPopover({ task, anchor, t, onClose }) {
    const ref = useRef(null);
    const [pos, setPos] = useState(undefined);
    useEffect(() => {
        const rect = anchor.getBoundingClientRect();
        const width = 264;
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
        let top = rect.bottom + 6;
        if (top + 200 > window.innerHeight - 8)
            top = Math.max(8, rect.top - 206);
        setPos({ left, top });
        const close = (event) => {
            const target = event.target;
            if (target === null)
                return;
            if (ref.current?.contains(target) === true || anchor.contains(target) === true)
                return;
            onClose();
        };
        const onKey = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            }
        };
        const onScroll = () => { onClose(); };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('scroll', onScroll, true);
        };
    }, [anchor, onClose]);
    const statusKey = `task.status.${task.status}`;
    return createPortal(_jsxs("div", { ref: ref, className: css.taskPop, style: pos === undefined ? { visibility: 'hidden' } : { left: `${pos.left}px`, top: `${pos.top}px` }, role: 'dialog', "aria-label": task.subject, children: [_jsx("h4", { children: task.subject }), _jsx("div", { className: css.taskPopMeta, children: `${task.id} · ${t(statusKey)}${task.round !== undefined && task.round > 0 ? ` · R${task.round}` : ''}` }), task.description !== '' && _jsx("p", { className: css.taskPopDesc, children: task.description }), _jsxs("div", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('pop.assignee') }), _jsx("span", { children: task.assignee === '' ? t('task.assignee.shared') : task.assignee === 'captain' ? t('task.assignee.captain') : task.assignee })] }), _jsxs("div", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('pop.deps') }), _jsx("span", { children: task.dependencies.length > 0 ? task.dependencies.join(', ') : '—' })] }), task.progressLatest !== undefined && (_jsxs("div", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('pop.latest') }), _jsx("span", { children: task.progressLatest })] })), typeof task.elapsedMs === 'number' && (_jsxs("div", { className: css.taskPopRow, children: [_jsx("span", { className: css.taskPopKey, children: t('pop.elapsed') }), _jsx("span", { children: formatElapsed(task.elapsedMs) })] }))] }), document.body);
}
/* ── 流本体 ──────────────────────────────────────────────────── */
export function TimelineStream({ team, t, openMember, readOnly, filter, decomposing, focusTaskId, onFocusHandled }) {
    const [olderShown, setOlderShown] = useState(false);
    const [pop, setPop] = useState(undefined);
    const rowRefs = useRef(new Map());
    const entries = useMemo(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox]);
    const tasksById = useMemo(() => new Map(team.tasks.map((task) => [task.id, task])), [team.tasks]);
    const filtered = useMemo(() => applyStreamFilter(entries, filter), [entries, filter]);
    // A member filter on a fresh fold reads as broken when it keeps only 2 of 30
    // rows — the fold only makes sense for the unfiltered narrative.
    const folded = !olderShown && sameFilter(filter, 'all') && filtered.length > FRESH_ROW_LIMIT;
    const visible = folded ? filtered.slice(0, FRESH_ROW_LIMIT) : filtered;
    // Locate request (task meter click): expand the fold, then scroll.
    useEffect(() => {
        if (focusTaskId === undefined)
            return;
        setOlderShown(true);
        const row = rowRefs.current.get(`anchor-${focusTaskId}`);
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onFocusHandled?.();
    }, [focusTaskId, onFocusHandled]);
    const openTaskCard = (task, anchor) => {
        if (readOnly)
            return;
        setPop({ task, anchor });
    };
    const openActor = (name) => {
        const member = team.members.find((candidate) => candidate.name === name);
        if (member === undefined || member.id === '')
            return false;
        openMember(team.captainSessionId, member.id);
        return true;
    };
    if (decomposing) {
        return (_jsx("div", { className: css.stream, role: 'status', "aria-label": t('task.decomposing'), children: [86, 64, 78, 58].map((width, index) => (_jsxs("div", { className: css.streamRow, children: [_jsx("span", { className: css.streamTime, children: "--:--" }), _jsx("div", { className: css.streamBody, children: _jsx("span", { className: css.skeletonRow, style: { width: `${width}%` } }) })] }, index))) }));
    }
    if (filtered.length === 0) {
        return (_jsx("div", { className: css.stream, children: _jsx("p", { className: css.streamEmpty, children: entries.length === 0
                    ? t('stream.empty')
                    : t('stream.count', { shown: 0, total: entries.length }) }) }));
    }
    let prevTs;
    return (_jsxs("div", { className: css.stream, role: 'feed', "aria-label": t('ticker.aria'), children: [visible.map((entry, index) => {
                const dayBreak = prevTs !== undefined && formatDay(prevTs) !== formatDay(entry.ts);
                prevTs = entry.ts;
                const kind = rowKind(entry);
                const actor = entry.kind === 'inbox' ? entry.message?.from ?? '' : entry.op?.actor ?? '';
                const verb = entry.kind === 'op' && entry.op !== undefined ? operationVerb(t, entry.op.action) : '';
                const taskId = entry.op?.taskId;
                const anchorTask = entry.anchor && taskId !== undefined ? tasksById.get(taskId) : undefined;
                const member = team.members.find((candidate) => candidate.name === actor);
                const openable = member !== undefined && member.id !== '' && member.status !== 'removed';
                const last = index === visible.length - 1;
                return (_jsxs("div", { children: [dayBreak && _jsx("div", { className: css.daysep, role: 'separator', children: formatDay(entry.ts) }), _jsxs("div", { ref: (node) => {
                                if (anchorTask !== undefined && node !== null)
                                    rowRefs.current.set(`anchor-${anchorTask.id}`, node);
                            }, className: css.streamRow, "data-kind": kind, "data-flight": entry.kind === 'op' && IN_FLIGHT.has(entry.op?.action ?? '') || undefined, children: [_jsx("span", { className: css.streamTime, children: formatClock(entry.ts) }), _jsxs("div", { className: css.streamBody, children: [_jsx("span", { className: css.streamWho, style: { '--tx-ink': memberInk(actor) }, children: openable ? (_jsx("button", { type: 'button', className: css.streamWhoBtn, onClick: () => { openActor(actor); }, title: t('member.openSession'), children: actor })) : actor }), entry.kind === 'inbox' ? (_jsxs("span", { className: css.msg, children: [_jsx("span", { className: css.msgTag, children: t('stream.from') }), _jsx(RichText, { text: entry.message?.content ?? '', className: css.msgRich })] })) : (_jsxs("span", { className: css.streamText, children: [_jsx("b", { children: verb }), taskId !== undefined && _jsx("span", { className: css.streamTaskId, children: taskId }), entry.count > 1 && _jsx("span", { className: css.streamMerge, children: `×${entry.count}` }), entry.op?.detail !== undefined && _jsx("span", { className: css.streamDetail, children: entry.op.detail })] })), anchorTask !== undefined && (_jsx(TaskStreamCard, { task: anchorTask, t: t, onOpen: openTaskCard }))] })] }), last && folded && (_jsx("button", { type: 'button', className: css.older, onClick: () => { setOlderShown(true); }, children: t('stream.older') }))] }, entry.key));
            }), pop !== undefined && (_jsx(TaskPopover, { task: pop.task, anchor: pop.anchor, t: t, onClose: () => { setPop(undefined); } }))] }));
}
