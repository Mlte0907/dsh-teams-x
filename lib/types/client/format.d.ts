/**
 * Shared formatting and translate helpers for the TeamsX client surfaces.
 * @module dsh-teams-x/client/format
 */
import type { TeamsXLocaleKey } from './locale-keys.ts';
/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string;
/** Interpolate `{key}` params into a locale string. */
export declare function format(template: string, params: Record<string, string | number> | undefined): string;
/** Wrap the harness translate function with interpolation. */
export declare function makeT(t: PanelTranslate): (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string;
/** The interpolated translate shape shared by every panel subcomponent. */
export type Translate = ReturnType<typeof makeT>;
/** Compact token formatter: 1234 → 1.2k, 45600 → 45.6k. */
export declare function formatTokens(n: number): string;
/** Humanize a millisecond duration for the task-age badge. */
export declare function formatElapsed(ms: number): string;
