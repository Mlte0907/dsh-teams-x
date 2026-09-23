/**
 * Pure fold logic for the TeamsX conversation card.
 *
 * Zero imports — no React, no host packages, no CSS — so the host test
 * suite can exercise the exact same state machine the browser bundle runs
 * (full-functional-test.mjs imports the compiled output directly).
 * @module dsh-teams-x/client/card-state
 */
/** Lifecycle phase of the card, derived from session events. */
export type TeamsXCardPhase = 'staged' | 'running' | 'deleted';
/** One member row of the card. */
export interface TeamsXCardMember {
    readonly name: string;
    readonly role?: string;
    /** Child session id when the member was spawned (absent while staged). */
    readonly childId?: string;
    readonly status: 'active' | 'removed';
}
/** One task row of the card. */
export interface TeamsXCardTask {
    readonly id: string;
    readonly subject: string;
    readonly status: string;
    readonly assignee?: string;
    /** Repair round (>=1 after the first automatic repair derivation). */
    readonly round?: number;
    /** Shadow-takeover marker folded from task-updated events. */
    readonly takenOverBy?: 'captain';
}
/** Card state == the keyed Chat payload (`ChatNodeDataMap['teamsx-card']`). */
export interface TeamsXCardData {
    readonly name: string;
    readonly captainSessionId: string;
    readonly phase: TeamsXCardPhase;
    readonly halted: boolean;
    readonly members: readonly TeamsXCardMember[];
    readonly tasks: readonly TeamsXCardTask[];
}
/** Every session event type the card folds. */
export declare const TEAMSX_CARD_EVENT_TYPES: readonly string[];
/**
 * Resolve the assembler match for one session event: only `team-created`
 * starts a card; every other TeamsX event updates the team it names.
 * Returns null for foreign events and malformed payloads.
 */
export declare function teamsXCardMatchRole(eventType: string, data: unknown): {
    id: string;
    role: 'start' | 'update';
} | null;
/** Initial card state from the `team-created` payload. */
export declare function teamsXCardStart(data: unknown): TeamsXCardState;
export interface TeamsXCardState extends TeamsXCardData {
}
/**
 * Fold one update event into the card state. Never returns undefined —
 * the conversation assembler fails loud on `update() -> undefined`.
 */
export declare function teamsXCardUpdate(state: TeamsXCardState, eventType: string, data: unknown): TeamsXCardState;
