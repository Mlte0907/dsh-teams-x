import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * TeamsX activity panel, mounted as a session-scoped header action.
 *
 * The badge registers into `conversation.session.header.actions` (next to the
 * autonomous-mode and Session-log controls), so it only ever exists inside an
 * open session's title bar. The framework resolves `sessionId` for
 * session-scoped slots, and the badge renders nothing unless a team belongs
 * to THIS session (captain or member id match) — switching to a session that
 * never used TeamsX shows no badge at all.
 *
 * The expanded panel portals to document.body as a fixed-position card
 * anchored under the badge; placement probes elementFromPoint so third-party
 * higher-layer docks (better-sidebar) cannot cover it.
 * @module dsh-teams-x/client/ActivityPanel
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import css from './ActivityPanel.module.css';
import { ACTIVITY_ICONS, ROLE_ICONS, VISUAL_STATE_ICONS, TeamsXLogo, } from "./icons.js";
/** Panel data endpoint served by the host plane. */
export const TEAMSX_STATE_URL = '/plugins/dsh-teams-x/state';
/** Halt endpoint served by the host plane. */
export const TEAMSX_HALT_URL = '/plugins/dsh-teams-x/halt';
/** Per-member pause endpoint served by the host plane. */
export const TEAMSX_PAUSE_URL = '/plugins/dsh-teams-x/member/pause';
/** Staged-plan review endpoint served by the host plane. */
export const TEAMSX_PLAN_URL = '/plugins/dsh-teams-x/plan';
/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000;
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export const DISCOVERY_INTERVAL_MS = 10_000;
/** Interpolate `{key}` params into a locale string. */
function format(template, params) {
    if (params === undefined)
        return template;
    return template.replace(/\{(\w+)\}/gu, (match, key) => (Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match));
}
/** Wrap the harness translate function with interpolation. */
function makeT(t) {
    return (key, params) => format(t(key, params), params);
}
/** Fetch the state endpoint (live or archived). */
async function fetchTeams(viewMode) {
    const url = viewMode === 'archive'
        ? `${TEAMSX_STATE_URL}?archived=1`
        : TEAMSX_STATE_URL;
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    return body.teams;
}
/**
 * Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
 * fast when expanded); `archive` mode fetches once on mount and on
 * explicit reload only (static historical data, no auto-refresh).
 */
function useTeamData(expanded, viewMode) {
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        let disposed = false;
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchTeams(viewMode);
                if (!disposed) {
                    setTeams(data);
                    setError(undefined);
                }
            }
            catch (cause) {
                if (!disposed)
                    setError(cause instanceof Error ? cause.message : String(cause));
            }
            finally {
                if (!disposed)
                    setLoading(false);
            }
        };
        void load();
        if (viewMode === 'archive') {
            // Static historical data — fetch once, then only on explicit reload.
            return () => { disposed = true; };
        }
        const interval = expanded ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS;
        const timer = window.setInterval(() => { void load(); }, interval);
        return () => {
            disposed = true;
            window.clearInterval(timer);
        };
    }, [expanded, viewMode, tick]);
    return { teams, error, loading, reload: () => setTick((value) => value + 1) };
}
/**
 * Detect narrow viewports (mobile web / remote): the expanded panel renders
 * as a full-width bottom sheet instead of a badge-anchored dropdown.
 */
function useIsNarrow() {
    const [isNarrow, setIsNarrow] = useState(() => window.matchMedia('(max-width: 720px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 720px)');
        const onChange = (e) => { setIsNarrow(e.matches); };
        mq.addEventListener('change', onChange);
        return () => { mq.removeEventListener('change', onChange); };
    }, []);
    return isNarrow;
}
/**
 * Place the expanded panel under the badge, cleared below the session tab
 * bar. Placement runs ONCE on open (plus on resize): no periodic re-probing,
 * so the panel never visibly jumps after settling. The one-shot horizontal
 * probe still dodges a higher-layer dock that would cover it.
 */
function usePanelPlacement(badgeRef, panelRef, expanded) {
    const [pos, setPos] = useState({ top: 96, right: 18 });
    useEffect(() => {
        if (!expanded)
            return;
        const place = () => {
            const badge = badgeRef.current;
            if (badge === null)
                return;
            const rect = badge.getBoundingClientRect();
            // Clear the session tab strip ("对话/轨迹/…") as the user asked: anchor
            // under whichever is lower — the badge or the tab bar.
            const tablist = document.querySelector('[role="tablist"]');
            const tablistBottom = tablist === null ? 0 : tablist.getBoundingClientRect().bottom;
            let top = Math.max(rect.bottom + 6, tablistBottom + 8, 8);
            const maxH = Math.min(window.innerHeight * 0.72, 640);
            if (top + maxH > window.innerHeight - 8) {
                top = Math.max(8, window.innerHeight - maxH - 8);
            }
            const preferred = Math.max(8, window.innerWidth - rect.right);
            const panel = panelRef.current;
            let right = preferred;
            if (panel !== null) {
                // One-shot cover probe: shift left only if something would paint over
                // the panel's header at the preferred spot.
                const candidates = [preferred, preferred + 80, preferred + 180, preferred + 320, preferred + 480];
                for (const candidate of candidates) {
                    panel.style.right = `${candidate}px`;
                    const r = panel.getBoundingClientRect();
                    if (r.width === 0)
                        break;
                    const probeY = Math.min(r.top + 20, window.innerHeight - 1);
                    const topEl = document.elementFromPoint(r.left + Math.min(60, r.width / 2), probeY);
                    if (topEl === null || panel === topEl || panel.contains(topEl)) {
                        right = candidate;
                        break;
                    }
                    right = candidate;
                }
            }
            setPos((prev) => (prev.top === top && prev.right === right ? prev : { top, right }));
        };
        place();
        window.addEventListener('resize', place);
        return () => { window.removeEventListener('resize', place); };
    }, [badgeRef, panelRef, expanded]);
    return pos;
}
/** POST the halt route for one team. */
async function haltTeam(captainSessionId, teamId) {
    const response = await fetch(TEAMSX_HALT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
/** POST the pause route for one member (interrupt; attempt stays parked). */
async function pauseMember(captainSessionId, teamId, memberName) {
    const response = await fetch(TEAMSX_PAUSE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId, memberName }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
/** One member row of the roster. */
function MemberRow({ member, team, t, openMember, readOnly }) {
    const [pausing, setPausing] = useState(false);
    const [pauseError, setPauseError] = useState(undefined);
    const roleKey = (member.role?.trim().toLowerCase() ?? '');
    const RoleIcon = ROLE_ICONS[roleKey];
    const ActivityIcon = ACTIVITY_ICONS[member.activity];
    const stateKey = (member.activity === 'working' ? 'member.state.working'
        : member.activity === 'idle' ? 'member.state.idle'
            : 'member.state.unknown');
    const openable = member.id !== '';
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
    return (_jsxs("div", { className: css.memberRow, "data-activity": member.activity, children: [_jsx("span", { className: css.memberIcon, children: RoleIcon !== undefined
                    ? _jsx(RoleIcon, { size: 18, decorative: true })
                    : _jsx(TeamsXLogo, { size: 18, label: member.name }) }), _jsx("span", { className: css.memberName, title: member.name, children: openable ? (_jsx("button", { type: 'button', className: css.memberLink, onClick: () => { openMember(team.captainSessionId, member.id); }, title: t('member.openSession'), children: member.name })) : member.name }), _jsx("span", { className: css.memberMeta, children: pauseError ?? member.model }), _jsxs("span", { className: css.memberProgress, title: t('member.progress', { done: member.done, total: member.total }), children: [_jsx("span", { className: css.memberProgressBar, "aria-hidden": true, children: _jsx("span", { className: css.memberProgressFill, style: { width: `${member.progress}%` }, "data-active": member.progress > 0 && member.progress < 100 || undefined, "data-done": member.progress >= 100 || undefined }) }), t('member.progress', { done: member.done, total: member.total })] }), member.unread > 0 && (_jsx("span", { className: css.memberUnread, title: t('member.unread', { count: member.unread }), children: member.unread })), _jsxs("span", { className: css.memberState, children: [ActivityIcon !== undefined && _jsx(ActivityIcon, { size: 14, className: member.activity === 'working' ? css.animPulse
                            : member.activity === 'idle' ? css.animThink
                                : undefined, decorative: true }), t(stateKey), !readOnly && member.activity === 'working' && (_jsx("button", { type: 'button', className: css.memberPause, onClick: () => { void pause(); }, disabled: pausing, "aria-label": t('member.pause'), title: t('member.pause'), children: pausing ? '…' : '⏸' }))] })] }));
}
/** One task row of the DAG list, with depth strip, dependency tags, and status colors. */
function TaskRow({ task, t }) {
    const StateIcon = VISUAL_STATE_ICONS[task.state];
    const statusKey = `task.status.${task.status}`;
    const visualKey = `task.visual.${task.state}`;
    const assignee = task.assignee === '' ? t('task.assignee.shared')
        : task.assignee === 'captain' ? t('task.assignee.captain')
            : task.assignee;
    return (_jsxs("div", { className: css.taskRow, "data-state": task.state, "data-depth": task.depth, children: [task.depth > 0 && (_jsx("span", { className: css.taskLane, "aria-hidden": true, children: Array.from({ length: Math.min(task.depth, 4) }, (_, i) => (_jsx("span", { className: css.taskLaneSegment, "data-depth": i }, i))) })), _jsx("span", { className: css.taskIcon, children: StateIcon !== undefined && _jsx(StateIcon, { size: 14, className: task.state === 'running' ? css.animPulse : undefined, decorative: true }) }), _jsx("span", { className: css.taskId, children: task.id }), _jsxs("span", { className: css.taskSubject, title: task.description || task.subject, children: [task.subject, task.dependencies.length > 0 && (_jsx("span", { className: css.taskDepList, children: task.dependencies.map((dep) => (_jsx("span", { className: css.taskDepTag, children: dep }, dep))) }))] }), _jsx("span", { className: css.taskAssignee, children: assignee }), _jsx("span", { className: css.taskStatus, title: t(visualKey), children: t(statusKey) })] }));
}
/** POST one staged-plan review action. */
async function planAction(captainSessionId, teamId, action) {
    const response = await fetch(TEAMSX_PLAN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId, action }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
/** The staged-plan review bar: approve, return-to-chat, and discard (2-step). */
function PlanReviewBar({ team, t }) {
    const [busy, setBusy] = useState(undefined);
    const [discardArmed, setDiscardArmed] = useState(false);
    const [error, setError] = useState(undefined);
    const runnable = team.members.length > 0 && team.tasks.length > 0;
    const run = async (action) => {
        setBusy(action);
        setError(undefined);
        try {
            await planAction(team.captainSessionId, team.teamId, action);
            // No local state flip: the next poll reflects disk truth (phase flips to
            // running, or the team disappears into the archive) and unmounts us.
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setBusy(undefined);
        }
    };
    return (_jsxs("div", { className: css.planBar, role: 'group', "aria-label": t('plan.needsReview'), children: [_jsx("p", { className: css.planBarText, children: t('plan.needsReview') }), error !== undefined && _jsx("p", { className: css.planError, children: error }), _jsxs("div", { className: css.planActions, children: [_jsx("button", { type: 'button', className: css.planApprove, disabled: busy !== undefined || !runnable, title: runnable ? undefined : t('plan.notRunnable'), onClick: () => { void run('approve'); }, children: busy === 'approve' ? '…' : t('plan.approve') }), _jsx("button", { type: 'button', className: css.planChat, disabled: busy !== undefined, onClick: () => { void run('continue'); }, children: busy === 'continue' ? '…' : t('plan.returnToChat') }), discardArmed ? (_jsxs(_Fragment, { children: [_jsx("button", { type: 'button', className: css.planCancel, onClick: () => { setDiscardArmed(false); }, disabled: busy !== undefined, children: t('team.stopCancel') }), _jsx("button", { type: 'button', className: css.planDiscard, onClick: () => { void run('discard'); }, disabled: busy !== undefined, children: busy === 'discard' ? '…' : t('plan.discardConfirm') })] })) : (_jsx("button", { type: 'button', className: css.planDiscardArm, onClick: () => { setDiscardArmed(true); }, disabled: busy !== undefined, children: t('plan.discard') }))] })] }));
}
/** One team card: header, roster, DAG, inbox preview, and stop control. */
function TeamCard({ team, t, openMember, readOnly }) {
    const [confirming, setConfirming] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [stopError, setStopError] = useState(undefined);
    const done = team.tasks.filter((task) => task.status === 'completed').length;
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
    return (_jsxs("section", { className: css.teamCard, "data-phase": team.phase, "data-halted": team.halted === true || undefined, children: [team.phase === 'staged' && !readOnly && _jsx(PlanReviewBar, { team: team, t: t }), _jsxs("header", { className: css.teamHeader, children: [_jsx(TeamsXLogo, { size: 20, className: css.teamLogo, decorative: true }), _jsxs("div", { className: css.teamTitleBlock, children: [_jsx("h3", { className: css.teamName, children: team.name }), team.description !== undefined && _jsx("p", { className: css.teamGoal, children: team.description })] }), _jsxs("div", { className: css.teamBadges, children: [_jsx("span", { className: css.badge, children: t(team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running') }), team.planReviewState !== undefined && (_jsx("span", { className: css.badgeMuted, children: t(`team.planReview.${team.planReviewState}`) })), team.halted === true && _jsx("span", { className: css.badgeWarn, children: t('team.halted') }), _jsx("span", { className: css.badgeMuted, children: t('team.members', { count: team.members.length }) }), _jsx("span", { className: css.badgeMuted, children: t('team.done', { done, total: team.tasks.length }) })] }), !readOnly && team.phase === 'running' && team.halted !== true && !confirming && (_jsx("button", { type: 'button', className: css.stopButton, onClick: () => { setConfirming(true); }, children: t('team.stop') }))] }), confirming && (_jsxs("div", { className: css.stopConfirmBox, role: 'alertdialog', "aria-label": t('team.stopTitle', { team: team.name }), children: [_jsx("p", { children: t('team.stopDescription', { tasks: team.tasks.filter((task) => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress').length, members: team.members.filter((member) => member.activity === 'working').length }) }), stopError !== undefined && _jsx("p", { className: css.stopError, children: t('team.stopFailed', { message: stopError }) }), _jsxs("div", { className: css.stopActions, children: [_jsx("button", { type: 'button', className: css.stopCancel, onClick: () => { setConfirming(false); }, disabled: stopping, children: t('team.stopCancel') }), _jsx("button", { type: 'button', className: css.stopConfirm, onClick: () => { void stop(); }, disabled: stopping, children: stopping ? t('team.stopping') : t('team.stopConfirm') })] })] })), _jsx("div", { className: css.roster, children: team.members.map((member) => _jsx(MemberRow, { member: member, team: team, t: t, openMember: openMember }, member.id !== '' ? member.id : member.name)) }), _jsx("div", { className: css.dag, children: team.tasks.map((task) => _jsx(TaskRow, { task: task, t: t }, task.id)) }), _jsxs("footer", { className: css.inbox, children: [_jsx("h4", { className: css.inboxTitle, children: t('inbox.title') }), team.captainInbox.length === 0
                        ? _jsx("p", { className: css.inboxEmpty, children: t('inbox.empty') })
                        : (_jsx("ul", { className: css.inboxList, children: team.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxItem, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxContent, children: message.content })] }, `${message.from}-${index}`))) }))] })] }));
}
/**
 * The session-scoped shell: a header chip that exists only when THIS session
 * owns or participates in a live team; the expanded panel portals to body.
 */
export function ActivityPanel({ sessionId, t, openMember }) {
    const translate = useMemo(() => makeT(t), [t]);
    const [expanded, setExpanded] = useState(false);
    const [viewMode, setViewMode] = useState('live');
    const [hasArchived, setHasArchived] = useState(false);
    const badgeRef = useRef(null);
    const panelRef = useRef(null);
    const isNarrow = useIsNarrow();
    const { teams, error, loading, reload } = useTeamData(expanded, viewMode);
    // One-shot: if archived teams exist for this session, show the badge
    // even when no live teams exist — the user can browse archive history.
    useEffect(() => {
        if (hasArchived)
            return;
        void fetchTeams('archive').then((data) => {
            const matches = data.some((team) => (team.captainSessionId === sessionId
                || team.members.some((member) => member.id === sessionId)));
            if (matches)
                setHasArchived(true);
        }).catch(() => { });
    }, [sessionId, hasArchived]);
    // Session scoping: only teams led (or joined as a member) by the session
    // whose header hosts this badge are visible here. Other sessions' teams,
    // and sessions that never used TeamsX, render nothing.
    const sessionTeams = useMemo(() => teams.filter((team) => (team.captainSessionId === sessionId
        || team.members.some((member) => member.id === sessionId))), [teams, sessionId]);
    const workingCount = sessionTeams.reduce((count, team) => (count + team.members.filter((member) => member.activity === 'working').length), 0);
    const placement = usePanelPlacement(badgeRef, panelRef, expanded && !isNarrow);
    // Drop the panel on any pointer outside badge + panel, matching the
    // subagent-count dropdown's dismiss behavior.
    useEffect(() => {
        if (!expanded)
            return;
        const onPointerDown = (event) => {
            const target = event.target;
            if (target === null)
                return;
            if (panelRef.current?.contains(target) === true)
                return;
            if (badgeRef.current?.contains(target) === true)
                return;
            setExpanded(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => { document.removeEventListener('pointerdown', onPointerDown); };
    }, [expanded]);
    // No teams in this session and no archived history: render nothing — the
    // header shows no TeamsX control at all. If archived teams exist, show the
    // badge so the user can browse history.
    if (sessionTeams.length === 0 && !hasArchived && error === undefined)
        return null;
    // The badge STAYS mounted while expanded (it is the anchor the panel
    // positions under, and the outside-click toggle target); the expanded
    // panel portals to document.body as a dropdown beneath it.
    const badge = (_jsxs("button", { type: 'button', ref: badgeRef, className: css.badgeFab, "data-expanded": expanded === true || undefined, onClick: () => { setExpanded((value) => !value); }, "aria-label": translate('panel.aria'), "aria-expanded": expanded === true || undefined, title: translate('panel.title'), children: [_jsx(TeamsXLogo, { size: 14, decorative: true }), _jsx("span", { className: css.badgeFabCount, children: sessionTeams.length }), workingCount > 0 && _jsx("span", { className: css.badgeFabBusy, "data-busy": true, children: workingCount })] }));
    if (!expanded)
        return badge;
    return (_jsxs(_Fragment, { children: [badge, createPortal(_jsxs("div", { className: isNarrow ? css.panelSheet : css.panelWindow, ref: panelRef, style: isNarrow ? undefined : {
                    top: `${placement.top}px`,
                    right: `${placement.right}px`,
                }, role: 'region', "aria-label": translate('panel.aria'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsxs("h2", { className: css.panelTitle, children: [_jsx(TeamsXLogo, { size: 18, decorative: true }), " ", translate('panel.title')] }), _jsxs("div", { className: css.panelActions, children: [_jsxs("div", { className: css.modeToggle, role: 'radiogroup', "aria-label": translate('panel.live'), children: [_jsx("button", { type: 'button', className: `${css.modeOption} ${viewMode === 'live' ? css.modeActive : ''}`, onClick: () => { setViewMode('live'); }, "aria-pressed": viewMode === 'live', children: translate('panel.live') }), _jsx("button", { type: 'button', className: `${css.modeOption} ${viewMode === 'archive' ? css.modeActive : ''}`, onClick: () => { setViewMode('archive'); }, "aria-pressed": viewMode === 'archive', children: translate('panel.archived') })] }), _jsx("button", { type: 'button', className: css.refreshButton, onClick: reload, "data-loading": loading === true || undefined, "aria-label": translate('panel.refresh'), title: translate('panel.refresh'), children: _jsx("span", { className: loading === true ? css.animSpin : undefined, children: "\u27F3" }) }), _jsx("button", { type: 'button', className: css.refreshButton, onClick: () => { setExpanded(false); }, "aria-label": translate('panel.close'), title: translate('panel.close'), children: "\u2715" })] })] }), error !== undefined && _jsx("p", { className: css.panelError, children: translate('panel.error', { message: error }) }), error === undefined && sessionTeams.length === 0 && (_jsxs("div", { className: css.emptyState, children: [_jsx(TeamsXLogo, { size: 48, className: css.emptyLogo }), _jsx("p", { className: css.panelEmpty, children: translate('panel.empty') })] })), _jsx("div", { className: css.teamList, children: sessionTeams.map((team) => _jsx(TeamCard, { team: team, t: translate, openMember: openMember, readOnly: viewMode === 'archive' }, `${team.workspace}/${team.teamId}`)) })] }), document.body)] }));
}
