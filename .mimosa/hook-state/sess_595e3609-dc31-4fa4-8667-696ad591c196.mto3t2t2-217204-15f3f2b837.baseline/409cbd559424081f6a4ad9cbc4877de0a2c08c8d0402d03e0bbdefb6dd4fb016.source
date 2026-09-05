/**
 * Browser plugin for the TeamsX activity panel.
 *
 * Registers the locale dictionaries and mounts the activity panel in the
 * shell's additive overlay slot. Leaner than the reference client: one panel,
 * one slot, one card — no conversation-node card in v0.1 (roadmap item).
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
/** Required services: slots (mount point) and locale (dictionaries). */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
