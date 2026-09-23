import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { TeamsXLogo } from "./icons.js";
import css from './TeamsXCard.module.css';
/** Task rows rendered before the "+N more" digest line. */
const MAX_TASK_ROWS = 8;
function phaseKey(phase) {
    return phase === 'running' ? 'team.phase.running' : phase === 'deleted' ? 'card.phase.deleted' : 'team.phase.staged';
}
function CardMemberRow({ member, captainSessionId, openMember, t }) {
    const openable = member.status === 'active' && member.childId !== undefined;
    const content = (_jsxs(_Fragment, { children: [_jsx("span", { className: css.cardDot, "data-state": member.status, "aria-hidden": true }), _jsx("span", { className: css.cardMemberName, children: member.name }), member.role !== undefined && _jsx("span", { className: css.cardMemberRole, children: member.role }), member.status === 'removed' && _jsx("span", { className: css.cardMemberState, children: t('member.state.removed') })] }));
    if (!openable || member.childId === undefined) {
        return _jsx("span", { className: css.cardMember, "data-status": member.status, children: content });
    }
    const childId = member.childId;
    return (_jsx("button", { type: 'button', className: css.cardMember, "data-status": member.status, onClick: () => { openMember(captainSessionId, childId); }, title: t('member.openSession'), children: content }));
}
/** The team card body. Renders nothing for an unnamed state. */
export function TeamsXCardPanel({ node, t, openMember }) {
    const data = node.data;
    if (typeof data?.name !== 'string' || data.name === '')
        return _jsx(_Fragment, {});
    const done = data.tasks.filter((task) => task.status === 'completed').length;
    const visible = data.tasks.slice(0, MAX_TASK_ROWS);
    const hidden = data.tasks.length - visible.length;
    const activeMembers = data.members.filter((member) => member.status === 'active').length;
    return (_jsxs("div", { className: css.card, "data-phase": data.phase, "data-halted": data.halted === true || undefined, children: [_jsxs("header", { className: css.cardHeader, children: [_jsx(TeamsXLogo, { size: 16, decorative: true }), _jsx("span", { className: css.cardName, title: data.name, children: data.name }), _jsx("span", { className: css.cardBadge, "data-phase": data.phase, children: t(phaseKey(data.phase)) }), data.halted === true && _jsx("span", { className: css.cardHalted, children: t('team.halted') }), _jsxs("span", { className: css.cardCounts, children: [t('editor.members'), " ", activeMembers, " \u00B7 ", t('team.done', { done, total: data.tasks.length })] })] }), data.members.length > 0 && (_jsx("div", { className: css.cardRoster, children: data.members.map((member) => (_jsx(CardMemberRow, { member: member, captainSessionId: data.captainSessionId, openMember: openMember, t: t }, member.name))) })), visible.length > 0 && (_jsxs("div", { className: css.cardTasks, children: [visible.map((task) => (_jsxs("div", { className: css.cardTask, "data-status": task.status, children: [_jsx("span", { className: css.cardTaskId, children: task.id }), _jsx("span", { className: css.cardTaskSubject, title: task.subject, children: task.subject }), _jsx("span", { className: css.cardTaskStatus, children: t(`task.status.${task.status}`) })] }, task.id))), hidden > 0 && _jsx("span", { className: css.cardMore, children: t('card.more', { count: hidden }) })] }))] }));
}
