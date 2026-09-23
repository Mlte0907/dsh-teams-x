/**
 * In-chat TeamsX team card renderer (keyed on `conversation.chat.node`).
 *
 * Compact durable summary: lifecycle badges, roster rows (active members
 * with a child session open their transcript), and a task digest. Copy
 * reuses the panel's `teamsX` locale namespace.
 * @module dsh-teams-x/client/TeamsXCardPanel
 */
import type { ReactElement } from 'react';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Navigation injected from the plugin shell. */
export interface TeamsXCardInjected {
    readonly openMember: (parentId: string, childId: string) => void;
}
/** Complete keyed Chat renderer props. */
export type TeamsXCardPanelProps = PropsRuntime<'conversation.chat.node', 'teamsx-card'> & PropsLocale<'teamsX'> & TeamsXCardInjected;
/** The team card body. Renders nothing for an unnamed state. */
export declare function TeamsXCardPanel({ node, t, openMember }: TeamsXCardPanelProps): ReactElement;
