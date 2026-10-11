/**
 * The plugin's own version, as its titles show it (the right-Sidebar chip, the
 * guide capsule and the panel header).
 *
 * There is NO version literal anywhere in this repository's sources: the number
 * is authored in `package.json` alone, and the client bundle build injects it
 * here (`tsdown.config.ts` → `define`). A compile that runs without that
 * injection — a bare `tsc`, this module as the smoke test imports it — leaves
 * the value `undefined`, and the titles degrade to their plain form: a build
 * that cannot know its version says so by omission, instead of rendering a copy
 * somebody forgot to bump.
 *
 * The value has to be available synchronously: a tab chip's title is captured
 * when the tab is minted, before any state fetch could answer, which is why the
 * host cannot report it at runtime.
 * @module dsh-teams-x/client/version
 */
/** This build's version, or `undefined` when the build injected none. */
export const TEAMSX_VERSION = typeof __TEAMSX_VERSION__ === 'string' ? __TEAMSX_VERSION__ : undefined;
/**
 * Render one of those titles: the versioned form while this build knows its
 * version, the plain one otherwise. The pairs live in the dictionaries as
 * `<key>` (carrying a `{version}` placeholder) and `<key>.plain`.
 * @param translate - the plugin-namespace translate.
 * @param key - the versioned dictionary key.
 * @returns the title text.
 */
export function versionedTitle(translate, key) {
    if (TEAMSX_VERSION === undefined) {
        return translate(key === 'tab' ? 'tab.plain' : 'panel.title.plain');
    }
    return translate(key, { version: TEAMSX_VERSION });
}
