/**
 * Inline React SVG icon components for TeamsX — the only icon surface in the
 * client bundle (zero PNG). Bodies come from icon-data.ts so the standalone
 * assets/icons/*.svg exports and these components cannot drift.
 *
 * All icons inherit `currentColor`, so panel CSS themes them (active/idle/
 * muted) without per-icon styling; the animation classes used by action
 * states are defined in ActivityPanel.module.css.
 * @module dsh-teams-x/client/icons
 */
import type { ReactElement } from 'react';
export interface IconProps {
    /** Rendered size in px (default 16). */
    readonly size?: number;
    /** Extra class for state styling/animation. */
    readonly className?: string;
    /** Accessible label; defaults to the icon's own label. */
    readonly label?: string;
    /** Hide from assistive tech when the icon is purely decorative next to text. */
    readonly decorative?: boolean;
}
export type IconComponent = (props: IconProps) => ReactElement;
/** Rotate-clockwise arrow, for the panel refresh control. */
export declare const GlyphRefresh: IconComponent;
/** Two-stroke X, for the panel close control. */
export declare const GlyphClose: IconComponent;
/** Chat bubble with a progress tick, for task progress-note counts. */
export declare const GlyphProgress: IconComponent;
/** Two stroke bars, for the per-member pause control. */
export declare const GlyphPause: IconComponent;
/** Clock face, for the instrument row's elapsed reading. */
export declare const GlyphClock: IconComponent;
/** Encircled i, for the member-channel info popover trigger. */
export declare const GlyphInfo: IconComponent;
/** Mailbox tray, for the inbox line header. */
export declare const GlyphInbox: IconComponent;
export declare const TeamsXLogo: IconComponent;
export declare const RoleLead: IconComponent;
export declare const RoleResearcher: IconComponent;
export declare const RoleEngineer: IconComponent;
export declare const RoleReviewer: IconComponent;
export declare const RoleQa: IconComponent;
export declare const RoleSecurity: IconComponent;
export declare const RoleDocs: IconComponent;
export declare const RoleDesigner: IconComponent;
export declare const RoleOperator: IconComponent;
export declare const RoleData: IconComponent;
/** Role → icon map used by the roster renderer. */
export declare const ROLE_ICONS: Readonly<Record<string, IconComponent>>;
export declare const ActionWorking: IconComponent;
export declare const ActionThinking: IconComponent;
export declare const ActionReporting: IconComponent;
export declare const ActionSending: IconComponent;
export declare const ActionSleeping: IconComponent;
export declare const ActionCelebrating: IconComponent;
export declare const StatusOpen: IconComponent;
export declare const StatusRunning: IconComponent;
export declare const StatusBlocked: IconComponent;
export declare const StatusCompleted: IconComponent;
export declare const StatusFailed: IconComponent;
export declare const StatusCancelled: IconComponent;
/** Visual task state → status icon map used by the DAG renderer. */
export declare const VISUAL_STATE_ICONS: Readonly<Record<string, IconComponent>>;
/** Member activity → action icon map used by the roster renderer. */
export declare const ACTIVITY_ICONS: Readonly<Record<string, IconComponent>>;
