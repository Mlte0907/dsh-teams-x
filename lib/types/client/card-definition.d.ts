/**
 * Conversation node definition for the TeamsX team card.
 *
 * Folds the 11 `teamsx/*` session event types into one keyed Chat node per
 * team (`target: 'chat'`), following the ui-workflow-run pattern. All state
 * logic lives in the zero-dependency card-state module; this file only
 * adapts it to the conversation assembler contract.
 * @module dsh-teams-x/client/card-definition
 */
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client';
import { type TeamsXCardState } from './card-state.ts';
/** The card payload carried by every rendered Chat node. */
export type TeamsXCardData = TeamsXCardState;
declare module '@deepseek-ai/dsh-client-ui-chat/client' {
    interface ChatNodeDataMap {
        /** Durable team card: roster, tasks, and lifecycle phase. */
        'teamsx-card': TeamsXCardData;
    }
}
/**
 * The assembler-facing definition. `update()` always returns a state object
 * (the assembler fails loud on undefined), and `buildViewNode` returns null
 * only when the window does not contain the creating event.
 */
export declare const teamsXCardDefinition: ConversationNodeDefinition<TeamsXCardState>;
