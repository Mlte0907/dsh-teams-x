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
/** Web-server service key candidates, newest first. */
export const WEB_SERVER_KEYS = ['webServer', 'httpServer'];
/** Workspace registry service key candidates, newest first. */
export const WORKSPACE_KEYS = ['workspaceRegistry', 'workspace'];
/**
 * Deliver a host-authored message to a direct continuable child through the
 * live parent. Prefers alpha.3's `sendMessage` (sender attribution derived
 * from the exact live agent); falls back to alpha.2's `followup`.
 * @returns `true` when the child's inbox accepted the message.
 */
export async function deliverToChild(ctx, captain, childId, content, options) {
    const runtime = ctx.subagents;
    try {
        if (typeof runtime.sendMessage === 'function') {
            await runtime.sendMessage(captain, childId, content, { signal: options.signal });
            return true;
        }
        if (typeof runtime.followup === 'function') {
            await runtime.followup(captain, childId, content, {
                signal: options.signal,
                source: { kind: 'plugin', plugin: 'dsh-teams-x' },
            });
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Read a child's own (non-inherited) session events across accessors:
 * `ownEvents()` (alpha.3) or `events.slice(seedLength)` (alpha.2).
 */
export function sessionOwnEvents(session) {
    const own = session;
    if (typeof own.ownEvents === 'function')
        return own.ownEvents();
    // alpha.2 headers carried `seedLength`; the property is absent from the
    // alpha.3 header type, so the legacy path probes it structurally.
    const legacyHeader = session.header;
    const seedLength = legacyHeader.seedLength ?? 0;
    return own.events?.slice(seedLength) ?? [];
}
/**
 * Release every selected child activation after an interrupt. Prefers the
 * alpha.3+ `drainContinuableChildren`; returns `'unavailable'` on hosts
 * where interrupt is the strongest lifecycle operation.
 */
export async function drainChildren(ctx, captain, childIds) {
    const runtime = ctx.subagents;
    if (typeof runtime.drainContinuableChildren !== 'function')
        return 'unavailable';
    await runtime.drainContinuableChildren(captain, childIds);
    return 'drained';
}
