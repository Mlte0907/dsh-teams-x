/**
 * Single source of truth for every TeamsX icon — all SVG, zero PNG.
 *
 * Each entry is the inner markup of a 24×24 stroke icon. `icons.tsx` renders
 * these inline as React components (currentColor-themable, CSS-animatable);
 * `scripts/export-icons.mjs` wraps the same bodies into standalone
 * `assets/icons/*.svg` files for README and marketplace use. Editing a path
 * here updates both surfaces on the next build.
 * @module dsh-teams-x/client/icon-data
 */
export interface IconDefinition {
    /** Human label used by the exporter and accessibility text. */
    readonly label: string;
    /** Inner SVG markup (stroke style; the shell supplies svg/attrs). */
    readonly body: string;
}
/** Shared stroke attributes applied by the shell to every icon. */
export declare const ICON_STROKE: {
    readonly width: 1.8;
    readonly linecap: "round";
    readonly linejoin: "round";
};
export declare const ICONS: Readonly<Record<string, IconDefinition>>;
/** Team status icons used by the panel header and task rows. */
export declare const STATUS_ICONS: Readonly<Record<string, IconDefinition>>;
