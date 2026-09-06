/**
 * Conversation card for TeamsX team events.
 *
 * Matches teamsx/* session events and provides state tracking for the
 * conversation engine. Visual rendering via ConversationViewDefinition
 * is reserved for v0.2.
 * @module dsh-teams-x/client/card-definition
 */
/** Minimal ConversationNodeDefinition for TeamsX team events. */
export declare const teamsXCardDefinition: {
    kind: string;
    match(event: {
        readonly type: string;
        readonly data?: Record<string, unknown>;
    }): {
        id: string;
        role: "start";
    } | null;
    start(_context: unknown, _match: unknown, _reader: unknown): {
        __teamsxCard: boolean;
    };
    update(_context: unknown, _match: unknown): undefined;
};
