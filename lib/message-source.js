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
/** Attribution for a member report delivered into the captain's next step. */
export const TEAMS_X_RELAY_SOURCE = { kind: 'dsh-teams-x', form: 'relay' };
/**
 * Build attribution for a one-line TeamsX notice.
 * @param summary - concise account of the durable control event.
 * @returns TeamsX-owned notice attribution accepted by DSH V4 sessions.
 */
export function teamsXNoticeSource(summary) {
    return { kind: 'dsh-teams-x', form: 'notice', summary };
}
