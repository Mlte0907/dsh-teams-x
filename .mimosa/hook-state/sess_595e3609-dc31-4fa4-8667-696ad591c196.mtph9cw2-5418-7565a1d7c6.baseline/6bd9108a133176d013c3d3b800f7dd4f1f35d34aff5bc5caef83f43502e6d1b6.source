/**
 * Version-tolerant navigation into durable TeamsX member transcripts.
 * Mirrors the reference implementation: rc.8+ runtimes discover the child in
 * its parent's catalog first, then open it with the exact parent/child/mode
 * address; older runtimes fall back to plain session navigation.
 */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SubagentAddress } from '@deepseek-ai/dsh-subagent/client';
/** Narrow sessions-service face used by the activity panel. */
export interface TeamsXSessionNavigator {
    /** Legacy/ordinary session navigation. */
    open(id: SessionId): void;
    /** Addressed subagent navigation. */
    openSubagent?(address: SubagentAddress): void;
    /** Refresh the exact parent's durable direct-child catalog. */
    refreshSubagents?(parentSessionId: SessionId): Promise<void>;
    /** Reuse an address already retained by the client runtime when available. */
    subagentAddress?(id: SessionId): SubagentAddress | undefined;
}
/**
 * Open one member's persisted transcript. Harness removed cold subagents
 * from the ordinary session list: they must first be rediscovered in their
 * parent's catalog, then opened with the exact parent/child/mode address.
 */
export declare function openTeamsXMember(sessions: TeamsXSessionNavigator, parentSessionId: SessionId, childSessionId: SessionId): Promise<'subagent' | 'session'>;
