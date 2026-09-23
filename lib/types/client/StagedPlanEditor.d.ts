import type { ReactElement } from 'react';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
import type { TeamsXLocaleKey } from './locale-keys.ts';
/** The editor's translate function (same shape the panel uses). */
type TFunc = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string;
/** The staged-plan editor: roster rows + task rows + one atomic save. */
export declare function StagedPlanEditor({ team, t, onSaved }: {
    team: TeamActivitySnapshot;
    t: TFunc;
    onSaved: () => void;
}): ReactElement;
export {};
