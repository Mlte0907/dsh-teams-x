/**
 * Pure fold logic for the TeamsX conversation card.
 *
 * Zero imports — no React, no host packages, no CSS — so the host test
 * suite can exercise the exact same state machine the browser bundle runs
 * (full-functional-test.mjs imports the compiled output directly).
 * @module dsh-teams-x/client/card-state
 */
/** Every session event type the card folds. */
export const TEAMSX_CARD_EVENT_TYPES = [
    'teamsx/team-created', 'teamsx/team-approved', 'teamsx/team-halted',
    'teamsx/team-resumed', 'teamsx/team-deleted', 'teamsx/plan-discarded',
    'teamsx/member-added', 'teamsx/member-removed', 'teamsx/task-created',
    'teamsx/task-updated', 'teamsx/message-sent',
];
/** Read a string field off an unknown event payload. */
function stringField(data, key) {
    if (typeof data !== 'object' || data === null)
        return '';
    const value = data[key];
    return typeof value === 'string' ? value : '';
}
/**
 * Resolve the assembler match for one session event: only `team-created`
 * starts a card; every other TeamsX event updates the team it names.
 * Returns null for foreign events and malformed payloads.
 */
export function teamsXCardMatchRole(eventType, data) {
    if (!TEAMSX_CARD_EVENT_TYPES.includes(eventType))
        return null;
    const teamId = stringField(data, 'teamId');
    if (teamId === '')
        return null;
    return { id: teamId, role: eventType === 'teamsx/team-created' ? 'start' : 'update' };
}
/** Initial card state from the `team-created` payload. */
export function teamsXCardStart(data) {
    const phase = stringField(data, 'phase');
    return {
        name: stringField(data, 'name'),
        captainSessionId: stringField(data, 'captainSessionId'),
        phase: phase === 'running' ? 'running' : 'staged',
        halted: false,
        members: [],
        tasks: [],
    };
}
/**
 * Fold one update event into the card state. Never returns undefined —
 * the conversation assembler fails loud on `update() -> undefined`.
 */
export function teamsXCardUpdate(state, eventType, data) {
    switch (eventType) {
        case 'teamsx/team-approved':
            return { ...state, phase: 'running' };
        case 'teamsx/team-halted':
            return { ...state, halted: true };
        case 'teamsx/team-resumed':
            return { ...state, halted: false };
        case 'teamsx/team-deleted':
        case 'teamsx/plan-discarded':
            return { ...state, phase: 'deleted' };
        case 'teamsx/member-added': {
            const name = stringField(data, 'name');
            if (name === '')
                return state;
            // The member-added payload carries the child session id as `memberId`.
            const childId = stringField(data, 'memberId');
            const role = stringField(data, 'role') !== '' ? stringField(data, 'role') : undefined;
            const member = { name, status: 'active', ...(childId !== '' ? { childId } : {}), ...(role !== undefined ? { role } : {}) };
            return {
                ...state,
                members: [...state.members.filter((item) => item.name !== name), member],
            };
        }
        case 'teamsx/member-removed': {
            const memberId = stringField(data, 'memberId');
            const name = stringField(data, 'name');
            return {
                ...state,
                members: state.members.map((member) => (member.name === name || (memberId !== '' && member.childId === memberId)
                    ? { ...member, status: 'removed' }
                    : member)),
            };
        }
        case 'teamsx/task-created': {
            const taskId = stringField(data, 'taskId');
            if (taskId === '')
                return state;
            const assignee = stringField(data, 'assignee');
            const task = {
                id: taskId,
                subject: stringField(data, 'subject'),
                status: 'pending',
                ...(assignee !== '' ? { assignee } : {}),
            };
            return {
                ...state,
                tasks: [...state.tasks.filter((item) => item.id !== taskId), task],
            };
        }
        case 'teamsx/task-updated': {
            const taskId = stringField(data, 'taskId');
            const status = stringField(data, 'status');
            const assignee = stringField(data, 'assignee');
            const round = typeof data?.round === 'number'
                ? data.round
                : undefined;
            const takenOverBy = stringField(data, 'takenOverBy') === 'captain' ? 'captain' : undefined;
            return {
                ...state,
                tasks: state.tasks.map((task) => task.id === taskId
                    ? {
                        ...task,
                        ...(status !== '' ? { status } : {}),
                        ...(assignee !== '' ? { assignee } : {}),
                        ...(round !== undefined ? { round } : {}),
                        // 影子接管结束（takenOverBy 清空）时从卡片任务行同步移除标记
                        ...(data !== null && typeof data === 'object' && 'takenOverBy' in data
                            ? { takenOverBy }
                            : {}),
                    }
                    : task),
            };
        }
        default:
            // message-sent and anything unrecognized leave the card untouched.
            return state;
    }
}
