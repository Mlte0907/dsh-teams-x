import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TeamsX activity panel: live roster, task DAG, and captain inbox preview.
 *
 * Lean by design — the reference panel is 57 KB of layout machinery; this
 * panel covers the same information with a third of the code: a poller, one
 * team card renderer (with the all-SVG icon system), and a stop control.
 * All state lives in one hook; icons come from icons.tsx.
 * @module dsh-teams-x/client/ActivityPanel
 */
import { useEffect, useMemo, useState } from 'react';
import css from './ActivityPanel.module.css';
import { ACTIVITY_ICONS, ROLE_ICONS, VISUAL_STATE_ICONS, TeamsXLogo, } from "./icons.js";
/** Panel data endpoint served by the host plane. */
export const TEAMSX_STATE_URL = '/plugins/dsh-teams-x/state';
/** Halt endpoint served by the host plane. */
export const TEAMSX_HALT_URL = '/plugins/dsh-teams-x/halt';
/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000;
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
/** Poll the state endpoint on an interval while mounted. */
function useTeamSnapshots() {
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState(undefined);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        let disposed = false;
        const load = async () => {
            try {
                const response = await fetch(TEAMSX_STATE_URL, { headers: { accept: 'application/json' } });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                const body = await response.json();
                if (!disposed) {
                    setTeams(body.teams);
                    setError(undefined);
                }
            }
            catch (cause) {
                if (!disposed)
                    setError(cause instanceof Error ? cause.message : String(cause));
            }
        };
        void load();
        const timer = window.setInterval(() => { void load(); }, POLL_INTERVAL_MS);
        return () => {
            disposed = true;
            window.clearInterval(timer);
        };
    }, [tick]);
    return { teams, error, reload: () => setTick((value) => value + 1) };
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
/** One member row of the roster. */
function MemberRow({ member, t }) {
    const roleKey = (member.role?.trim().toLowerCase() ?? '');
    const RoleIcon = ROLE_ICONS[roleKey];
    const ActivityIcon = ACTIVITY_ICONS[member.activity];
    const stateKey = (member.activity === 'working' ? 'member.state.working'
        : member.activity === 'idle' ? 'member.state.idle'
            : 'member.state.unknown');
    return (_jsxs("div", { className: css.memberRow, "data-activity": member.activity, children: [_jsx("span", { className: css.memberIcon, children: RoleIcon !== undefined
                    ? _jsx(RoleIcon, { size: 18 })
                    : _jsx(TeamsXLogo, { size: 18, label: member.name }) }), _jsx("span", { className: css.memberName, title: member.name, children: member.name }), _jsx("span", { className: css.memberMeta, children: member.model }), _jsx("span", { className: css.memberProgress, children: t('member.progress', { done: member.done, total: member.total }) }), member.unread > 0 && (_jsx("span", { className: css.memberUnread, title: t('member.unread', { count: member.unread }), children: member.unread })), _jsxs("span", { className: css.memberState, children: [ActivityIcon !== undefined && _jsx(ActivityIcon, { size: 14, className: member.activity === 'working' ? css.animPulse : undefined }), t(stateKey)] })] }));
}
/** One task row of the DAG list, indented by dependency depth. */
function TaskRow({ task, t }) {
    const StateIcon = VISUAL_STATE_ICONS[task.state];
    const statusKey = `task.status.${task.status}`;
    const visualKey = `task.visual.${task.state}`;
    const assignee = task.assignee === '' ? t('task.assignee.shared')
        : task.assignee === 'captain' ? t('task.assignee.captain')
            : task.assignee;
    return (_jsxs("div", { className: css.taskRow, "data-state": task.state, style: { marginInlineStart: `${Math.min(task.depth, 4) * 18}px` }, children: [_jsx("span", { className: css.taskIcon, children: StateIcon !== undefined && _jsx(StateIcon, { size: 14, className: task.state === 'running' ? css.animPulse : undefined }) }), _jsx("span", { className: css.taskId, children: task.id }), _jsx("span", { className: css.taskSubject, title: task.description || task.subject, children: task.subject }), _jsx("span", { className: css.taskAssignee, children: assignee }), _jsx("span", { className: css.taskStatus, title: t(visualKey), children: t(statusKey) })] }));
}
/** One team card: header, roster, DAG, inbox preview, and stop control. */
function TeamCard({ team, t }) {
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
    return (_jsxs("section", { className: css.teamCard, "data-phase": team.phase, "data-halted": team.halted === true || undefined, children: [_jsxs("header", { className: css.teamHeader, children: [_jsx(TeamsXLogo, { size: 20, className: css.teamLogo }), _jsxs("div", { className: css.teamTitleBlock, children: [_jsx("h3", { className: css.teamName, children: team.name }), team.description !== undefined && _jsx("p", { className: css.teamGoal, children: team.description })] }), _jsxs("div", { className: css.teamBadges, children: [_jsx("span", { className: css.badge, children: t(team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running') }), team.planReviewState !== undefined && (_jsx("span", { className: css.badgeMuted, children: t(`team.planReview.${team.planReviewState}`) })), team.halted === true && _jsx("span", { className: css.badgeWarn, children: t('team.halted') }), _jsx("span", { className: css.badgeMuted, children: t('team.members', { count: team.members.length }) }), _jsx("span", { className: css.badgeMuted, children: t('team.done', { done, total: team.tasks.length }) })] }), team.phase === 'running' && team.halted !== true && !confirming && (_jsx("button", { type: 'button', className: css.stopButton, onClick: () => { setConfirming(true); }, children: t('team.stop') }))] }), confirming && (_jsxs("div", { className: css.stopConfirmBox, role: 'alertdialog', "aria-label": t('team.stopTitle', { team: team.name }), children: [_jsx("p", { children: t('team.stopDescription', { tasks: team.tasks.filter((task) => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress').length, members: team.members.filter((member) => member.activity === 'working').length }) }), stopError !== undefined && _jsx("p", { className: css.stopError, children: t('team.stopFailed', { message: stopError }) }), _jsxs("div", { className: css.stopActions, children: [_jsx("button", { type: 'button', className: css.stopCancel, onClick: () => { setConfirming(false); }, disabled: stopping, children: t('team.stopCancel') }), _jsx("button", { type: 'button', className: css.stopConfirm, onClick: () => { void stop(); }, disabled: stopping, children: stopping ? t('team.stopping') : t('team.stopConfirm') })] })] })), _jsx("div", { className: css.roster, children: team.members.map((member) => _jsx(MemberRow, { member: member, t: t }, member.id !== '' ? member.id : member.name)) }), _jsx("div", { className: css.dag, children: team.tasks.map((task) => _jsx(TaskRow, { task: task, t: t }, task.id)) }), _jsxs("footer", { className: css.inbox, children: [_jsx("h4", { className: css.inboxTitle, children: t('inbox.title') }), team.captainInbox.length === 0
                        ? _jsx("p", { className: css.inboxEmpty, children: t('inbox.empty') })
                        : (_jsx("ul", { className: css.inboxList, children: team.captainInbox.map((message, index) => (_jsxs("li", { className: css.inboxItem, children: [_jsx("span", { className: css.inboxFrom, children: message.from }), _jsx("span", { className: css.inboxContent, children: message.content })] }, `${message.from}-${index}`))) }))] })] }));
}
/** The panel shell: poll state, list team cards. */
export function ActivityPanel({ t }) {
    const translate = useMemo(() => makeT(t), [t]);
    const { teams, error, reload } = useTeamSnapshots();
    return (_jsxs("div", { className: css.panel, role: 'region', "aria-label": translate('panel.aria'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsxs("h2", { className: css.panelTitle, children: [_jsx(TeamsXLogo, { size: 18 }), " ", translate('panel.title')] }), _jsx("button", { type: 'button', className: css.refreshButton, onClick: reload, "aria-label": translate('panel.refresh'), children: _jsx("span", { className: css.animSpin, children: "\u27F3" }) })] }), error !== undefined && _jsx("p", { className: css.panelError, children: translate('panel.error', { message: error }) }), error === undefined && teams.length === 0 && (_jsx("p", { className: css.panelEmpty, children: translate('panel.empty') })), _jsx("div", { className: css.teamList, children: teams.map((team) => _jsx(TeamCard, { team: team, t: translate }, `${team.workspace}/${team.teamId}`)) })] }));
}
