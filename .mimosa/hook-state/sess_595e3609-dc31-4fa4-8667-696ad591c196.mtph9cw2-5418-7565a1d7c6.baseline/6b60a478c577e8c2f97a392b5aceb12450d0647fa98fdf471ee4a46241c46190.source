/**
 * Host-API compatibility layer — the single file that absorbs DeepSeek
 * Harness version drift.
 *
 * Strategy (mirrors the user-maintained `dsh-compat-shim` philosophy, in the
 * opposite direction): the plugin natively targets the running host
 * (0.1.3-alpha.1 source checkout), and every API touchpoint that has moved
 * between releases is resolved here by capability detection — prefer the
 * newest surface, degrade gracefully on older hosts. A future host upgrade
 * only ever edits this file.
 *
 * Known drift points (verified against the checkout):
 * - `ctx.subagents.followup(parent, childId, content, opts)` (alpha.2) was
 *   replaced by `ctx.subagents.sendMessage(sender, targetId, content, opts)`
 *   (alpha.3, packages/subagent/subagent/src/index.ts:276).
 * - `session.events` accessor (alpha.2) became `session.ownEvents()` /
 *   `session.snapshotEvents()` (alpha.3, packages/core/session/src/index.ts).
 * - `ctx.subagents.drainContinuableChildren` is optional on older hosts.
 * - The web server and workspace registry service keys have historical
 *   aliases (`webServer`/`httpServer`, `workspaceRegistry`/`workspace`).
 * @module dsh-teams-x/compat
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Session, SessionEvent, SessionId } from '@deepseek-ai/dsh-session';
import type { ContentBlock } from '@deepseek-ai/dsh-llm';
/** Web-server service key candidates, newest first. */
export declare const WEB_SERVER_KEYS: readonly ["webServer", "httpServer"];
/** Workspace registry service key candidates, newest first. */
export declare const WORKSPACE_KEYS: readonly ["workspaceRegistry", "workspace"];
/** Options accepted by both the old `followup` and new `sendMessage` paths. */
export interface DeliveryOptions {
    readonly signal: AbortSignal;
}
/**
 * Deliver a host-authored message to a direct continuable child through the
 * live parent. Prefers alpha.3's `sendMessage` (sender attribution derived
 * from the exact live agent); falls back to alpha.2's `followup`.
 * @returns `true` when the child's inbox accepted the message.
 */
export declare function deliverToChild(ctx: Context, captain: Agent, childId: SessionId, content: ContentBlock[], options: DeliveryOptions): Promise<boolean>;
/**
 * Read a child's own (non-inherited) session events across accessors:
 * `ownEvents()` (alpha.3) or `events.slice(seedLength)` (alpha.2).
 */
export declare function sessionOwnEvents(session: Session): readonly SessionEvent[];
/**
 * Release every selected child activation after an interrupt. Prefers the
 * alpha.3+ `drainContinuableChildren`; returns `'unavailable'` on hosts
 * where interrupt is the strongest lifecycle operation.
 */
export declare function drainChildren(ctx: Context, captain: Agent, childIds: readonly SessionId[]): Promise<'drained' | 'unavailable'>;
