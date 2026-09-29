/**
 * Open one member's persisted transcript.
 *
 * Cold subagents are absent from the ordinary session list, so the selection
 * carries the durable direct-parent address rather than a bare Session id;
 * that address is what the workspace service resolves to a conversation.
 * @param uiWorkspace - view owner performing the selection.
 * @param sessions - client runtime, read only for a retained address.
 * @param parentSessionId - captain session the member belongs to.
 * @param childSessionId - member session to display.
 * @returns `'subagent'` once the address has been handed to the workspace.
 */
export function openTeamsXMember(uiWorkspace, sessions, parentSessionId, childSessionId) {
    const retained = sessions.subagentAddress?.(childSessionId);
    const address = retained?.parentSessionId === parentSessionId
        ? retained
        : { parentSessionId, childSessionId, mode: 'continuable' };
    uiWorkspace.openSession(address);
    return 'subagent';
}
