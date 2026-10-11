/**
 * Host-API compatibility layer — the single file that absorbs DeepSeek
 * Harness version drift.
 *
 * Strategy (mirrors the user-maintained `dsh-compat-shim` philosophy, in the
 * opposite direction): the plugin natively targets the running host
 * (0.2.1-alpha.2), and every API touchpoint that has moved between releases is
 * resolved here by capability detection — prefer the newest surface, degrade
 * gracefully on older hosts. A future host upgrade only ever edits this file.
 *
 * Known drift points (verified against the 0.2.1-alpha.2 desktop bundle):
 * - `ctx.subagents.followup(parent, childId, content, opts)` (0.2.0-alpha.2)
 *   was replaced by `ctx.subagents.sendMessage(sender, targetId, content,
 *   opts)`, which is the only face the 0.2.1-alpha.2 manager still exposes.
 * - `session.events` accessor became `session.ownEvents()` /
 *   `session.snapshotEvents()`. Both readers are now DEPRECATED on the host but
 *   still present, so the structural fallback stays as a safety net.
 * - `ctx.subagents.drainContinuableChildren` (0.2.0) became
 *   `ctx.subagents.drainChildren(parent, childIds)` on 0.2.1-alpha.2; the
 *   argument list is unchanged, so only the method name is probed.
 * - The web server and workspace registry service keys have historical
 *   aliases (`webServer`/`httpServer`, `workspaceRegistry`/`workspace`).
 * - Member creation does NOT live here: it calls `subagents.startActivation`
 *   directly from `members.js` because that call is already version-matched.
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
                // The fallback exists only for released V3 hosts, whose followup API
                // requires the retired plugin attribution wrapper.
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
 * 0.2.1-alpha.2 `drainChildren(parent, childIds)`; falls back to the retired
 * `drainContinuableChildren`, and returns `'unavailable'` on hosts where
 * interrupt is the strongest lifecycle operation.
 */
export async function drainChildren(ctx, captain, childIds) {
    const runtime = ctx.subagents;
    if (typeof runtime.drainChildren === 'function') {
        await runtime.drainChildren(captain, childIds);
        return 'drained';
    }
    if (typeof runtime.drainContinuableChildren !== 'function')
        return 'unavailable';
    await runtime.drainContinuableChildren(captain, childIds);
    return 'drained';
}
/**
 * Read one session's cumulative token-usage projection. Returns undefined
 * when the token-meter service is not mounted or the session is not attached
 * — cost display is best-effort by design.
 *
 * Session access: the host's `sessions` registry is the canonical attached
 * Session source (`sessions.get(id)`, the same face every host-side projection
 * consumer uses). The public `Agent` face carries only `id` — it has no
 * `.session` to reach, so the agents registry cannot answer here; an older
 * host that exposed it is tolerated as a fallback.
 *
 * Shape note: `stateOf` hands back the meter's internal fold state
 * (`{ totals, last }`); the flat buckets live under `totals` — that is what
 * the definition's wire view projects. A flat top-level shape is tolerated
 * so a host that exposes the wire view directly keeps working.
 */
export function readTokenUsage(ctx, sessionId) {
    try {
        const projections = ctx.sessionProjections;
        const sessions = ctx.sessions;
        const agents = ctx.agents;
        const session = sessions?.get?.(sessionId) ?? agents?.get?.(sessionId)?.session;
        if (projections?.stateOf === undefined || session === undefined)
            return undefined;
        const state = projections.stateOf(session, 'tokenUsage');
        const buckets = state?.totals ?? state;
        if (buckets === undefined || typeof buckets.outputTokens !== 'number')
            return undefined;
        return {
            inputTokens: buckets.uncachedInputTokens ?? 0,
            outputTokens: buckets.outputTokens,
            ...(typeof buckets.cacheReadTokens === 'number' && buckets.cacheReadTokens > 0 ? { cacheReadTokens: buckets.cacheReadTokens } : {}),
            ...(typeof buckets.cacheWriteTokens === 'number' && buckets.cacheWriteTokens > 0 ? { cacheWriteTokens: buckets.cacheWriteTokens } : {}),
        };
    }
    catch {
        return undefined;
    }
}
