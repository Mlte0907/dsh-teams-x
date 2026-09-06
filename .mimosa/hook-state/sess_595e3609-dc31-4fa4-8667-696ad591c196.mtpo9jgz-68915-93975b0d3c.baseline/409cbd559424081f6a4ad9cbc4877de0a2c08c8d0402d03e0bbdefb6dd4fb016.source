/**
 * Browser plugin for the TeamsX activity panel.
 *
 * Registers the locale dictionaries and mounts the activity badge into the
 * session header's action list (`conversation.session.header.actions`, next
 * to the autonomous-mode and Session-log controls). The slot is
 * session-scoped: the framework resolves the current `sessionId`, and the
 * badge renders only when this session owns or participates in a team.
 * @module dsh-teams-x/client
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { TeamsXLocaleKey } from './locale-keys.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** TeamsX activity panel copy. */
        teamsX: TeamsXLocaleKey;
    }
}
/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation). */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
