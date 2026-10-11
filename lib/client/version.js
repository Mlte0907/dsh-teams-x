/**
 * The plugin's own version, as its titles show it (the right-Sidebar chip, the
 * guide capsule and the panel header).
 *
 * Injected at BUILD time from `package.json` (`tsdown.config.ts` → `define`), so
 * the manifest stays the single source of truth. The value has to be available
 * synchronously: a tab chip's title is captured when the tab is MINTED — before
 * any state fetch could answer — so it cannot come from the host at runtime.
 *
 * The literal is the fallback for a compile without the define (a bare `tsc`
 * typecheck, a unit run) and must match `package.json`'s `version`.
 * @module dsh-teams-x/client/version
 */
/** This plugin's version, e.g. `0.11.3`. */
export const TEAMSX_VERSION = typeof __TEAMSX_VERSION__ === "string" ? __TEAMSX_VERSION__ : '0.11.3';
