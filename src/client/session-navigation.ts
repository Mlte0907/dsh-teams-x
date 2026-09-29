/**
 * Member-transcript navigation.
 *
 * Navigation belongs to the view owner: the client `sessions` service opens
 * nothing (`ISessions` carries catalog and reference counts only), so the
 * workspace service performs the selection. The durable subagent address is
 * still read from the client runtime when it retained one, and otherwise
 * constructed from the captain/child pair.
 */
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { SubagentAddress } from '@deepseek-ai/dsh-subagent/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** The one sessions-service member this still reads. */
export interface TeamsXSessionAddressReader {
  /** Reuse an address already retained by the client runtime when available. */
  subagentAddress?(id: SessionId): SubagentAddress | undefined
}

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
export function openTeamsXMember(
  uiWorkspace: Pick<UiWorkspace, 'openSession'>,
  sessions: TeamsXSessionAddressReader,
  parentSessionId: SessionId,
  childSessionId: SessionId,
): 'subagent' {
  const retained = sessions.subagentAddress?.(childSessionId)
  const address: SubagentAddress = retained?.parentSessionId === parentSessionId
    ? retained
    : { parentSessionId, childSessionId, mode: 'continuable' }
  uiWorkspace.openSession(address)
  return 'subagent'
}
