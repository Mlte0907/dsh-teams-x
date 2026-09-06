/**
 * Durable TeamsX session events and their emitter.
 *
 * Every team-state mutation appends one event to the captain's Session, so
 * the web client can fold the tree view from the session log deterministically.
 * Events append to the captain's session even when a member agent performed
 * the mutation, so the captain's conversation stream stays the single
 * authoritative monitor surface.
 *
 * Events are written only for types the running harness recognizes
 * (`KNOWN_SESSION_EVENT_TYPES`, installed once at activation from
 * `@deepseek-ai/dsh-session`); disk state remains the authoritative source
 * for the activity panel either way. Containing failures: a broken durable
 * record must never break team tool execution.
 * @module dsh-teams-x/events
 */
/** Event types already reported as unsupported, to avoid repetitive logs. */
const skippedEventTypes = new Set();
let knownEventTypes;
/** Install the harness's known event-type set. Called once at activation. */
export function installKnownEventTypes(known) {
    knownEventTypes = known;
}
/**
 * Append one TeamsX event to a Session. Never throws: a broken durable
 * record must not break the tool call that produced the state change.
 * @param ctx - the plugin context (for logging).
 * @param session - the session to record into (the captain's, normally).
 * @param type - the event type.
 * @param data - the event payload (typed via the SessionEventMap merge).
 */
export function appendTeamEvent(ctx, session, type, data) {
    if (knownEventTypes?.has(type) !== true) {
        if (!skippedEventTypes.has(type)) {
            skippedEventTypes.add(type);
            ctx.logger.debug(`teams-x: session event "${type}" omitted because this harness does not recognize it`);
        }
        return;
    }
    try {
        // The SessionEventMap merge in event-types.ts registers our payloads, but
        // a union `type` cannot flow through the correlated generic signature;
        // this cast is the documented write boundary.
        session.append(type, data);
    }
    catch (error) {
        ctx.logger.warn(`teams-x: session record failed after ${type}: ${String(error)}`);
    }
}
/**
 * Resolve the captain's live Session for event recording. The captain agent
 * may be offline (its team outlives the session), in which case the caller's
 * own session is the fallback record target.
 */
export function captainSessionOf(ctx, captainSessionId, fallback) {
    const captain = ctx.agents.get(captainSessionId);
    return captain?.session ?? fallback;
}
