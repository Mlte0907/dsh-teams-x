/**
 * Global hint host for the `/teamsx` empty-state fallback.
 *
 * Mounted via the `sidebar.footer.action` slot (root scope, always present),
 * this component subscribes to the open-request unclaimed channel. When
 * `/teamsx` is invoked but no ActivityPanel is mounted to claim it (e.g. the
 * host home screen), a fixed-position overlay appears with a guidance message
 * and auto-dismisses after 6 seconds. Repeated triggers reset the timer
 * (renewal, not stacking).
 * @module dsh-teams-x/client/hint-host
 */
import type { ReactElement } from 'react';
import type { TeamsXLocaleKey } from './locale-keys.ts';
export interface TeamsXHintHostProps {
    /** Host sidebar.footer.action owner prop: wide/narrow layout signal. */
    wide: boolean;
    /** Locale translation seat (same namespace as ActivityPanel). */
    t: (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string;
}
export declare function TeamsXHintHost(props: TeamsXHintHostProps): ReactElement | null;
