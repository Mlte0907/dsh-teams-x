/**
 * Open one member's persisted transcript. Harness removed cold subagents
 * from the ordinary session list: they must first be rediscovered in their
 * parent's catalog, then opened with the exact parent/child/mode address.
 */
export async function openTeamsXMember(sessions, parentSessionId, childSessionId) {
    if (sessions.openSubagent === undefined || sessions.refreshSubagents === undefined) {
        sessions.open(childSessionId);
        return 'session';
    }
    await sessions.refreshSubagents(parentSessionId);
    const retained = sessions.subagentAddress?.(childSessionId);
    sessions.openSubagent(retained?.parentSessionId === parentSessionId
        ? retained
        : { parentSessionId, childSessionId, mode: 'continuable' });
    return 'subagent';
}
