/**
 * Browser plugin for the TeamsX activity panel and conversation cards.
 *
 * Registers the locale dictionaries, mounts the activity badge into the
 * session header's action list, folds `teamsx/*` session events into an
 * in-chat team card (ui-workflow-run pattern), and contributes the
 * `/teamsx` slash command that opens the panel. Every conversation/command
 * touchpoint is feature-detected and try-caught: on an older host the
 * header badge + panel keep working with zero regression.
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
/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation), uiConversation (card registration). */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
