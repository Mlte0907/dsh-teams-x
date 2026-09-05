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
import type { Context } from '@deepseek-ai/cordis';
import type { Session } from '@deepseek-ai/dsh-session';
import type { TeamsXEventType } from './event-types.ts';
/** Install the harness's known event-type set. Called once at activation. */
export declare function installKnownEventTypes(known: ReadonlySet<string> | undefined): void;
/**
 * Append one TeamsX event to a Session. Never throws: a broken durable
 * record must not break the tool call that produced the state change.
 * @param ctx - the plugin context (for logging).
 * @param session - the session to record into (the captain's, normally).
 * @param type - the event type.
 * @param data - the event payload (typed via the SessionEventMap merge).
 */
export declare function appendTeamEvent(ctx: Context, session: Session, type: TeamsXEventType, data: Parameters<Session['append']>[1]): void;
/**
 * Resolve the captain's live Session for event recording. The captain agent
 * may be offline (its team outlives the session), in which case the caller's
 * own session is the fallback record target.
 */
export declare function captainSessionOf(ctx: Context, captainSessionId: string, fallback: Session): Session;
