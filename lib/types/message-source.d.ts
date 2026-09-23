/**
 * TeamsX's declaration in the harness's merge-extensible message-source map.
 *
 * `MessageSourceMap` is open by design: each producer declares its own `kind`
 * in its own module, and consumers fall through kinds they do not know. DSH
 * 0.1.7 retired the shared catch-all `plugin` kind, so TeamsX identifies
 * itself directly and pairs that attribution with the semantic `form` the
 * harness reads.
 *
 * @module dsh-teams-x/message-source
 */
import type { ContextFormed } from '@deepseek-ai/dsh-llm';
/** Attribution for a member report delivered into the captain's next step. */
export declare const TEAMS_X_RELAY_SOURCE: {
    readonly kind: "dsh-teams-x";
    readonly form: "relay";
};
/**
 * Build attribution for a one-line TeamsX notice.
 * @param summary - concise account of the durable control event.
 * @returns TeamsX-owned notice attribution accepted by DSH V4 sessions.
 */
export declare function teamsXNoticeSource(summary: string): {
    readonly kind: "dsh-teams-x";
    readonly form: "notice";
    readonly summary: string;
};
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** Durable context produced by TeamsX. */
        'dsh-teams-x': {
            kind: 'dsh-teams-x';
        } & ContextFormed;
    }
}
