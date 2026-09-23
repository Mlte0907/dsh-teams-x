/**
 * TeamsX's declaration in the harness's merge-extensible message-source map.
 *
 * `MessageSourceMap` is open by design: each producer declares its own `kind`
 * in its own module, and consumers fall through kinds they do not know. DSH
 * 0.1.7 retired the shared catch-all `plugin` kind, so TeamsX declares the
 * kind it has always used and pairs it with the semantic `form` the harness
 * reads: a member report reaching its captain is a `relay`, and the two
 * plan-review notes are one-off `notice` accounts.
 *
 * @module dsh-teams-x/message-source
 */
export {};
