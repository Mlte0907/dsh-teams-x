/**
 * Member subagent lifecycle: spawn a continuable child per member, deliver
 * messages into its FIFO inbox, and observe its activity.
 *
 * Members are durable continuable subagents of the captain, so a member keeps
 * its conversation across turns and across harness restarts: the captain
 * wakes it, it works through its turn (updating team state through the
 * `teamsx_*` tools), and becomes idle again. Its final assistant message is
 * not readable programmatically, so the member persists its report into the
 * captain's mailbox and the task records, which the captain reads through
 * `teamsx_status`.
 * @module dsh-teams-x/members
 */
import type { Context } from '@deepseek-ai/cordis';
import { type Agent } from '@deepseek-ai/dsh-agent';
import type { TeamMember, TeamState } from './types.ts';
/** Label prefix distinguishing TeamsX continuable children from other subagents. */
export declare const MEMBER_LABEL_PREFIX = "teamsx:";
/** Persona protocol excerpt cap. */
export declare const PERSONA_PROTOCOL_MAX_CHARS = 400;
/** Runtime knobs for member spawning, resolved from plugin config. */
export interface MemberRuntimeConfig {
    /** Registered `ctx.subagents` provider name (must support continuable + persona). */
    provider: string;
    /** Child delegation depth cap (0 forbids delegation entirely). */
    maxDepth?: number;
    /** Plugin-wide execution prompt. */
    executionPrompt?: string;
    /** Plugin-wide fallback route. */
    fallback?: {
        provider: string;
        model: string;
    };
}
/** Durable provider/model/reasoning snapshot for one member. */
export interface MemberLlmSelection {
    provider: string;
    model: string;
    reasoningEffort?: string;
    fallback?: {
        provider: string;
        model: string;
    };
}
/** Optional member-level route requested by the captain. */
export interface MemberLlmSelectionRequest {
    provider?: string;
    model?: string;
    /** Plugin-level member model default. */
    defaultModel?: string;
    /** Explicit reasoning effort; "default" selects the target model's default effort. */
    reasoningEffort?: string;
    fallback?: {
        provider: string;
        model: string;
    };
}
/** Process-local bridge between spawn admission and synchronous child setup. */
export interface MemberSelectionRuntime {
    /** Make one selection visible while Harness materializes the fresh child. */
    withPending<T>(parentSessionId: string, label: string, selection: MemberLlmSelection, operation: () => Promise<T>): Promise<T>;
}
export declare function isFallbackFailureCode(code: string): boolean;
/** Pure state transition used by the request-error handler. */
export declare function selectFallbackRoute(current: {
    provider: string;
    model: string;
}, fallback: {
    provider: string;
    model: string;
} | undefined, failureCode: string, alreadySwitched: boolean): {
    retry: boolean;
    switched: boolean;
    selection: {
        provider: string;
        model: string;
    };
};
/**
 * Validate a resolved roster against every provider catalog before any child
 * session is created. Catalogs are advisory when empty (some adapters accept
 * dynamic model ids), but a non-empty catalog is authoritative enough to
 * catch a typo that would otherwise boot a child and fail on its first turn.
 */
export declare function validateMemberLlmSelections(ctx: Context, selections: readonly MemberLlmSelection[], signal?: AbortSignal): Promise<void>;
/** Deliver a durable member report to the live captain at its next model step. */
export declare function steerCaptainReport(captain: Pick<Agent, 'steer'>, from: string, content: string): boolean;
/**
 * Resolve one member's complete model selection. Ordinary members snapshot
 * the captain's current request route and reasoning effort. When provider or
 * model changes, effort is intentionally omitted so the target model
 * materializes its own default instead of receiving an adapter-owned id from
 * another route. An explicit effort overrides either policy; the sentinel
 * "default" also selects the target model's default.
 */
export declare function resolveMemberLlmSelection(ctx: Context, captain: Agent, request: MemberLlmSelectionRequest, signal?: AbortSignal): Promise<MemberLlmSelection>;
/**
 * Install the member selection bridge for every fresh or cold-resumed
 * continuable child. Fresh creation reads the pending in-memory selection;
 * cold resume restores the same selection from the owning team's durable
 * record. Members without a complete saved route still get failure reporting.
 */
export declare function installMemberSelectionRuntime(ctx: Context, stateDir: string, onFailureSettled?: (workspace: string, teamId: string, memberName: string) => Promise<void>): MemberSelectionRuntime;
/**
 * The member's system prompt (persona), shadowing the deployment persona for
 * that child. Self-contained: it replaces the whole persona section.
 *
 * User-provided free-text (goal, protocol, execution guidance) is fenced in
 * `<<<`/`>>>` blocks labelled as data, so a crafted team name cannot rewrite
 * the member's working rules.
 */
export declare function memberPersona(team: TeamState, member: TeamMember, stateDir: string, executionPrompt?: string): string;
/**
 * The initial user message delivered when the member is created.
 * Counts non-terminal tasks already assigned to this member on the draft.
 */
export declare function memberWelcome(team: TeamState, memberName: string): string;
/**
 * Spawn one member as a durable continuable subagent of the captain and fill
 * `member.id` with its child session id. On failure nothing is persisted.
 */
export declare function spawnMember(ctx: Context, config: MemberRuntimeConfig, selections: MemberSelectionRuntime, llmSelection: MemberLlmSelection, captain: Agent, team: TeamState, member: TeamMember, stateDir: string, signal: AbortSignal): Promise<void>;
/**
 * Deliver one message to a member as its next FIFO turn. Best effort: a
 * failure (member gone or not continuable) is logged and reported as `false`
 * so the caller can decide (mailbox delivery still happened).
 */
export declare function deliverToMember(ctx: Context, captain: Agent, childId: string, text: string, signal: AbortSignal): Promise<boolean>;
/**
 * Request cancellation of one live member's current turn. Best effort, fire
 * and return; the target may keep running until it observes the signal.
 */
export declare function interruptMember(ctx: Context, captain: Agent, childId: string): void;
/**
 * Install the missing per-child retirement boundary.
 *
 * Upstream `interrupt()` deliberately preserves continuable sessions and the
 * upstream seam exposes no targeted forget/retire method. The durable TeamsX
 * index therefore rejects delivery before it can cold-resume a retired
 * member. Catalog rows deliberately remain discoverable so an archived
 * member's persisted conversation stays accessible. The retired set is
 * cached in state.ts and invalidated on mutation, keeping this hot path free
 * of per-call disk reads.
 */
export declare function installRetiredMemberGuard(ctx: Context, stateDir: string): void;
/**
 * Snapshot the real driver activity for durable member ids.
 * @returns child id → live activity.
 */
export declare function memberActivity(ctx: Context, memberIds: readonly string[]): Map<string, 'running' | 'idle' | 'ready'>;
