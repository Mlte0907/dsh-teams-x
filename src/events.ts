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

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { TeamsXEventType } from './event-types.ts'

/** Event types already reported as unsupported, to avoid repetitive logs. */
const skippedEventTypes = new Set<TeamsXEventType>()

let knownEventTypes: ReadonlySet<string> | undefined

/** Install the harness's known event-type set. Called once at activation. */
export function installKnownEventTypes(known: ReadonlySet<string> | undefined): void {
  knownEventTypes = known
}

/**
 * Append one TeamsX event to a Session. Never throws: a broken durable
 * record must not break the tool call that produced the state change.
 * @param ctx - the plugin context (for logging).
 * @param session - the session to record into (the captain's, normally).
 * @param type - the event type.
 * @param data - the event payload (typed via the SessionEventMap merge).
 */
export function appendTeamEvent(
  ctx: Context,
  session: Session,
  type: TeamsXEventType,
  data: Parameters<Session['append']>[1],
): void {
  if (knownEventTypes?.has(type) !== true) {
    if (!skippedEventTypes.has(type)) {
      skippedEventTypes.add(type)
      ctx.logger.debug(`teams-x: session event "${type}" omitted because this harness does not recognize it`)
    }
    return
  }
  try {
    // The SessionEventMap merge in event-types.ts registers our payloads, but
    // a union `type` cannot flow through the correlated generic signature;
    // this cast is the documented write boundary.
    (session.append as unknown as (t: string, d: unknown) => unknown)(type, data)
  } catch (error: unknown) {
    ctx.logger.warn(`teams-x: session record failed after ${type}: ${String(error)}`)
  }
}

/**
 * Resolve the captain's live Session for event recording. The captain agent
 * may be offline (its team outlives the session), in which case the caller's
 * own session is the fallback record target.
 */
export function captainSessionOf(
  ctx: Context,
  captainSessionId: string,
  fallback: Session,
): Session {
  const captain = ctx.agents.get(captainSessionId as SessionId)
  return captain?.session ?? fallback
}

/** Max message content carried in session events; the full text stays in the mailbox. */
export const MESSAGE_EVENT_CONTENT_MAX_CHARS = 240

/**
 * Truncate message content for durable session-event payloads. The mailbox
 * JSONL is the full-text store; the captain's session log only needs an
 * audit excerpt, or every long member report doubles the session file.
 */
export function messageEventContent(content: string): string {
  return content.length <= MESSAGE_EVENT_CONTENT_MAX_CHARS
    ? content
    : `${content.slice(0, MESSAGE_EVENT_CONTENT_MAX_CHARS)}…[截断 ${content.length - MESSAGE_EVENT_CONTENT_MAX_CHARS} 字，全文见邮箱]`
}
